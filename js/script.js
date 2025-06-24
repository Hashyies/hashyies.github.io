import { openWindowAtRandom } from './windows.js'
import { init, animate } from './background.js'

let audio = new Audio();
let currentSongIndex = 0;
let isPlaying = false;
let musicPlayer = null;
let playbackInitialized = false;
let autoplayAttempted = false;

async function loadPlaylist() {
  try {
    const response = await fetch("./music/music.json");
    const data = await response.json();
    return data.tracks;
  } catch (error) {
    console.error("Failed to load playlist:", error);
    return [];
  }
}

let playlist = null;

document.addEventListener("DOMContentLoaded", async function () {

  // Background
  init();
  animate();

  playlist = await loadPlaylist();

  initializeBackgroundMusic();

  try {
    const commits = await getTotalCommitsLastMonth("Hashyies");
    openWindowAtRandom("GitHub Activity", `<strong>Hashyies</strong> has made <strong>${commits}</strong> commits in the last month! Now that's dedication!`);
  } catch (error) {
    console.error(`Failed to fetch commit data: ${error.message}`);
  }

  setTimeout(() => {
    openWindowAtRandom("Latest Project", "Check out my new Discord bot: <a href='https://discord.com/oauth2/authorize?client_id=1026903036959932416&permissions=8&scope=applications.commands%20bot' target='_blank'>MediaRoulette</a> or view the <a href='https://github.com/Hashyies/MediaRoulette' target='_blank'>source code</a>!");
  }, 500);

  setTimeout(() => {
    openWindowAtRandom("Let's Connect!", "Looking to collaborate on a project? I'm open to new opportunities! Contact me on Discord or Email to discuss details. I currently do commissions free of charge!");
  }, 100);
});

function tryAutoplay() {
  if (autoplayAttempted) return;

  const interactionEvents = ['click', 'touchstart', 'keydown'];
  const autoplayHandler = () => {
    if (!isPlaying) {
      audio.play().then(() => {
        isPlaying = true;
      }).catch(error => {
        console.warn("Autoplay still failed after user interaction:", error);
      });
    }
    interactionEvents.forEach(event => document.removeEventListener(event, autoplayHandler));
  };

  interactionEvents.forEach(event => document.addEventListener(event, autoplayHandler));

  audio.play().then(() => {
    isPlaying = true;
    interactionEvents.forEach(event => document.removeEventListener(event, autoplayHandler));
  }).catch(() => { });

  autoplayAttempted = true;
}

function setupAudioEventListeners() {
  audio.addEventListener('ended', nextSong);
  audio.addEventListener('error', nextSong);
  audio.volume = 0.5;
}



function openMusicPlayer() {
  const playerWindow = openWindowAtRandom('Music Player', createMusicPlayerHTML());
  musicPlayer = playerWindow;

  if (!playbackInitialized) {
    initializeBackgroundMusic();
  }

  setupMusicPlayerEvents();
  updatePlayerUI();
}

function updatePlayerUI() {
  if (!musicPlayer) return;

  const playIcon = musicPlayer.querySelector('#play-icon');
  if (playIcon) {
    if (isPlaying) {
      playIcon.outerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="play-icon">
        <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
      </svg>`;
    } else {
      playIcon.outerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="play-icon">
        <path fill="currentColor" d="M8 5v14l11-7z"/>
      </svg>`;
    }
  }

  const volumeLevel = musicPlayer.querySelector('#volume-level');
  if (volumeLevel) {
    volumeLevel.style.width = `${audio.volume * 100}%`;
  }

  if (audio.duration) {
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    const progress = musicPlayer.querySelector('#progress');
    if (progress) {
      progress.style.width = `${progressPercent}%`;
    }

    const minutes = Math.floor(audio.currentTime / 60);
    const seconds = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
    const currentTimeElement = musicPlayer.querySelector('#current-time');
    if (currentTimeElement) {
      currentTimeElement.textContent = `${minutes}:${seconds}`;
    }
  }
}

function createMusicPlayerHTML() {
  let playlistHTML = '';
  playlist.forEach((song, index) => {
    playlistHTML += `
      <div class="playlist-item ${index === currentSongIndex ? 'active' : ''}" data-index="${index}">
        <div class="playlist-item-title">${song.title}</div>
        <div class="playlist-item-duration">${song.duration}</div>
      </div>
    `;
  });

  const currentSong = playlist[currentSongIndex];

  return `
    <div class="music-player">
      <div class="player-display">
        <img src="${currentSong.cover}" alt="Album Art" class="album-art" id="album-art">
        <div class="song-info">
          <div class="song-title" id="song-title">${currentSong.title}</div>
          <div class="song-artist" id="song-artist">${currentSong.artist}</div>
        </div>
      </div>
      
      <div class="progress-bar" id="progress-container">
        <div class="progress" id="progress"></div>
      </div>
      
      <div class="time-display">
        <div id="current-time">0:00</div>
        <div id="total-time">${currentSong.duration}</div>
      </div>
      
      <div class="player-controls">
        <div class="control-btn" id="prev-btn">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path fill="currentColor" d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
          </svg>
        </div>
        <div class="control-btn play-pause-btn" id="play-btn">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="play-icon">
            <path fill="currentColor" d="${isPlaying ? "M6 19h4V5H6v14zm8-14v14h4V5h-4z" : "M8 5v14l11-7z"}"/>
          </svg>
        </div>
        <div class="control-btn" id="next-btn">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path fill="currentColor" d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
          </svg>
        </div>
      </div>
      
      <div class="volume-control">
        <svg class="volume-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
        <div class="volume-slider" id="volume-container">
          <div class="volume-level" id="volume-level"></div>
        </div>
      </div>
      
      <div class="playlist">
        ${playlistHTML}
      </div>
    </div>
  `;
}

function setupMusicPlayerEvents() {
  if (!musicPlayer) return;

  const playBtn = musicPlayer.querySelector('#play-btn');
  const prevBtn = musicPlayer.querySelector('#prev-btn');
  const nextBtn = musicPlayer.querySelector('#next-btn');
  const progressContainer = musicPlayer.querySelector('#progress-container');
  const volumeContainer = musicPlayer.querySelector('#volume-container');
  const playlistItems = musicPlayer.querySelectorAll('.playlist-item');

  const playIconSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="play-icon"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
  const pauseIconSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="play-icon"><path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';

  function playSong() {
    if (!audio) return;
    isPlaying = true;
    playBtn.innerHTML = pauseIconSVG;
    audio.play();
  }

  function pauseSong() {
    if (!audio) return;
    isPlaying = false;
    playBtn.innerHTML = playIconSVG;
    audio.pause();
  }

  playBtn.addEventListener('click', () => {
    if (isPlaying) {
      pauseSong();
    } else {
      playSong();
    }
  });

  prevBtn.addEventListener('click', prevSong);
  nextBtn.addEventListener('click', nextSong);

  progressContainer.addEventListener('click', function (e) {
    if (!audio) return;
    const width = this.clientWidth;
    const clickX = e.offsetX;
    audio.currentTime = (clickX / width) * audio.duration;
  });

  volumeContainer.addEventListener('click', function (e) {
    if (!audio) return;
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const volume = clickX / width;

    const volumeLevel = musicPlayer.querySelector('#volume-level');
    if (volumeLevel) {
      volumeLevel.style.width = `${volume * 100}%`;
    }
    audio.volume = volume;
  });

  playlistItems.forEach(item => {
    item.addEventListener('click', () => {
      currentSongIndex = parseInt(item.getAttribute('data-index'));
      loadSong(currentSongIndex);
      playSong();
    });
  });

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration || !musicPlayer) return;

    const progressPercent = (audio.currentTime / audio.duration) * 100;
    const progress = musicPlayer.querySelector('#progress');
    if (progress) {
      progress.style.width = `${progressPercent}%`;
    }

    const minutes = Math.floor(audio.currentTime / 60);
    const seconds = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
    const currentTimeElement = musicPlayer.querySelector('#current-time');
    if (currentTimeElement) {
      currentTimeElement.textContent = `${minutes}:${seconds}`;
    }
  });
}

function prevSong() {
  currentSongIndex = (currentSongIndex > 0) ? currentSongIndex - 1 : playlist.length - 1;
  loadSong(currentSongIndex);
  if (isPlaying) {
    audio.play().catch(error => console.warn("Error playing previous song:", error));
  }
  updatePlayerUI();
}

function nextSong() {
  currentSongIndex = (currentSongIndex < playlist.length - 1) ? currentSongIndex + 1 : 0;
  loadSong(currentSongIndex);
  if (isPlaying) {
    audio.play().catch(error => console.warn("Error playing next song:", error));
  }
  updatePlayerUI();
}

function loadSong(index) {
  try {
    const song = playlist[index];
    audio.src = song.source;

    if (musicPlayer) {
      musicPlayer.querySelector('#song-title').textContent = song.title;
      musicPlayer.querySelector('#song-artist').textContent = song.artist;
      musicPlayer.querySelector('#total-time').textContent = song.duration;

      const albumArt = musicPlayer.querySelector('#album-art');
      if (albumArt) {
        albumArt.src = song.cover;
      }

      const playlistItems = musicPlayer.querySelectorAll('.playlist-item');
      playlistItems.forEach(item => {
        item.classList.remove('active');
        if (parseInt(item.getAttribute('data-index')) === index) {
          item.classList.add('active');
        }
      });
    }

    audio.load();
  } catch (error) {
    console.error("Error loading song:", error);
  }
}

function initializeBackgroundMusic() {
  if (playbackInitialized) return;

  setupAudioEventListeners();
  loadSong(currentSongIndex);
  tryAutoplay();

  playbackInitialized = true;
}

async function getTotalCommitsLastMonth(username) {
  const now = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setDate(now.getDate() - 30);

  try {
    const response = await fetch(`https://api.github.com/users/${username}/events/public`);
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const events = await response.json();

    let commitCount = 0;

    for (const event of events) {
      if (event.type === "PushEvent") {
        const eventDate = new Date(event.created_at);
        if (eventDate > oneMonthAgo) {
          commitCount += event.payload.commits.length;
        }
      }
    }

    return commitCount;
  } catch (error) {
    console.error("Error fetching commits:", error);
    return 0;
  }
}

window.openWindowAtRandom = openWindowAtRandom;
window.openMusicPlayer = openMusicPlayer