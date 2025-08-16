import { openWindowAtRandom } from './windows.js';
import { init, animate } from './background.js';
import { openMusicPlayer, initializeBackgroundMusic } from './musicPlayer.js';
import { loadSvgIcon } from './utils.js';

const iconCache = new Map();

async function getCachedIcon(iconName) {
  if (!iconCache.has(iconName)) {
    iconCache.set(iconName, await loadSvgIcon(iconName));
  }
  return iconCache.get(iconName);
}

const CONTACT_CARDS = [
  {
    id: '#email-contact-card',
    title: 'Email',
    content: 'Contact me at: <a href="mailto:hashys12@gmail.com">hashys12@gmail.com</a>',
    icon: 'email.svg'
  },
  {
    id: '#github-contact-card', 
    title: 'Github',
    content: 'Check out my GitHub repositories: <a href="https://github.com/Hashyies" target="_blank">github.com/Hashyies</a>',
    icon: 'github.svg'
  },
  {
    id: '#discord-contact-card',
    title: 'Discord', 
    content: 'My Discord username is: @hashys',
    icon: 'discord.svg'
  },
  {
    id: '#grill-img',
    title: 'THE CUTEST GIRL',
    content: '<a href="https://github.com/yemss" target="_blank">Yemss</a> is the cutest girl on the planet frfr',
    icon: 'heart.svg'
  }
];

const AUTO_WINDOWS = [
  {
    delay: 0,
    title: "GitHub Activity", 
    getContent: async () => {
      try {
        const commits = await getTotalCommitsLastMonth("Hashyies");
        return `<strong>Hashyies</strong> has made <strong>${commits}</strong> commits in the last month! Now that's dedication!`;
      } catch (error) {
        console.error(`Failed to fetch commit data: ${error.message}`);
        return "GitHub activity unavailable at the moment.";
      }
    },
    icon: "github.svg"
  },
  {
    delay: 0,
title: "Join My Discord Server",
    getContent: () => `
      <div style="text-align: center; padding: 10px;">
        <p style="color: #e0aaff; font-size: 18px; margin-bottom: 20px; text-shadow: 0 0 10px rgba(224, 170, 255, 0.5);">
          Please join my Discord server &lt;3
        </p>
        <button onclick="window.open('https://discord.gg/Kr7qvutZ4N', '_blank')" 
                style="
                  background: linear-gradient(135deg, #9d4edd, #c77dff);
                  border: 2px solid rgba(157, 78, 221, 0.8);
                  border-radius: 12px;
                  padding: 12px 24px;
                  color: #f5f5f7;
                  font-size: 16px;
                  font-family: 'Quicksand', sans-serif;
                  font-weight: 600;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  transition: all 0.3s ease;
                  box-shadow: 0 4px 15px rgba(157, 78, 221, 0.4);
                  text-shadow: 0 0 5px rgba(245, 245, 247, 0.3);
                  backdrop-filter: blur(5px);
                  -webkit-backdrop-filter: blur(5px);
                  margin: 0 auto;
                  min-width: fit-content;
                "
                onmouseover="
                  this.style.transform = 'translateY(-2px) scale(1.05)';
                  this.style.boxShadow = '0 8px 25px rgba(157, 78, 221, 0.6), 0 0 40px rgba(157, 78, 221, 0.3)';
                  this.style.background = 'linear-gradient(135deg, #c77dff, #e0aaff)';
                  this.style.borderColor = 'rgba(224, 170, 255, 0.9)';
                "
                onmouseout="
                  this.style.transform = 'translateY(0px) scale(1)';
                  this.style.boxShadow = '0 4px 15px rgba(157, 78, 221, 0.4)';
                  this.style.background = 'linear-gradient(135deg, #9d4edd, #c77dff)';
                  this.style.borderColor = 'rgba(157, 78, 221, 0.8)';
                ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="filter: drop-shadow(0 0 5px rgba(245, 245, 247, 0.3));">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
          Join Discord Server
        </button>
      </div>
    `,
    icon: "discord.svg"
  }
];

async function initializeContactCards() {
  const promises = CONTACT_CARDS.map(async ({ id, title, content, icon }) => {
    const card = document.querySelector(id);
    if (!card) {
      console.warn(`Contact card not found: ${id}`);
      return;
    }

    const iconData = await getCachedIcon(icon);
    card.addEventListener('click', () => {
      openWindowAtRandom(title, content, iconData);
    });
  });

  await Promise.all(promises);
}

async function initializeAutoWindows() {
  const promises = AUTO_WINDOWS.map(async ({ delay, title, getContent, icon }) => {
    setTimeout(async () => {
      const content = typeof getContent === 'function' ? await getContent() : getContent();
      const iconData = await getCachedIcon(icon);
      openWindowAtRandom(title, content, iconData);
    }, delay);
  });

  await Promise.allSettled(promises);
}

async function getTotalCommitsLastMonth(username) {
  const now = new Date();
  const oneMonthAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

  try {
    const response = await fetch(`https://api.github.com/users/${username}/events/public`);
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const events = await response.json();
    
    return events
      .filter(event => event.type === "PushEvent" && new Date(event.created_at) > oneMonthAgo)
      .reduce((total, event) => total + event.payload.commits.length, 0);
      
  } catch (error) {
    console.error("Error fetching commits:", error);
    return 0;
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  init();
  animate();
  initializeBackgroundMusic();

  await Promise.allSettled([
    initializeAutoWindows(),
    initializeContactCards()
  ]);
});

window.openWindowAtRandom = openWindowAtRandom;
window.openMusicPlayer = openMusicPlayer;