// Settings Page Controller
const SettingsController = {
  elements: {},

  init() {
    this.cacheElements();
    this.attachEventListeners();
    this.loadSettings();
    this.loadVoices();
  },

  cacheElements() {
    this.elements = {
      form: document.getElementById('settingsForm'),
      apiKey: document.getElementById('apiKey'),
      voice: document.getElementById('voice'),
      speechRate: document.getElementById('speechRate'),
      rateValue: document.getElementById('rateValue'),
      captureInterval: document.getElementById('captureInterval'),
      intervalValue: document.getElementById('intervalValue'),
      resetBtn: document.getElementById('resetBtn'),
      successMessage: document.getElementById('successMessage'),
      errorMessage: document.getElementById('errorMessage')
    };
  },

  attachEventListeners() {
    this.elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveSettings();
    });

    this.elements.resetBtn.addEventListener('click', () => {
      this.resetToDefaults();
    });

    this.elements.speechRate.addEventListener('input', (e) => {
      this.elements.rateValue.textContent = e.target.value + 'x';
    });

    this.elements.captureInterval.addEventListener('input', (e) => {
      this.elements.intervalValue.textContent = e.target.value;
    });
  },

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get('settings');
      const settings = result.settings || {};

      if (settings.apiKey) {
        this.elements.apiKey.value = settings.apiKey;
      }

      if (settings.voice) {
        this.elements.voice.value = settings.voice;
      }

      if (settings.speechRate) {
        this.elements.speechRate.value = settings.speechRate;
        this.elements.rateValue.textContent = settings.speechRate + 'x';
      }

      if (settings.captureInterval) {
        this.elements.captureInterval.value = settings.captureInterval;
        this.elements.intervalValue.textContent = settings.captureInterval;
      }

      console.log('Settings loaded:', settings);
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.showError('Failed to load settings: ' + error.message);
    }
  },

  async loadVoices() {
    try {
      // Get voices from Web Speech API
      const voices = await this.getVoices();
      
      // Populate voice dropdown
      voices.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.name;
        option.textContent = `${voice.name} (${voice.lang})`;
        this.elements.voice.appendChild(option);
      });

      console.log('Loaded', voices.length, 'voices');
    } catch (error) {
      console.error('Failed to load voices:', error);
    }
  },

  async getVoices() {
    return new Promise((resolve) => {
      let voices = speechSynthesis.getVoices();
      
      if (voices.length > 0) {
        resolve(voices);
      } else {
        speechSynthesis.onvoiceschanged = () => {
          voices = speechSynthesis.getVoices();
          resolve(voices);
        };
        
        // Timeout after 3 seconds
        setTimeout(() => {
          voices = speechSynthesis.getVoices();
          resolve(voices);
        }, 3000);
      }
    });
  },

  async saveSettings() {
    try {
      const settings = {
        apiKey: this.elements.apiKey.value.trim(),
        voice: this.elements.voice.value,
        speechRate: parseFloat(this.elements.speechRate.value),
        captureInterval: parseInt(this.elements.captureInterval.value),
        autoStart: false
      };

      // Validate API key
      if (!settings.apiKey) {
        this.showError('Please enter your OpenAI API key');
        return;
      }

      if (!settings.apiKey.startsWith('sk-')) {
        this.showError('Invalid API key format. OpenAI API keys start with "sk-"');
        return;
      }

      // Save to Chrome storage
      await chrome.storage.sync.set({ settings });

      console.log('Settings saved:', settings);
      this.showSuccess();
    } catch (error) {
      console.error('Failed to save settings:', error);
      this.showError('Failed to save settings: ' + error.message);
    }
  },

  async resetToDefaults() {
    if (!confirm('Reset all settings to defaults?')) {
      return;
    }

    try {
      const defaultSettings = {
        apiKey: '',
        voice: '',
        speechRate: 1.0,
        captureInterval: 10,
        autoStart: false
      };

      await chrome.storage.sync.set({ settings: defaultSettings });

      // Update UI
      this.elements.apiKey.value = '';
      this.elements.voice.value = '';
      this.elements.speechRate.value = 1.0;
      this.elements.rateValue.textContent = '1.0x';
      this.elements.captureInterval.value = 10;
      this.elements.intervalValue.textContent = '10';

      this.showSuccess('Settings reset to defaults');
    } catch (error) {
      console.error('Failed to reset settings:', error);
      this.showError('Failed to reset settings: ' + error.message);
    }
  },

  showSuccess(message = 'Settings saved successfully!') {
    this.elements.successMessage.textContent = '✓ ' + message;
    this.elements.successMessage.classList.add('visible');
    this.elements.errorMessage.classList.remove('visible');

    // Hide after 3 seconds
    setTimeout(() => {
      this.elements.successMessage.classList.remove('visible');
    }, 3000);
  },

  showError(message) {
    this.elements.errorMessage.textContent = message;
    this.elements.errorMessage.classList.add('visible');
    this.elements.successMessage.classList.remove('visible');
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  SettingsController.init();
});
