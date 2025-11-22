// Text-to-Speech Service - Web Speech API Integration
const TTSService = {
  currentUtterance: null,
  isPaused: false,
  pausePosition: 0,
  currentText: '',

  /**
   * Speak text using Web Speech API
   * Requirement 4.1: Convert narrative text to spoken audio
   * Requirement 4.2: Use natural-sounding voice with appropriate pacing
   * @param {string} text - Text to speak
   * @param {TTSOptions} options - TTS options (voice, rate, pitch, volume)
   * @returns {Promise<void>}
   */
  async speak(text, options = {}) {
    console.log('Speaking text:', text.substring(0, 50) + '...');

    try {
      // Stop any current speech
      this.stop();

      // Get settings if options not provided
      if (!options.voice || !options.rate) {
        const settings = await this.getSettings();
        options = {
          voice: options.voice || settings.voice || '',
          rate: options.rate || settings.speechRate || 1.0,
          pitch: options.pitch || 1.0,
          volume: options.volume || 1.0
        };
      }

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Apply options
      utterance.rate = options.rate;
      utterance.pitch = options.pitch;
      utterance.volume = options.volume;

      // Set voice if specified
      if (options.voice) {
        const voices = await this.getVoices();
        const selectedVoice = voices.find(v => v.name === options.voice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      // Store current state
      this.currentUtterance = utterance;
      this.currentText = text;
      this.isPaused = false;

      // Return promise that resolves when speech ends
      return new Promise((resolve, reject) => {
        utterance.onend = () => {
          console.log('Speech completed');
          this.currentUtterance = null;
          this.currentText = '';
          resolve();
        };

        utterance.onerror = (event) => {
          console.error('Speech error:', event);
          this.currentUtterance = null;
          reject(new Error(`Speech synthesis error: ${event.error}`));
        };

        utterance.onpause = () => {
          console.log('Speech paused');
          this.isPaused = true;
        };

        utterance.onresume = () => {
          console.log('Speech resumed');
          this.isPaused = false;
        };

        // Start speaking
        // Requirement 4.3: Begin audio playback within 2 seconds
        const startTime = Date.now();
        window.speechSynthesis.speak(utterance);
        
        // Check if speech started within time limit
        setTimeout(() => {
          const elapsed = Date.now() - startTime;
          if (elapsed > 2000 && !window.speechSynthesis.speaking) {
            console.warn(`Speech did not start within 2 seconds (${elapsed}ms)`);
          }
        }, 2100);
      });

    } catch (error) {
      console.error('TTS speak error:', error);
      throw error;
    }
  },

  /**
   * Pause current speech
   * Requirement 4.4: Stop audio playback immediately when paused
   */
  pause() {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      console.log('Pausing speech');
      window.speechSynthesis.pause();
      this.isPaused = true;
    }
  },

  /**
   * Resume paused speech
   * Requirement 4.5: Continue from paused position when resumed
   */
  resume() {
    if (window.speechSynthesis.paused) {
      console.log('Resuming speech');
      window.speechSynthesis.resume();
      this.isPaused = false;
    }
  },

  /**
   * Stop current speech and clear state
   */
  stop() {
    if (window.speechSynthesis.speaking || window.speechSynthesis.paused) {
      console.log('Stopping speech');
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
    this.currentText = '';
    this.isPaused = false;
    this.pausePosition = 0;
  },

  /**
   * Get available voices
   * @returns {Promise<Voice[]>}
   */
  async getVoices() {
    return new Promise((resolve) => {
      let voices = window.speechSynthesis.getVoices();
      
      if (voices.length > 0) {
        resolve(voices);
      } else {
        // Voices might not be loaded yet
        window.speechSynthesis.onvoiceschanged = () => {
          voices = window.speechSynthesis.getVoices();
          resolve(voices);
        };
        
        // Timeout after 3 seconds
        setTimeout(() => {
          voices = window.speechSynthesis.getVoices();
          resolve(voices);
        }, 3000);
      }
    });
  },

  /**
   * Get current speech status
   * @returns {Object}
   */
  getStatus() {
    return {
      speaking: window.speechSynthesis.speaking,
      paused: window.speechSynthesis.paused,
      pending: window.speechSynthesis.pending,
      isPaused: this.isPaused,
      hasCurrentUtterance: this.currentUtterance !== null
    };
  },

  /**
   * Check if TTS is available
   * @returns {boolean}
   */
  isAvailable() {
    return 'speechSynthesis' in window;
  },

  /**
   * Get settings from Chrome storage
   * @returns {Promise<Object>}
   */
  async getSettings() {
    try {
      const result = await chrome.storage.sync.get('settings');
      return result.settings || {};
    } catch (error) {
      console.error('Failed to load settings:', error);
      return {};
    }
  },

  /**
   * Get default voice for language
   * @param {string} lang - Language code (e.g., 'en-US')
   * @returns {Promise<Voice|null>}
   */
  async getDefaultVoice(lang = 'en-US') {
    const voices = await this.getVoices();
    
    // Try to find a voice for the specified language
    const langVoices = voices.filter(v => v.lang.startsWith(lang.split('-')[0]));
    
    if (langVoices.length > 0) {
      // Prefer default voice
      const defaultVoice = langVoices.find(v => v.default);
      return defaultVoice || langVoices[0];
    }
    
    // Fallback to any available voice
    return voices.length > 0 ? voices[0] : null;
  }
};

// Export for use in background script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TTSService;
}
