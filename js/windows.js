let windowZIndex = 1000;

export function openWindowAtRandom(title, content) {
  const existingWindow = document.querySelector(`.window[data-title="${title}"]`);
  if (existingWindow) existingWindow.remove();

  const windowEl = document.createElement('div');
  windowEl.className = 'window';
  windowEl.setAttribute('data-title', title);

  windowEl.innerHTML = `
    <div class="window-header">
      <div class="window-title">${title}</div>
      <button class="window-close">&times;</button>
    </div>
    <div class="window-content">${content}</div>
  `;

  // Temporarily add to DOM with visibility hidden to measure size
  windowEl.style.visibility = 'hidden';
  windowEl.style.position = 'absolute';
  windowEl.style.left = '0px';
  windowEl.style.top = '0px';
  document.body.appendChild(windowEl);

  // Get the actual dimensions of the window
  const windowWidth = windowEl.offsetWidth;
  const windowHeight = windowEl.offsetHeight;

  // Calculate safe positioning bounds based on actual window size
  const minMargin = 10; // Minimum distance from edges
  const maxX = Math.max(minMargin, window.innerWidth - windowWidth - minMargin);
  const maxY = Math.max(minMargin, window.innerHeight - windowHeight - minMargin);

  // Generate random position within safe bounds
  const posX = Math.max(minMargin, Math.floor(Math.random() * maxX));
  const posY = Math.max(minMargin, Math.floor(Math.random() * maxY));

  // Apply the calculated position and make visible
  windowEl.style.left = posX + 'px';
  windowEl.style.top = posY + 'px';
  windowEl.style.visibility = 'visible';

  // Set initial z-index and make it the top window
  windowEl.style.zIndex = ++windowZIndex;

  windowEl.addEventListener('mousedown', function () {
    bringWindowToFront(windowEl);
  });

  makeWindowDraggable(windowEl);

  const closeBtn = windowEl.querySelector('.window-close');

  closeBtn.addEventListener('click', (e) => {
    windowEl.remove();

    if (title === 'Music Player') {
      musicPlayer = null;
    }
  });

  return windowEl;
}

function bringWindowToFront(windowEl) {
  windowEl.style.zIndex = ++windowZIndex;
}

function makeWindowDraggable(windowEl) {
  const header = windowEl.querySelector('.window-header');
  let isDragging = false;
  let offsetX, offsetY;

  header.addEventListener('mousedown', startDrag);
  header.addEventListener('touchstart', startDrag);

  function startDrag(e) {
    if (e.target.closest('.window-close')) return;

    e.preventDefault();
    isDragging = true;

    bringWindowToFront(windowEl);

    if (e.type === 'mousedown') {
      offsetX = e.clientX - windowEl.offsetLeft;
      offsetY = e.clientY - windowEl.offsetTop;
      document.addEventListener('mousemove', drag);
      document.addEventListener('mouseup', stopDrag);
    } else if (e.type === 'touchstart') {
      offsetX = e.touches[0].clientX - windowEl.offsetLeft;
      offsetY = e.touches[0].clientY - windowEl.offsetTop;
      document.addEventListener('touchmove', drag);
      document.addEventListener('touchend', stopDrag);
    }
  }

  function drag(e) {
    if (!isDragging) return;
    e.preventDefault();

    let clientX, clientY;
    if (e.type === 'mousemove') {
      clientX = e.clientX;
      clientY = e.clientY;
    } else if (e.type === 'touchmove') {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    let newLeft = clientX - offsetX;
    let newTop = clientY - offsetY;

    const maxX = window.innerWidth - windowEl.offsetWidth;
    const maxY = window.innerHeight - windowEl.offsetHeight;

    newLeft = Math.max(0, Math.min(newLeft, maxX));
    newTop = Math.max(0, Math.min(newTop, maxY));

    windowEl.style.left = newLeft + 'px';
    windowEl.style.top = newTop + 'px';
  }

  function stopDrag() {
    isDragging = false;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('touchend', stopDrag);
  }
}
