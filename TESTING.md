# Manga Narrator Extension - Testing Guide

## Prerequisites

1. **OpenAI API Key**: Get one from https://platform.openai.com/api-keys
2. **Chrome Browser**: Version 88 or higher
3. **Test Content**: A manga page or image-heavy webpage

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the extension directory
5. Verify the extension appears in your extensions list

## Configuration

### Set Your API Key

1. Click the Manga Narrator extension icon
2. Click "⚙️ Settings" button
3. Enter your OpenAI API key (starts with `sk-`)
4. Adjust other settings:
   - **Voice**: Select preferred TTS voice
   - **Speech Rate**: 0.5x - 2.0x (default: 1.0x)
   - **Capture Interval**: 3-30 seconds (default: 10s)
5. Click "Save Settings"
6. Verify "✓ Settings saved successfully!" appears

## End-to-End Testing

### Test 1: Complete Narration Flow

**Objective**: Verify the entire capture → analyze → narrate → speak flow

1. Open a manga page in your browser
2. Click the extension icon
3. Click "Start Narration"
4. When prompted, select your screen/window and click "Share"

**Expected Results**:
- ✅ Status changes to "Capturing screen..."
- ✅ After ~10 seconds, status changes to "Analyzing manga page..."
- ✅ Status changes to "Generating narration..."
- ✅ Status changes to "Narrating..." and you hear audio
- ✅ Status returns to "Waiting for next capture..."
- ✅ Process repeats every 10 seconds (or your configured interval)

**Check Console Logs**:
- Background worker: `chrome://extensions/` → Click "service worker"
- Look for:
  ```
  Screen captured #1 at [time]
  Analysis complete: X panels detected
  Narration generated in Xms
  Speaking narration: [text]
  ```

### Test 2: Pause and Resume

**Objective**: Verify audio control functionality

1. Start narration (as in Test 1)
2. While audio is playing, click "Pause"
3. Wait 2 seconds
4. Click "Resume"

**Expected Results**:
- ✅ Audio stops immediately when paused
- ✅ Status shows "Paused"
- ✅ Pause button becomes disabled
- ✅ Resume button becomes enabled
- ✅ Audio continues from paused position when resumed
- ✅ Status returns to "Narrating..."

### Test 3: Stop Functionality

**Objective**: Verify resource cleanup

1. Start narration
2. Let it run for at least one capture cycle
3. Click "Stop"

**Expected Results**:
- ✅ Audio stops immediately
- ✅ Screen sharing stops
- ✅ Status returns to "Ready"
- ✅ Start button becomes enabled
- ✅ Other buttons become disabled
- ✅ Console shows "All resources released, state reset"

### Test 4: Settings Persistence

**Objective**: Verify settings are saved and loaded

1. Open Settings
2. Change speech rate to 1.5x
3. Change capture interval to 15 seconds
4. Save settings
5. Close and reopen Settings

**Expected Results**:
- ✅ Settings show the values you saved
- ✅ Narration uses new speech rate
- ✅ Captures occur at new interval

### Test 5: Error Handling - No API Key

**Objective**: Verify error handling for missing API key

1. Open Settings
2. Clear the API key field
3. Save settings
4. Try to start narration

**Expected Results**:
- ✅ Error message appears: "OpenAI API key not configured..."
- ✅ Status shows "Error"
- ✅ Red error box appears in popup

### Test 6: Error Handling - Invalid API Key

**Objective**: Verify error handling for invalid API key

1. Open Settings
2. Enter an invalid API key (e.g., "invalid-key")
3. Save settings
4. Start narration and share screen

**Expected Results**:
- ✅ Screen captures successfully
- ✅ Analysis fails with error
- ✅ Error message: "Invalid API key..."
- ✅ Status shows "Error"

### Test 7: Error Handling - Permission Denied

**Objective**: Verify error handling for denied screen sharing

1. Click "Start Narration"
2. Click "Cancel" on the screen sharing prompt

**Expected Results**:
- ✅ Error message appears with instructions
- ✅ Status shows "Error"
- ✅ Can retry by clicking "Start Narration" again

### Test 8: Redundancy Check

**Objective**: Verify redundant narration is skipped

1. Open a static manga page (same content)
2. Start narration
3. Let it capture the same page multiple times

**Expected Results**:
- ✅ First capture generates and speaks narration
- ✅ Subsequent captures detect redundancy
- ✅ Console shows "Skipping redundant narration"
- ✅ No audio plays for redundant captures

### Test 9: Multiple Panels

**Objective**: Verify panel detection and reading order

1. Open a manga page with multiple panels
2. Start narration

**Expected Results**:
- ✅ Console shows "Analysis complete: X panels detected"
- ✅ Narration describes panels in reading order
- ✅ Transitions between panels (e.g., "In the next panel...")
- ✅ Describes characters, actions, emotions, and dialogue

### Test 10: Voice Selection

**Objective**: Verify voice selection works

1. Open Settings
2. Select a different voice from dropdown
3. Save settings
4. Start narration

**Expected Results**:
- ✅ Narration uses the selected voice
- ✅ Voice persists across sessions

## Performance Verification

### Timing Requirements

Monitor console logs to verify:

1. **Vision Analysis**: Should complete within 5 seconds
   - Look for: `Analysis completed in Xms`
   - ✅ X should be < 5000ms

2. **Narration Generation**: Should complete within 3 seconds
   - Look for: `Narration generated in Xms (within 3 second requirement)`
   - ✅ X should be < 3000ms

3. **TTS Start**: Should begin within 2 seconds
   - Audio should start playing quickly after narration is generated
   - ✅ No noticeable delay

## Troubleshooting

### Extension Won't Load
- Check for errors on `chrome://extensions/`
- Verify all files are in correct directories
- Check manifest.json syntax

### Screen Capture Fails
- Ensure you're using Chrome (not Firefox/Safari)
- Check Chrome version is 88+
- Try reloading the extension

### Vision Analysis Fails
- Verify API key is correct
- Check OpenAI account has credits
- Check network connection
- Look for specific error in console

### No Audio
- Check system volume
- Verify browser isn't muted
- Try different voice in settings
- Check Web Speech API support

### Slow Performance
- Check internet connection speed
- Verify OpenAI API isn't rate-limited
- Increase capture interval to reduce API calls

## Success Criteria

All tests should pass with:
- ✅ No console errors (except expected test scenarios)
- ✅ All timing requirements met
- ✅ Proper error messages displayed
- ✅ Resources properly cleaned up
- ✅ Settings persist correctly
- ✅ Audio plays smoothly

## Known Limitations

- Requires active internet connection for vision analysis
- OpenAI API costs apply per image analyzed
- TTS voices depend on system/browser availability
- Screen capture requires user permission each session
