let windowZIndex = 1000;
const minimizedWindows = new Set();

export function openWindowAtRandom(title, content, iconUrl = null) {
  document.querySelector(`.window[data-title="${title}"]`)?.remove();
  
  const iconHtml = iconUrl ? `<img src="${iconUrl}" alt="" class="window-icon">` : '';
  
  const windowEl = document.createElement('div');
  Object.assign(windowEl, {
    className: 'window window-opening',
    innerHTML: `
      <div class="window-header">
        <div class="window-title-container">
          ${iconHtml}
          <div class="window-title">${title}</div>
        </div>
        <div class="window-controls">
          <button class="window-minimize" title="Minimize">_</button>
          <button class="window-close" title="Close">&times;</button>
        </div>
      </div>
      <div class="window-content">${content}</div>
    `
  });
  windowEl.dataset.title = title;
  
  positionWindowRandomly(windowEl);
  
  setTimeout(() => windowEl.classList.remove('window-opening'), 300);
  
  windowEl.addEventListener('mousedown', () => bringToFront(windowEl));
  windowEl.querySelector('.window-close').addEventListener('click', () => closeWindow(windowEl, title));
  windowEl.querySelector('.window-minimize').addEventListener('click', () => minimizeWindow(windowEl, title));
  
  makeDraggable(windowEl);
  
  return windowEl;
}

function closeWindow(windowEl, title) {
  windowEl.classList.add('window-closing');
  minimizedWindows.delete(title);
  
  const taskbarItem = document.querySelector(`.taskbar-item[data-title="${title}"]`);
  if (taskbarItem) {
    taskbarItem.remove();
    updateTaskbarVisibility();
  }
  
  if (title === 'Music Player') {
    window.musicPlayer = null;
  }
  
  setTimeout(() => windowEl.remove(), 200);
}

function minimizeWindow(windowEl, title) {
  windowEl.classList.add('window-minimizing');
  
  setTimeout(() => {
    windowEl.classList.add('minimized');
    windowEl.classList.remove('window-minimizing');
    minimizedWindows.add(title);
    createTaskbarItem(windowEl, title);
  }, 200);
}

function restoreWindow(windowEl, title) {
  windowEl.classList.add('window-restoring');
  windowEl.classList.remove('minimized');
  
  setTimeout(() => {
    windowEl.classList.remove('window-restoring');
    minimizedWindows.delete(title);
    bringToFront(windowEl);
  }, 200);
  
  const taskbarItem = document.querySelector(`.taskbar-item[data-title="${title}"]`);
  if (taskbarItem) {
    taskbarItem.remove();
    updateTaskbarVisibility();
  }
}

function createTaskbarItem(windowEl, title) {
  document.querySelector(`.taskbar-item[data-title="${title}"]`)?.remove();
  
  let taskbar = document.querySelector('.taskbar');
  if (!taskbar) {
    taskbar = document.createElement('div');
    taskbar.className = 'taskbar';
    document.body.appendChild(taskbar);
  }
  
  const iconUrl = windowEl.querySelector('.window-icon')?.src;
  const iconHtml = iconUrl ? `<img src="${iconUrl}" alt="" class="taskbar-icon">` : '';
  
  const taskbarItem = document.createElement('div');
  taskbarItem.className = 'taskbar-item taskbar-item-entering';
  taskbarItem.dataset.title = title;
  taskbarItem.innerHTML = `${iconHtml}<span class="taskbar-title">${title}</span>`;
  
  taskbarItem.addEventListener('click', () => restoreWindow(windowEl, title));
  
  taskbar.appendChild(taskbarItem);
  
  setTimeout(() => taskbarItem.classList.remove('taskbar-item-entering'), 200);
  
  updateTaskbarVisibility();
}

function updateTaskbarVisibility() {
  const taskbar = document.querySelector('.taskbar');
  if (!taskbar) return;
  
  const items = taskbar.querySelectorAll('.taskbar-item');
  if (items.length === 0) {
    taskbar.classList.add('taskbar-hiding');
    setTimeout(() => {
      if (taskbar.querySelectorAll('.taskbar-item').length === 0) {
        taskbar.remove();
      }
    }, 300);
  } else {
    taskbar.classList.remove('taskbar-hiding');
    taskbar.classList.add('taskbar-visible');
  }
}

function positionWindowRandomly(windowEl) {
  Object.assign(windowEl.style, {
    position: 'absolute',
    visibility: 'hidden',
    left: '0px',
    top: '0px',
    zIndex: ++windowZIndex
  });
  
  document.body.appendChild(windowEl);
  
  const { offsetWidth: width, offsetHeight: height } = windowEl;
  const margin = 10;
  const maxX = Math.max(margin, window.innerWidth - width - margin);
  const maxY = Math.max(margin, window.innerHeight - height - margin);
  
  Object.assign(windowEl.style, {
    left: `${Math.max(margin, Math.random() * maxX)}px`,
    top: `${Math.max(margin, Math.random() * maxY)}px`,
    visibility: 'visible'
  });
}

function bringToFront(windowEl) {
  windowEl.style.zIndex = ++windowZIndex;
}

function makeDraggable(windowEl) {
  const header = windowEl.querySelector('.window-header');
  let dragState = null;

  const handleStart = (e) => {
    if (e.target.closest('.window-controls')) return;
    
    e.preventDefault();
    bringToFront(windowEl);
    
    const clientX = e.clientX ?? e.touches[0].clientX;
    const clientY = e.clientY ?? e.touches[0].clientY;
    
    dragState = {
      offsetX: clientX - windowEl.offsetLeft,
      offsetY: clientY - windowEl.offsetTop,
      startX: windowEl.offsetLeft,
      startY: windowEl.offsetTop
    };
    
    const isTouch = e.type === 'touchstart';
    const moveEvent = isTouch ? 'touchmove' : 'mousemove';  
    const endEvent = isTouch ? 'touchend' : 'mouseup';
    
    document.addEventListener(moveEvent, handleMove, { passive: false });
    document.addEventListener(endEvent, handleEnd);
    
    windowEl.classList.add('dragging');
  };
  
  const handleMove = (e) => {
    if (!dragState) return;
    
    e.preventDefault();
    
    const clientX = e.clientX ?? e.touches[0].clientX;
    const clientY = e.clientY ?? e.touches[0].clientY;
    
    const newLeft = Math.max(0, Math.min(
      clientX - dragState.offsetX,
      window.innerWidth - windowEl.offsetWidth
    ));
    
    const newTop = Math.max(0, Math.min(
      clientY - dragState.offsetY,
      window.innerHeight - windowEl.offsetHeight
    ));
    
    windowEl.style.left = `${newLeft}px`;
    windowEl.style.top = `${newTop}px`;
  };
  
  const handleEnd = () => {
    if (!dragState) return;
    
    windowEl.classList.remove('dragging');
    dragState = null;
    
    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('mouseup', handleEnd);
    document.removeEventListener('touchmove', handleMove);
    document.removeEventListener('touchend', handleEnd);
  };
  
  header.addEventListener('mousedown', handleStart);
  header.addEventListener('touchstart', handleStart, { passive: false });
}