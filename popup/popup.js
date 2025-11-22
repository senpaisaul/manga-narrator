// Popup UI Controller
const PopupController = {
  elements: {},

  init() {
    this.cacheElements();
    this.attachEventListeners();
    this.loadCurrentStatus();
  },

  cacheElements() {
    this.elements = {
      startBtn: document.getElementById('startBtn'),
      pauseBtn: document.getElementById('pauseBtn'),
      resumeBtn: document.getElementById('resumeBtn'),
      stopBtn: document.getElementById('stopBtn'),
      settingsBtn: document.getElementById('settingsBtn'),
      statusIndicator: document.getElementById('statusIndicator'),
      statusText: document.getElementById('statusText'),
      errorMessage: document.getElementById('errorMessage')
    };
    
    // Verify all elements were found
    for (const [key, element] of Object.entries(this.elements)) {
      if (!element) {
        console.error(`Element not found: ${key}`);
      } else {
        console.log(`Element found: ${key}`);
      }
    }
  },

  attachEventListeners() {
    console.log('Attaching event listeners...');
    
    if (this.elements.startBtn) {
      this.elements.startBtn.addEventListener('click', () => {
        console.log('Start button click event fired');
        this.startNarration();
      });
      console.log('Start button listener attached');
    }
    
    if (this.elements.pauseBtn) {
      this.elements.pauseBtn.addEventListener('click', () => this.pauseNarration());
    }
    
    if (this.elements.resumeBtn) {
      this.elements.resumeBtn.addEventListener('click', () => this.resumeNarration());
    }
    
    if (this.elements.stopBtn) {
      this.elements.stopBtn.addEventListener('click', () => this.stopNarration());
    }
    
    if (this.elements.settingsBtn) {
      this.elements.settingsBtn.addEventListener('click', () => this.openSettings());
    }

    // Listen for status updates from background
    chrome.runtime.onMessage.addListener((message) => {
      console.log('Message received in popup:', message);
      if (message.type === 'STATUS_UPDATE') {
        this.updateStatus(message.status, message.message);
      } else if (message.type === 'ERROR') {
        this.showError(this.formatErrorMessage(message.message));
      } else if (message.type === 'SPEAK_TEXT') {
        this.speakText(message.text);
      } else if (message.type === 'PLAY_AUDIO') {
        this.playAudio(message.audioData);
      }
    });
    
    console.log('All event listeners attached');
  },

  async loadCurrentStatus() {
    try {
      console.log('Loading current status from background...');
      const response = await chrome.runtime.sendMessage({ type: 'GET_STATUS' });
      console.log('Status response:', response);
      if (response && response.status) {
        this.updateStatus(response.status);
      }
    } catch (error) {
      console.error('Failed to load status:', error);
      // Background worker might not be ready yet, show default state
      this.updateStatus('idle');
    }
  },

  async startNarration() {
    console.log('Start Narration button clicked');
    this.hideError();
    
    try {
      // Request screen capture directly from popup (user gesture context)
      console.log('Requesting screen capture from popup...');
      
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      
      console.log('Screen capture granted!');
      
      // Start capturing frames
      this.startCapturing(stream);
      
      // Notify background that narration started
      await chrome.runtime.sendMessage({ 
        type: 'NARRATION_STARTED'
      });
      
    } catch (error) {
      console.error('Error starting narration:', error);
      
      let errorMessage = 'Failed to start screen capture: ' + error.message;
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Screen capture permission denied. Please allow screen sharing when prompted.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No screen selected. Please select a screen or window to share.';
      }
      
      this.showError(this.formatErrorMessage(errorMessage));
    }
  },
  
  async startCapturing(stream) {
    console.log('Starting capture with stream:', stream.id);
    this.mediaStream = stream;
    
    // Create and setup video element once
    this.videoElement = document.createElement('video');
    this.videoElement.srcObject = stream;
    this.videoElement.muted = true;
    this.videoElement.autoplay = true;
    
    // Wait for video to be ready
    await new Promise((resolve, reject) => {
      this.videoElement.onloadedmetadata = () => {
        console.log('Video metadata loaded:', this.videoElement.videoWidth, 'x', this.videoElement.videoHeight);
        resolve();
      };
      this.videoElement.onerror = (e) => {
        console.error('Video error:', e);
        reject(new Error('Video failed to load'));
      };
      setTimeout(() => reject(new Error('Video metadata timeout')), 10000);
    });
    
    await this.videoElement.play();
    console.log('Video playing');
    
    // Handle stream end
    stream.getVideoTracks()[0].addEventListener('ended', () => {
      console.log('Screen sharing stopped by user');
      this.stopNarration();
    });
    
    // Get capture interval from settings
    const settings = await chrome.storage.sync.get('settings');
    const interval = (settings.settings?.captureInterval || 10) * 1000;
    console.log('Capture interval:', interval / 1000, 'seconds');
    
    // Capture first frame immediately
    console.log('Capturing first frame...');
    await this.captureAndSendFrame();
    
    // Set up interval for continuous capture
    console.log('Setting up capture interval...');
    this.captureInterval = setInterval(() => {
      console.log('Interval triggered, capturing frame...');
      this.captureAndSendFrame().catch(error => {
        console.error('Frame capture error:', error);
      });
    }, interval);
    
    console.log('Capture setup complete');
  },
  
  async captureAndSendFrame() {
    console.log('captureAndSendFrame called');
    
    if (!this.videoElement) {
      console.error('No video element available!');
      return;
    }
    
    try {
      console.log('Using existing video element, dimensions:', this.videoElement.videoWidth, 'x', this.videoElement.videoHeight);
      
      // Create canvas and capture frame
      const canvas = document.createElement('canvas');
      canvas.width = this.videoElement.videoWidth;
      canvas.height = this.videoElement.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(this.videoElement, 0, 0);
      
      console.log('Frame drawn to canvas, converting to blob...');
      
      // Convert to blob
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.9);
      });
      
      console.log('Blob created, size:', blob.size, 'bytes');
      
      // Convert to base64
      const reader = new FileReader();
      const base64Data = await new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
      
      console.log('Base64 data created, length:', base64Data.length);
      
      // Send to background
      console.log('Sending to background...');
      await chrome.runtime.sendMessage({
        type: 'SCREEN_CAPTURED',
        imageData: base64Data,
        timestamp: Date.now()
      });
      
      console.log('✓ Frame captured and sent successfully');
      
    } catch (error) {
      console.error('✗ Failed to capture frame:', error);
    }
  },

  async playAudio(audioData) {
    try {
      console.log('Playing OpenAI TTS audio...');
      
      // Stop any current audio
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }
      
      // Create audio element
      const audio = new Audio(audioData);
      this.currentAudio = audio;
      
      // Play audio
      await audio.play();
      
      console.log('Audio playback started');
      
      // Clean up when done
      audio.onended = () => {
        console.log('Audio playback completed');
        this.currentAudio = null;
      };
      
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  },

  async speakText(text) {
    try {
      console.log('Speaking text:', text.substring(0, 50) + '...');
      
      // Get settings
      const settings = await chrome.storage.sync.get('settings');
      const baseSpeechRate = settings.settings?.speechRate || 1.0;
      const voiceName = settings.settings?.voice || '';
      
      // Detect emotion from text markers and adjust voice
      let speechRate = baseSpeechRate;
      let pitch = 1.0;
      let volume = 1.0;
      
      // Analyze text for emotional cues
      if (text.includes('!!') || text === text.toUpperCase()) {
        // Shouting or anger - faster, higher pitch, louder
        speechRate = baseSpeechRate * 1.2;
        pitch = 1.3;
        volume = 1.0;
        console.log('Emotion: Shouting/Anger');
      } else if (text.includes('?!')) {
        // Surprise - faster, higher pitch
        speechRate = baseSpeechRate * 1.15;
        pitch = 1.2;
        console.log('Emotion: Surprise');
      } else if (text.includes('...')) {
        // Sadness or whisper - slower, lower pitch, quieter
        speechRate = baseSpeechRate * 0.85;
        pitch = 0.9;
        volume = 0.8;
        console.log('Emotion: Sadness/Whisper');
      } else if (text.includes('!') && !text.includes('!!')) {
        // Excitement - slightly faster, slightly higher pitch
        speechRate = baseSpeechRate * 1.1;
        pitch = 1.1;
        console.log('Emotion: Excitement');
      }
      
      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = Math.min(Math.max(speechRate, 0.5), 2.0); // Clamp between 0.5 and 2.0
      utterance.pitch = Math.min(Math.max(pitch, 0.5), 2.0); // Clamp between 0.5 and 2.0
      utterance.volume = Math.min(Math.max(volume, 0.1), 1.0); // Clamp between 0.1 and 1.0
      
      console.log(`TTS settings: rate=${utterance.rate}, pitch=${utterance.pitch}, volume=${utterance.volume}`);
      
      // Set voice if specified
      if (voiceName) {
        const voices = speechSynthesis.getVoices();
        const voice = voices.find(v => v.name === voiceName);
        if (voice) {
          utterance.voice = voice;
        }
      }
      
      // Store current utterance for pause/resume
      this.currentUtterance = utterance;
      
      // Speak
      speechSynthesis.speak(utterance);
      
      console.log('TTS started with emotion');
      
    } catch (error) {
      console.error('TTS error:', error);
    }
  },

  async pauseNarration() {
    try {
      // Pause audio
      if (this.currentAudio && !this.currentAudio.paused) {
        this.currentAudio.pause();
      }
      // Pause TTS (fallback)
      if (speechSynthesis.speaking) {
        speechSynthesis.pause();
      }
      await chrome.runtime.sendMessage({ type: 'PAUSE_NARRATION' });
    } catch (error) {
      this.showError('Failed to pause narration: ' + error.message);
    }
  },

  async resumeNarration() {
    try {
      // Resume audio
      if (this.currentAudio && this.currentAudio.paused) {
        this.currentAudio.play();
      }
      // Resume TTS (fallback)
      if (speechSynthesis.paused) {
        speechSynthesis.resume();
      }
      await chrome.runtime.sendMessage({ type: 'RESUME_NARRATION' });
    } catch (error) {
      this.showError('Failed to resume narration: ' + error.message);
    }
  },

  async stopNarration() {
    try {
      // Stop audio
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }
      
      // Stop TTS
      if (speechSynthesis.speaking || speechSynthesis.paused) {
        speechSynthesis.cancel();
      }
      
      // Stop capture interval
      if (this.captureInterval) {
        clearInterval(this.captureInterval);
        this.captureInterval = null;
      }
      
      // Stop video element
      if (this.videoElement) {
        this.videoElement.pause();
        this.videoElement.srcObject = null;
        this.videoElement = null;
      }
      
      // Stop media stream
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
        this.mediaStream = null;
      }
      
      await chrome.runtime.sendMessage({ type: 'STOP_NARRATION' });
    } catch (error) {
      this.showError('Failed to stop narration: ' + error.message);
    }
  },

  openSettings() {
    chrome.runtime.openOptionsPage();
  },

  updateStatus(status, message) {
    const statusMap = {
      idle: { text: 'Ready', class: '' },
      capturing: { text: 'Capturing screen...', class: 'capturing' },
      analyzing: { text: 'Analyzing manga...', class: 'analyzing' },
      narrating: { text: 'Narrating...', class: 'narrating' },
      paused: { text: 'Paused', class: 'paused' },
      error: { text: 'Error', class: 'error' }
    };

    const statusInfo = statusMap[status] || statusMap.idle;
    
    this.elements.statusText.textContent = message || statusInfo.text;
    this.elements.statusIndicator.className = 'status-indicator ' + statusInfo.class;

    // Update button states
    this.updateButtonStates(status);
  },

  updateButtonStates(status) {
    const { startBtn, pauseBtn, resumeBtn, stopBtn } = this.elements;

    switch (status) {
      case 'idle':
      case 'error':
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        resumeBtn.disabled = true;
        stopBtn.disabled = true;
        break;
      case 'capturing':
      case 'analyzing':
      case 'narrating':
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        resumeBtn.disabled = true;
        stopBtn.disabled = false;
        break;
      case 'paused':
        startBtn.disabled = true;
        pauseBtn.disabled = true;
        resumeBtn.disabled = false;
        stopBtn.disabled = false;
        break;
    }
  },

  showError(message) {
    this.elements.errorMessage.textContent = message;
    this.elements.errorMessage.classList.add('visible');
    
    // Update status to error
    this.updateStatus('error', 'Error occurred');
  },

  hideError() {
    this.elements.errorMessage.classList.remove('visible');
  },

  // Format error messages with helpful instructions
  formatErrorMessage(error) {
    const errorMap = {
      'permission denied': {
        message: 'Screen capture permission denied.',
        instructions: 'Please click "Start Narration" again and allow screen sharing when prompted.'
      },
      'no screen selected': {
        message: 'No screen was selected.',
        instructions: 'Please select a screen or window to share when prompted.'
      },
      'screen sharing was stopped': {
        message: 'Screen sharing was stopped.',
        instructions: 'Click "Start Narration" to begin capturing again.'
      },
      'api key': {
        message: 'API key not configured or invalid.',
        instructions: 'Please configure your OpenAI API key in Settings.'
      }
    };

    // Find matching error type
    const errorLower = error.toLowerCase();
    for (const [key, value] of Object.entries(errorMap)) {
      if (errorLower.includes(key)) {
        return `${value.message} ${value.instructions}`;
      }
    }

    // Default error message
    return error;
  }
};

// Initialize when DOM is ready
console.log('Popup script loaded');

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded - Initializing PopupController');
  PopupController.init();
  console.log('PopupController initialized');
});

console.log('Event listener for DOMContentLoaded registered');
