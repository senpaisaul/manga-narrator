# Unit Tests

This directory contains unit tests for the core services of the Manga Narrator extension.

## Running Tests

### Method 1: Background Service Worker Console

1. Open Chrome and go to `chrome://extensions/`
2. Find "Manga Narrator" extension
3. Click "service worker" link to open the background console
4. Load the test file by copying and pasting its contents
5. Run the tests:

```javascript
// For Vision Service tests
VisionServiceTests.runAll();

// For Narration Engine tests
NarrationEngineTests.runAll();

// For Storage Service tests
StorageServiceTests.runAll();
```

### Method 2: Import in Background Script

Temporarily add to `background/background.js`:

```javascript
importScripts('tests/test-vision-service.js');
importScripts('tests/test-narration-engine.js');
importScripts('tests/test-storage-service.js');
```

Then reload the extension and run tests from the console.

## Test Files

### test-vision-service.js
Tests for the Vision Analysis Service:
- Parse analysis response from AI
- Determine reading order
- Validate timing requirements
- Retry logic with exponential backoff

### test-narration-engine.js
Tests for the Narration Engine:
- Generate narration from visual analysis
- Format text for speech
- Detect redundant narrations
- Narrate characters with proper grammar

### test-storage-service.js
Tests for the Storage Service:
- Save and retrieve settings
- Reset to default settings
- Handle missing settings gracefully

## Expected Output

All tests should pass with output like:

```
=== Running Vision Service Tests ===

Test: Parse Analysis Response
✓ Parse Analysis Response test passed

Test: Determine Reading Order
✓ Determine Reading Order test passed

Test: Validate Analysis Timing
✓ Validate Analysis Timing test passed

Test: Retry Logic
✓ Retry Logic test passed

=== Vision Service Tests Complete ===
```

## Manual Testing

For integration testing and end-to-end flows, see `TESTING.md` in the root directory.

## Notes

- These are basic unit tests for core functionality
- They use `console.assert()` for assertions
- Tests run in the browser environment, not Node.js
- Some tests require Chrome extension APIs to be available
