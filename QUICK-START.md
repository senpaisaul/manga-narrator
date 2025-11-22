# Quick Start Guide

## Step 1: Reload the Extension

1. Go to `chrome://extensions/`
2. Find "Manga Narrator"
3. Click the **reload icon** (circular arrow)
4. Verify no errors appear

## Step 2: Configure API Key

1. Click the Manga Narrator extension icon in your toolbar
2. Click "⚙️ Settings" button
3. Enter your OpenAI API key (get one from https://platform.openai.com/api-keys)
4. Click "Save Settings"
5. You should see "✓ Settings saved successfully!"

## Step 3: Open Popup Console for Debugging

1. **Right-click** the Manga Narrator extension icon
2. Select "Inspect popup"
3. The DevTools window will open
4. Go to the **Console** tab
5. Keep this window open

## Step 4: Check Console Output

When you open the popup, you should see these messages in the console:

```
Popup script loaded
Event listener for DOMContentLoaded registered
DOM Content Loaded - Initializing PopupController
Element found: startBtn
Element found: pauseBtn
Element found: resumeBtn
Element found: stopBtn
Element found: settingsBtn
Element found: statusIndicator
Element found: statusText
Element found: errorMessage
Attaching event listeners...
Start button listener attached
All event listeners attached
PopupController initialized
Loading current status from background...
Status response: {status: "idle", captureCount: 0, uptime: 0}
```

### If you DON'T see these messages:
- The popup.js file might not be loading
- Check for syntax errors in the console
- Reload the extension and try again

## Step 5: Test Start Button

1. With the popup console still open, click "Start Narration"
2. You should see:
```
Start button click event fired
Start Narration button clicked
Sending START_NARRATION message to background...
```

3. Then you should see the screen sharing prompt

### If nothing happens when you click:
- Check if you see "Start button click event fired" in console
- If NO: The event listener isn't attached - reload extension
- If YES: Check background console (next step)

## Step 6: Check Background Console

1. Go to `chrome://extensions/`
2. Find "Manga Narrator"
3. Click the blue **"service worker"** link
4. You should see:
```
Manga Narrator background service worker loaded
```

5. When you click "Start Narration", you should see:
```
Received message: START_NARRATION
Starting narration...
Status change: idle → capturing
Sending START_CAPTURE to tab: [number]
```

### If background console shows errors:
- Note the error message
- Common issues:
  - "No active tab found" - Make sure you have a webpage open
  - Import errors - Check all service files exist

## Step 7: Test Full Flow

1. Open a test webpage (e.g., https://example.com)
2. Click the extension icon
3. Click "Start Narration"
4. Select your screen/window in the prompt
5. Click "Share"

**Expected behavior:**
- Status changes to "Capturing screen..."
- After ~10 seconds: "Analyzing manga page..."
- Then: "Generating narration..."
- Then: "Narrating..." (you hear audio)
- Returns to: "Waiting for next capture..."

## Troubleshooting

### Button does nothing
**Check popup console:**
- Do you see "Start button click event fired"?
  - NO → Reload extension, the event listener didn't attach
  - YES → Continue to next check

**Check background console:**
- Do you see "Received message: START_NARRATION"?
  - NO → Background worker not receiving messages, reload extension
  - YES → Check for errors after this message

### Screen sharing prompt doesn't appear
- Check background console for errors
- Try on a different webpage
- Restart Chrome

### "Could not communicate with page" error
- Reload the webpage (F5)
- Reload the extension
- Try again

### Still not working?
Run the diagnostic script:
1. Right-click extension icon → Inspect popup
2. Copy contents of `debug-helper.js`
3. Paste into console
4. Review the output

## Success Checklist

- ✅ Extension loads without errors
- ✅ Popup opens and shows "Ready" status
- ✅ Settings page opens and saves API key
- ✅ Popup console shows all initialization messages
- ✅ Background console shows "service worker loaded"
- ✅ Clicking "Start Narration" shows console logs
- ✅ Screen sharing prompt appears
- ✅ After sharing, status changes to "Capturing screen..."

If all checkboxes are ✅, the extension is working correctly!
