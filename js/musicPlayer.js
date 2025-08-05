import { openWindowAtRandom } from './windows.js';
import { loadSvgIcon } from './utils.js';

class MusicPlayer {
  constructor() {
    this.audio = new Audio();
    this.currentSongIndex = this.getSavedSong();
    this.isPlaying = false;
    this.musicPlayerWindow = null;
    this.playlist = [];
    this.isDragging = false;
    
    this.audio.addEventListener('ended', () => this.nextSong());
    this.audio.addEventListener('timeupdate', () => this.updateProgress());
    this.audio.volume = 0.5;
  }

  getSavedSong() {
    const saved = document.cookie.split(';').find(c => c.trim().startsWith('currentSong='));
    return saved ? parseInt(saved.split('=')[1]) : 0;
  }

  saveSong() {
    document.cookie = `currentSong=${this.currentSongIndex}; max-age=31536000; path=/`;
  }

  async loadPlaylist() {
    try {
      const response = await fetch("./music/music.json");
      this.playlist = (await response.json()).tracks;
    } catch (error) {
      console.error("Failed to load playlist:", error);
      this.playlist = [];
    }
  }

  async openMusicPlayer() {
    this.musicPlayerWindow = openWindowAtRandom('Music Player', this.createHTML(), await loadSvgIcon("music.svg"));
    
    if (!this.playlist.length) {
      await this.loadPlaylist();
      this.loadSong(this.currentSongIndex);
    }

    this.setupEvents();
    this.updateUI();
  }

  updateProgress() {
    if (!this.audio.duration || !this.musicPlayerWindow || this.isDragging) return;

    const percent = (this.audio.currentTime / this.audio.duration) * 100;
    const progress = this.musicPlayerWindow.querySelector('#progress');
    const timeEl = this.musicPlayerWindow.querySelector('#current-time');
    
    if (progress) progress.style.width = `${percent}%`;
    if (timeEl) {
      const min = Math.floor(this.audio.currentTime / 60);
      const sec = Math.floor(this.audio.currentTime % 60).toString().padStart(2, '0');
      timeEl.textContent = `${min}:${sec}`;
    }
  }

  updateUI() {
    if (!this.musicPlayerWindow) return;

    const playIcon = this.musicPlayerWindow.querySelector('#play-icon');
    if (playIcon) {
      playIcon.innerHTML = `<path fill="currentColor" d="${this.isPlaying ? 'M6 19h4V5H6v14zm8-14v14h4V5h-4z' : 'M8 5v14l11-7z'}"/>`;
    }

    const volumeLevel = this.musicPlayerWindow.querySelector('#volume-level');
    if (volumeLevel) volumeLevel.style.width = `${this.audio.volume * 100}%`;
  }

  createHTML() {
    const song = this.playlist[this.currentSongIndex] || { title: 'Loading...', artist: 'Loading...', cover: '', duration: '0:00' };
    
    const playlistHTML = this.playlist.map((s, i) => 
      `<div class="playlist-item ${i === this.currentSongIndex ? 'active' : ''}" data-index="${i}">
        <div class="playlist-item-title">${s.title}</div>
        <div class="playlist-item-duration">${s.duration}</div>
      </div>`
    ).join('');

    return `
      <div class="music-player">
        <div class="player-display">
          <img src="${song.cover}" alt="Album Art" class="album-art" id="album-art">
          <div class="song-info">
            <div class="song-title" id="song-title">${song.title}</div>
            <div class="song-artist" id="song-artist">${song.artist}</div>
          </div>
        </div>
        
        <div class="progress-bar" id="progress-container">
          <div class="progress" id="progress"></div>
        </div>
        
        <div class="time-display">
          <div id="current-time">0:00</div>
          <div id="total-time">${song.duration}</div>
        </div>
        
        <div class="player-controls">
          <div class="control-btn" id="prev-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path fill="currentColor" d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </div>
          <div class="control-btn play-pause-btn" id="play-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="play-icon">
              <path fill="currentColor" d="${this.isPlaying ? 'M6 19h4V5H6v14zm8-14v14h4V5h-4z' : 'M8 5v14l11-7z'}"/>
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
        
        <div class="playlist">${playlistHTML}</div>
      </div>
    `;
  }

  setupEvents() {
    if (!this.musicPlayerWindow) return;

    this.musicPlayerWindow.querySelector('#play-btn').addEventListener('click', () => this.togglePlay());
    this.musicPlayerWindow.querySelector('#prev-btn').addEventListener('click', () => this.prevSong());
    this.musicPlayerWindow.querySelector('#next-btn').addEventListener('click', () => this.nextSong());

    this.setupSlider('#progress-container', (percent) => {
      if (this.audio.duration) this.audio.currentTime = percent * this.audio.duration;
    });

    this.setupSlider('#volume-container', (percent) => {
      this.audio.volume = Math.max(0, Math.min(1, percent));
      this.updateUI();
    });

    this.musicPlayerWindow.querySelectorAll('.playlist-item').forEach(item => {
      item.addEventListener('click', () => {
        this.currentSongIndex = parseInt(item.getAttribute('data-index'));
        this.saveSong();
        this.loadSong(this.currentSongIndex);
        this.play();
      });
    });
  }

  setupSlider(selector, callback) {
    const container = this.musicPlayerWindow.querySelector(selector);
    if (!container) return;

    const handleSeek = (e) => {
      const rect = container.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      callback(percent);
    };

    container.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      handleSeek(e);
      
      const handleMove = (e) => handleSeek(e);
      const handleUp = () => {
        this.isDragging = false;
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
      };

      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
    });

    container.addEventListener('click', handleSeek);
  }

  togglePlay() {
    this.isPlaying ? this.pause() : this.play();
  }

  play() {
    this.isPlaying = true;
    this.updateUI();
    this.audio.play().catch(console.warn);
  }

  pause() {
    this.isPlaying = false;
    this.updateUI();
    this.audio.pause();
  }

  prevSong() {
    this.currentSongIndex = this.currentSongIndex > 0 ? this.currentSongIndex - 1 : this.playlist.length - 1;
    this.changeSong();
  }

  nextSong() {
    this.currentSongIndex = this.currentSongIndex < this.playlist.length - 1 ? this.currentSongIndex + 1 : 0;
    this.changeSong();
  }

  changeSong() {
    this.saveSong();
    this.loadSong(this.currentSongIndex);
    if (this.isPlaying) this.audio.play().catch(console.warn);
    this.updateUI();
  }

  loadSong(index) {
    const song = this.playlist[index];
    if (!song) return;

    this.audio.src = song.source;
    this.audio.load();

    if (this.musicPlayerWindow) {
      const elements = {
        '#song-title': song.title,
        '#song-artist': song.artist,
        '#total-time': song.duration,
        '#album-art': song.cover
      };

      Object.entries(elements).forEach(([sel, val]) => {
        const el = this.musicPlayerWindow.querySelector(sel);
        if (el) {
          if (sel === '#album-art') el.src = val;
          else el.textContent = val;
        }
      });

      this.musicPlayerWindow.querySelectorAll('.playlist-item').forEach((item, i) => {
        item.classList.toggle('active', i === index);
      });
    }
  }

  async initializeBackgroundMusic() {
    await this.loadPlaylist();
    this.loadSong(this.currentSongIndex);
    
    // Try autoplay on user interaction
    const events = ['click', 'touchstart', 'keydown'];
    const handler = () => {
      if (!this.isPlaying) this.audio.play().then(() => this.isPlaying = true).catch(() => {});
      events.forEach(e => document.removeEventListener(e, handler));
    };
    events.forEach(e => document.addEventListener(e, handler));
  }
}

const musicPlayer = new MusicPlayer();

export { musicPlayer };
export const openMusicPlayer = () => musicPlayer.openMusicPlayer();
export const initializeBackgroundMusic = () => musicPlayer.initializeBackgroundMusic();