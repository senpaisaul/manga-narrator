# Troubleshooting Guide

## Nothing Happens When Clicking "Start Narration"

### Step 1: Check Console Logs

**Popup Console:**
1. Right-click the extension icon → "Inspect popup"
2. Look for errors in the Console tab
3. You should see: "Start Narration button clicked"

**Background Console:**
1. Go to `chrome://extensions/`
2. Find "Manga Narrator"
3. Click "service worker" link
4. Look for: "Starting narration..." and "Sending START_CAPTURE to tab"

**Page Console:**
1. On the webpage, press F12
2. Look for: "Manga Narrator content script loaded"

### Step 2: Run Diagnostics

1. Right-click extension icon → "Inspect popup"
2. In the Console, paste the contents of `debug-helper.js`
3. Review the diagnostic output

### Step 3: Common Issues and Fixes

#### Issue: "No active tab found"
**Fix:** Make sure you have a webpage open and active

#### Issue: "Could not communicate with page"
**Fix:** 
1. Reload the webpage (F5)
2. Reload the extension at `chrome://extensions/`
3. Try again

#### Issue: "Content script not responding"
**Fix:**
1. The extension will try to auto-inject the content script
2. If it fails, reload the page
3. Make sure the page URL is not a restricted page (chrome://, chrome-extension://, etc.)

#### Issue: "API key not configured"
**Fix:**
1. Click extension icon → Settings
2. Enter your OpenAI API key (starts with `sk-`)
3. Click "Save Settings"
4. Try starting narration again

#### Issue: Screen sharing prompt doesn't appear
**Fix:**
1. Check if another application is using screen sharing
2. Try restarting Chrome
3. Check Chrome permissions: Settings → Privacy and security → Site Settings → Screen capture

### Step 4: Verify Extension Files

Make sure all these files exist:
```
manifest.json
popup/popup.html
popup/popup.css
popup/popup.js
background/background.js
content/content.js
services/vision-service.js
services/narration-engine.js
services/tts-service.js
services/storage-service.js
settings/settings.html
settings/settings.css
settings/settings.js
assets/icon16.png
assets/icon48.png
assets/icon128.png
```

### Step 5: Check Manifest Permissions

Open `manifest.json` and verify it has:
```json
{
  "permissions": [
    "storage",
    "scripting"
  ],
  "host_permissions": [
    "<all_urls>"
  ]
}
```

### Step 6: Reload Everything

1. Close all Chrome windows
2. Reopen Chrome
3. Go to `chrome://extensions/`
4. Click the reload icon on Manga Narrator
5. Open a test webpage
6. Try starting narration

### Step 7: Test on Different Pages

Some pages may block extensions. Try these test pages:
- https://example.com
- https://wikipedia.org
- Any manga reading website

**Avoid these pages (extensions can't run here):**
- chrome:// pages
- chrome-extension:// pages
- Chrome Web Store pages
- New Tab page

## Screen Capture Permission Denied

### Issue: Permission prompt doesn't appear or is denied

**Fix:**
1. Click "Start Narration" again
2. When prompted, select your screen/window
3. Click "Share" button
4. If you accidentally denied, click "Start Narration" again

## No Audio Playing

### Issue: Narration generates but no sound

**Checks:**
1. System volume is not muted
2. Chrome is not muted (right-click Chrome icon in taskbar)
3. Check background console for TTS errors

**Fix:**
1. Open Settings
2. Try selecting a different voice
3. Adjust speech rate
4. Save and try again

## Vision Analysis Fails

### Issue: "Failed to process manga page"

**Possible Causes:**
1. **Invalid API Key**
   - Go to Settings
   - Verify API key starts with `sk-`
   - Get new key from https://platform.openai.com/api-keys

2. **No API Credits**
   - Check your OpenAI account balance
   - Add credits if needed

3. **Network Error**
   - Check internet connection
   - Try again in a moment

4. **Rate Limit**
   - Wait 1-2 minutes
   - Try again
   - Consider increasing capture interval in Settings

## Extension Won't Load

### Issue: Error when loading extension

**Fix:**
1. Check for syntax errors in console
2. Verify all files are present
3. Check manifest.json is valid JSON
4. Try removing and re-adding the extension

## Still Having Issues?

1. Check all console logs (popup, background, page)
2. Run the diagnostic script (debug-helper.js)
3. Try on a fresh Chrome profile
4. Verify Chrome version is 88 or higher

## Getting More Help

Include this information when reporting issues:
- Chrome version
- Operating system
- Console error messages
- Steps to reproduce
- Diagnostic script output
