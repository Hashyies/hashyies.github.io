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
    delay: 500,
    title: "Latest Project",
    getContent: () => "Check out my new Discord bot: <a href='https://discord.com/oauth2/authorize?client_id=1026903036959932416&permissions=8&scope=applications.commands%20bot' target='_blank'>MediaRoulette</a> or view the <a href='https://github.com/Hashyies/MediaRoulette' target='_blank'>source code</a>!",
    icon: "discord.svg"
  },
  {
    delay: 1000,
    title: "Let's Connect!",
    getContent: () => "Looking to collaborate on a project? I'm open to new opportunities! Contact me on Discord or Email to discuss details. I currently do commissions free of charge!",
    icon: "user.svg"
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
      const content = typeof getContent === 'function' ? await getContent() : getContent;
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