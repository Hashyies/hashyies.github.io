document.addEventListener("DOMContentLoaded", async function() {
  try {
    const commits = await getTotalCommitsLastMonth("Hashyies");
    addWindow("Wait... Commits...", `Hashyies has made **${commits}** commits last month! Now that is cool...`);
  } catch (error) {
    addWindow("Error", `An error occurred while fetching commit data: ${error.message}`);
  }
  addWindow("I just made a new bot!", "Want to try your luck? [Then invite my bot by risking images!](https://discord.com/oauth2/authorize?client_id=1026903036959932416&permissions=8&scope=applications.commands%20bot) or [Check out the code behind it!](https://github.com/Hashyies/MediaRoulette)");
  addWindow("Hey you! Read me!", "Want to collaborate or invite me to any project? Contact me on Discord or Email so we could discuss the details! I do comissions free of charge at the moment!");
});

async function getTotalCommitsLastMonth(owner) {
  // Get list of all repositories owned by user
  const reposUrl = `https://api.github.com/users/${owner}/repos`;
  const reposResponse = await fetch(reposUrl);
  if (!reposResponse.ok) {
    throw new Error(`Failed to fetch repositories: ${reposResponse.status} ${reposResponse.statusText}`);
  }
  const reposData = await reposResponse.json();
  const repoNames = reposData.map(repo => repo.name);

  // Get number of commits for each repository
  let totalCommits = 0;
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  const since = date.toISOString();
  for (const repo of repoNames) {
    const url = `https://api.github.com/repos/${owner}/${repo}/commits?since=${since}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch commits: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    totalCommits += data.length;
  }

  return totalCommits;
}


function addWindow(title, text, color, location) {
  // Create window element
  var windowElem = document.createElement('div');
  windowElem.classList.add('window');

  // Set color
  if (color) {
    windowElem.style.backgroundColor = color;
  } else {
    windowElem.style.backgroundColor = getRandomColor();
  }

  // Set location
  if (location) {
    windowElem.style.left = location.x + 'px';
    windowElem.style.top = location.y + 'px';
  } else {
    var randomLocation = getRandomLocation();
    windowElem.style.left = randomLocation.x + 'px';
    windowElem.style.top = randomLocation.y + 'px';
  }

  // Create header element
  var headerElem = document.createElement('div');
  headerElem.classList.add('header');
  headerElem.innerHTML = parseMarkdown(title);


  // Create close button
  var closeBtn = document.createElement('span');
  closeBtn.textContent = 'x';
  closeBtn.onclick = function() {
    document.body.removeChild(windowElem);
  };
  headerElem.appendChild(closeBtn);

  // Create body element
  var bodyElem = document.createElement('div');
  bodyElem.classList.add('body');
  bodyElem.innerHTML = parseMarkdown(text);

  // Append elements
  windowElem.appendChild(headerElem);
  windowElem.appendChild(bodyElem);

  // Make window movable
  // Make window movable
  var isDragging = false;
  var currentX;
  var currentY;
  var initialX;
  var initialY;
  var xOffset = 0;
  var yOffset = 0;

  headerElem.addEventListener("mousedown", dragStart, false);
  document.addEventListener("mouseup", dragEnd, false);
  document.addEventListener("mousemove", drag, false);

  var zIndex = 1;

  function dragStart(e) {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;

    if (e.target === headerElem) {
      isDragging = true;
      windowElem.style.zIndex = zIndex++;
    }
  }

  function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;

    isDragging = false;
  }

  function drag(e) {
    if (isDragging) {
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;

      xOffset = currentX;
      yOffset = currentY;

      setTranslate(currentX, currentY, windowElem);
    }
  }

  function setTranslate(xPos, yPos, el) {
    el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
  }
  document.body.appendChild(windowElem);
  setTextColor(windowElem, headerElem, bodyElem);
  // Set header background color
  shadeColor(headerElem, windowElem, -0.35);

}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getRandomLocation() {
  var x = Math.floor(Math.random() * (window.innerWidth - 200));
  var y = Math.floor(Math.random() * (window.innerHeight - 150));
  return { x: x, y: y };
}

function setTextColor(windowElem, headerElem, bodyElem) {
  var bgColor = window.getComputedStyle(windowElem).backgroundColor;
  bgColor = bgColor.split('(')[1].split(')')[0].split(',');
  var r = parseInt(bgColor[0]);
  var g = parseInt(bgColor[1]);
  var b = parseInt(bgColor[2]);
  var brightness = (r * 299 + g * 587 + b * 114) / 1000;
  if (brightness < 128) {
    headerElem.style.color = 'white';
    bodyElem.style.color = 'white';
  }
}

function parseMarkdown(text) {
  text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  text = text.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  text = text.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');
  text = text.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  text = text.replace(/\*(.+?)\*/g, '<i>$1</i>');
  text = text.replace(/~~(.+?)~~/g, '<del>$1</del>');
  text = text.replace(/__(.+?)__/g, '<u>$1</u>');
  text = text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  text = text.replace(/\n$/gim, '<br />');
  return text;
}

/*function shadeColor(color, percent) {
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}*/

function shadeColor(headerElem, windowElem, percent) {
  var bgColor = window.getComputedStyle(windowElem).backgroundColor;
  bgColor = bgColor.split('(')[1].split(')')[0].split(',');
  var r = parseInt(bgColor[0]);
  var g = parseInt(bgColor[1]);
  var b = parseInt(bgColor[2]);
  r = Math.round((1 + percent) * r);
  g = Math.round((1 + percent) * g);
  b = Math.round((1 + percent) * b);
  rb = Math.round((1 + percent * percent) * r);
  gb = Math.round((1 + percent * percent) * g);
  bb = Math.round((1 + percent * percent) * b);
  headerElem.style.backgroundColor = 'rgb(' + r + ',' + g + ',' + b + ')';
}
