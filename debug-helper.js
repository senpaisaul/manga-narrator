// Debug Helper - Run this in the popup console to diagnose issues
// Right-click extension icon → Inspect popup → Console → Paste this code

async function diagnoseExtension() {
  console.log('=== Manga Narrator Diagnostics ===\n');
  
  // 1. Check settings
  console.log('1. Checking settings...');
  try {
    const result = await chrome.storage.sync.get('settings');
    const settings = result.settings;
    
    if (!settings) {
      console.error('❌ No settings found');
    } else {
      console.log('✓ Settings found');
      console.log('  - API Key:', settings.apiKey ? `${settings.apiKey.substring(0, 10)}...` : 'NOT SET');
      console.log('  - Speech Rate:', settings.speechRate || 'default');
      console.log('  - Capture Interval:', settings.captureInterval || 'default');
    }
  } catch (error) {
    console.error('❌ Error reading settings:', error);
  }
  
  // 2. Check active tab
  console.log('\n2. Checking active tab...');
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) {
      console.error('❌ No active tab found');
    } else {
      console.log('✓ Active tab found');
      console.log('  - Tab ID:', tabs[0].id);
      console.log('  - URL:', tabs[0].url);
    }
  } catch (error) {
    console.error('❌ Error querying tabs:', error);
  }
  
  // 3. Check background service worker
  console.log('\n3. Checking background service worker...');
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_STATUS' });
    console.log('✓ Background service worker responding');
    console.log('  - Status:', response.status);
  } catch (error) {
    console.error('❌ Background service worker not responding:', error);
  }
  
  // 4. Test content script communication
  console.log('\n4. Testing content script...');
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      try {
        await chrome.tabs.sendMessage(tabs[0].id, { type: 'PING' });
        console.log('✓ Content script responding');
      } catch (error) {
        console.error('❌ Content script not responding:', error.message);
        console.log('   This is normal - content script loads on demand');
      }
    }
  } catch (error) {
    console.error('❌ Error testing content script:', error);
  }
  
  // 5. Check permissions
  console.log('\n5. Checking permissions...');
  try {
    const permissions = await chrome.permissions.getAll();
    console.log('✓ Permissions:', permissions.permissions);
  } catch (error) {
    console.error('❌ Error checking permissions:', error);
  }
  
  console.log('\n=== Diagnostics Complete ===');
  console.log('\nNext steps:');
  console.log('1. If API key is not set, go to Settings and add it');
  console.log('2. If background worker not responding, reload the extension');
  console.log('3. Try clicking "Start Narration" and check background console');
  console.log('4. Background console: chrome://extensions/ → Click "service worker"');
}

// Run diagnostics
diagnoseExtension();
