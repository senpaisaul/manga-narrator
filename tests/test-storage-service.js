// Unit Tests for Storage Service
// Run these tests in the browser console on the extension's background page

const StorageServiceTests = {
  async runAll() {
    console.log('=== Running Storage Service Tests ===\n');
    
    await this.testSaveAndGetSettings();
    await this.testResetToDefaults();
    await this.testDefaultSettings();
    
    console.log('\n=== Storage Service Tests Complete ===');
  },

  async testSaveAndGetSettings() {
    console.log('Test: Save and Get Settings');
    
    const testSettings = {
      apiKey: 'test-key-123',
      voice: 'Test Voice',
      speechRate: 1.5,
      captureInterval: 15,
      autoStart: true
    };

    try {
      // Save settings
      await StorageService.saveSettings(testSettings);
      console.log('Settings saved');
      
      // Retrieve settings
      const retrieved = await StorageService.getSettings();
      
      console.assert(retrieved.apiKey === testSettings.apiKey, "API key matches");
      console.assert(retrieved.voice === testSettings.voice, "Voice matches");
      console.assert(retrieved.speechRate === testSettings.speechRate, "Speech rate matches");
      console.assert(retrieved.captureInterval === testSettings.captureInterval, "Capture interval matches");
      console.assert(retrieved.autoStart === testSettings.autoStart, "Auto start matches");
      
      console.log('✓ Save and Get Settings test passed\n');
    } catch (error) {
      console.error('✗ Save and Get Settings test failed:', error);
    }
  },

  async testResetToDefaults() {
    console.log('Test: Reset to Defaults');
    
    try {
      // First set custom settings
      await StorageService.saveSettings({
        apiKey: 'custom-key',
        speechRate: 2.0
      });
      
      // Reset to defaults
      const defaults = await StorageService.resetToDefaults();
      
      console.assert(defaults.apiKey === '', "API key reset to empty");
      console.assert(defaults.speechRate === 1.0, "Speech rate reset to 1.0");
      console.assert(defaults.captureInterval === 10, "Capture interval reset to 10");
      
      // Verify by retrieving
      const retrieved = await StorageService.getSettings();
      console.assert(retrieved.apiKey === '', "Retrieved API key is empty");
      
      console.log('✓ Reset to Defaults test passed\n');
    } catch (error) {
      console.error('✗ Reset to Defaults test failed:', error);
    }
  },

  async testDefaultSettings() {
    console.log('Test: Default Settings');
    
    try {
      // Clear storage
      await chrome.storage.sync.clear();
      
      // Get settings (should return defaults)
      const settings = await StorageService.getSettings();
      
      console.assert(settings.apiKey === '', "Default API key is empty");
      console.assert(settings.voice === '', "Default voice is empty");
      console.assert(settings.speechRate === 1.0, "Default speech rate is 1.0");
      console.assert(settings.captureInterval === 10, "Default capture interval is 10");
      console.assert(settings.autoStart === false, "Default auto start is false");
      
      console.log('✓ Default Settings test passed\n');
    } catch (error) {
      console.error('✗ Default Settings test failed:', error);
    }
  }
};

// Export for manual testing
console.log('Storage Service Tests loaded. Run: StorageServiceTests.runAll()');
