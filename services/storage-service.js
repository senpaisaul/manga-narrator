// Storage Service - Chrome storage wrapper
const StorageService = {
  // Default settings
  defaultSettings: {
    voice: '',
    speechRate: 1.0,
    captureInterval: 10,
    autoStart: false,
    apiKey: ''
  },

  async getSettings() {
    try {
      const result = await chrome.storage.sync.get('settings');
      return { ...this.defaultSettings, ...result.settings };
    } catch (error) {
      console.error('Failed to get settings:', error);
      return this.defaultSettings;
    }
  },

  async saveSettings(settings) {
    try {
      await chrome.storage.sync.set({ settings });
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  },

  async resetToDefaults() {
    try {
      await chrome.storage.sync.set({ settings: this.defaultSettings });
      return this.defaultSettings;
    } catch (error) {
      console.error('Failed to reset settings:', error);
      throw error;
    }
  },

  async getLastCaptureTime() {
    try {
      const result = await chrome.storage.local.get('lastCaptureTime');
      return result.lastCaptureTime || 0;
    } catch (error) {
      console.error('Failed to get last capture time:', error);
      return 0;
    }
  },

  async setLastCaptureTime(timestamp) {
    try {
      await chrome.storage.local.set({ lastCaptureTime: timestamp });
    } catch (error) {
      console.error('Failed to set last capture time:', error);
    }
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageService;
}
