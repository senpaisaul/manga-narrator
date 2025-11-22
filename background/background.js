// Background Service Worker - Main orchestrator
console.log('Background service worker starting...');

// Import services (paths relative to extension root, not background folder)
try {
  importScripts('../services/vision-service.js');
  console.log('✓ vision-service.js loaded');
} catch (error) {
  console.error('✗ Failed to load vision-service.js:', error);
}

try {
  importScripts('../services/narration-engine.js');
  console.log('✓ narration-engine.js loaded');
} catch (error) {
  console.error('✗ Failed to load narration-engine.js:', error);
}

try {
  importScripts('../services/tts-service.js');
  console.log('✓ tts-service.js loaded');
} catch (error) {
  console.error('✗ Failed to load tts-service.js:', error);
}

console.log('Service scripts import complete');

// State management
// Requirement 6.2: Track narration status
const NarrationState = {
  status: 'idle', // idle, capturing, analyzing, narrating, paused, error
  startTime: null,
  captureCount: 0,
  lastCaptureTime: null,
  previousNarration: null,
  activeTabId: null
};

// Status management
// Requirement 6.2: Track and broadcast status
function updateStatus(status, message) {
  const previousStatus = NarrationState.status;
  NarrationState.status = status;
  
  console.log(`Status change: ${previousStatus} → ${status}`);
  
  // Track timing
  if (status === 'capturing' && previousStatus === 'idle') {
    NarrationState.startTime = Date.now();
    NarrationState.captureCount = 0;
  }
  
  // Requirement 5.5: Broadcast status updates to popup UI
  broadcastStatus(status, message);
}

function broadcastStatus(status, message) {
  chrome.runtime.sendMessage({
    type: 'STATUS_UPDATE',
    status: status,
    message: message
  }).catch(() => {
    // Popup might be closed, ignore error
  });
}

function broadcastError(message) {
  chrome.runtime.sendMessage({
    type: 'ERROR',
    message: message
  }).catch(() => {
    // Popup might be closed, ignore error
  });
}

// Message handler
// Requirement 6.1: Set up message passing between popup, content script, and background
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('Received message:', message.type);
  
  switch (message.type) {
    case 'GET_STATUS':
      // Return current status to popup
      sendResponse({ 
        status: NarrationState.status,
        captureCount: NarrationState.captureCount,
        uptime: NarrationState.startTime ? Date.now() - NarrationState.startTime : 0
      });
      break;
    
    case 'NARRATION_STARTED':
      // Popup has started screen capture
      console.log('Narration started from popup');
      updateStatus('capturing', 'Waiting for first capture...');
      sendResponse({ success: true });
      break;
    
    case 'START_NARRATION':
      // Legacy support - not used anymore since popup handles capture
      console.log('START_NARRATION received (legacy)');
      sendResponse({ success: true });
      break;
    
    case 'PAUSE_NARRATION':
      // Requirement 5.3: Pause audio playback without stopping capture
      handlePauseNarration();
      sendResponse({ success: true });
      break;
    
    case 'RESUME_NARRATION':
      // Resume narration from paused state
      handleResumeNarration();
      sendResponse({ success: true });
      break;
    
    case 'STOP_NARRATION':
      // Requirement 5.4: Stop narration and release all resources
      handleStopNarration();
      sendResponse({ success: true });
      break;
    
    case 'SCREEN_CAPTURED':
      // Handle captured screen image from content script
      handleScreenCaptured(message.imageData, message.timestamp)
        .catch(error => {
          console.error('Screen capture handling error:', error);
          broadcastError(error.message);
        });
      sendResponse({ success: true });
      break;
    
    case 'CAPTURE_ERROR':
      // Handle capture errors from content script
      handleCaptureError(message.error);
      sendResponse({ success: true });
      break;
    
    default:
      console.warn('Unknown message type:', message.type);
      sendResponse({ success: false, error: 'Unknown message type' });
  }
});

async function handleStartNarration() {
  console.log('Starting narration...');
  updateStatus('capturing', 'Requesting screen capture...');
  
  try {
    // Request screen capture from content script
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) {
      throw new Error('No active tab found');
    }
    
    // Store active tab ID for later communication
    NarrationState.activeTabId = tabs[0].id;
    
    console.log('Sending START_CAPTURE to tab:', tabs[0].id);
    
    // Try to send message to content script
    try {
      await chrome.tabs.sendMessage(tabs[0].id, { type: 'START_CAPTURE' });
      console.log('START_CAPTURE message sent successfully');
    } catch (error) {
      // Content script might not be injected yet, try to inject it
      console.log('Content script not responding, attempting to inject...');
      
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['content/content.js']
        });
        
        console.log('Content script injected, retrying START_CAPTURE...');
        
        // Wait a moment for script to initialize
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Retry sending message
        await chrome.tabs.sendMessage(tabs[0].id, { type: 'START_CAPTURE' });
        console.log('START_CAPTURE message sent after injection');
      } catch (injectError) {
        console.error('Failed to inject content script:', injectError);
        throw new Error('Could not communicate with page. Try reloading the page and extension.');
      }
    }
  } catch (error) {
    console.error('Failed to start capture:', error);
    updateStatus('error');
    broadcastError('Failed to start screen capture: ' + error.message);
    throw error;
  }
}

function handlePauseNarration() {
  console.log('Pausing narration...');
  updateStatus('paused');
  
  // Pause TTS using service
  // Requirement 4.4: Immediate pause response
  TTSService.pause();
}

function handleResumeNarration() {
  console.log('Resuming narration...');
  updateStatus('narrating');
  
  // Resume TTS using service
  // Requirement 4.5: Continue from paused position
  TTSService.resume();
}

function handleStopNarration() {
  console.log('Stopping narration...');
  
  // Requirement 1.4 & 6.2: Handle resource cleanup on stop
  
  // Note: TTS is handled in popup, not here
  
  // Reset state
  NarrationState.previousNarration = null;
  NarrationState.startTime = null;
  NarrationState.captureCount = 0;
  NarrationState.lastCaptureTime = null;
  NarrationState.activeTabId = null;
  
  updateStatus('idle', 'Ready');
  console.log('All resources released, state reset');
}

async function handleScreenCaptured(imageData, timestamp) {
  // Update state tracking
  NarrationState.captureCount++;
  NarrationState.lastCaptureTime = timestamp;
  
  console.log(`Screen captured #${NarrationState.captureCount} at`, new Date(timestamp).toLocaleTimeString());
  
  // Requirement 6.1: Coordinate capture → analysis → narration flow
  updateStatus('analyzing', 'Analyzing manga page...');
  
  try {
    // Step 1: Analyze image with vision AI
    const analysis = await analyzeImage(imageData);
    console.log('Analysis complete:', analysis.panels.length, 'panels detected');
    
    // Step 2: Generate narration from analysis
    updateStatus('narrating', 'Generating narration...');
    const narrationSegments = await generateNarration(analysis);
    
    // Skip if narration is redundant (null returned)
    if (narrationSegments === null) {
      console.log('Skipping redundant narration');
      updateStatus('capturing', 'Waiting for next capture...');
      return;
    }
    
    // Step 3: Speak each narration segment with appropriate voice
    for (const segment of narrationSegments) {
      console.log(`Speaking (${segment.gender}, ${segment.emotion}):`, segment.text.substring(0, 50) + '...');
      await speakNarration(segment);
    }
    
    // Return to capturing state for continuous operation
    updateStatus('capturing', 'Waiting for next capture...');
    console.log(`Narration cycle #${NarrationState.captureCount} complete`);
    
  } catch (error) {
    console.error('Processing error:', error);
    updateStatus('error');
    
    // Provide specific error messages
    let errorMessage = 'Failed to process manga page: ' + error.message;
    if (error.message.includes('API key')) {
      errorMessage = 'OpenAI API key not configured. Please add your API key in Settings.';
    } else if (error.message.includes('Rate limit')) {
      errorMessage = 'API rate limit exceeded. Please wait a moment before trying again.';
    }
    
    broadcastError(errorMessage);
  }
}

function handleCaptureError(error) {
  console.error('Capture error:', error);
  updateStatus('error');
  broadcastError(error);
}

async function analyzeImage(imageData) {
  try {
    const startTime = Date.now();
    const analysis = await VisionService.analyzeImage(imageData);
    
    // Validate timing requirement (2.3: within 5 seconds)
    VisionService.validateAnalysisTiming(startTime);
    
    return analysis;
  } catch (error) {
    console.error('Image analysis error:', error);
    throw error;
  }
}

async function generateNarration(analysis) {
  try {
    const startTime = Date.now();
    
    // Generate narration from analysis (returns array of segments with metadata)
    const narrationSegments = await NarrationEngine.generateNarration(analysis);
    
    const duration = Date.now() - startTime;
    
    // Requirement 3.4: Generate narration within 3 seconds
    if (duration > 3000) {
      console.warn(`Narration generation took ${duration}ms, exceeding 3 second target`);
    } else {
      console.log(`Narration generated in ${duration}ms (within 3 second requirement)`);
    }
    
    // Check if we have any narration
    if (!narrationSegments || narrationSegments.length === 0) {
      return null;
    }
    
    // Combine text for redundancy check
    const combinedText = narrationSegments.map(s => s.text).join(' ');
    
    // Requirement 3.5: Check for redundancy with previous narration
    if (NarrationState.previousNarration && NarrationEngine.isRedundant(combinedText, NarrationState.previousNarration)) {
      console.log('Narration is redundant with previous, skipping...');
      return null; // Skip redundant narration
    }
    
    // Store for next redundancy check
    NarrationState.previousNarration = combinedText;
    
    return narrationSegments;
  } catch (error) {
    console.error('Narration generation error:', error);
    throw error;
  }
}

async function speakNarration(segment) {
  try {
    console.log('Generating human-like TTS audio...');
    
    // Get API key
    const settings = await chrome.storage.sync.get('settings');
    const apiKey = settings.settings?.apiKey;
    
    if (!apiKey) {
      throw new Error('API key not configured');
    }
    
    // Select voice based on gender
    let voice = 'nova'; // Default female voice
    if (segment.gender === 'male') {
      voice = 'onyx'; // Deep male voice
    } else if (segment.gender === 'female') {
      voice = 'shimmer'; // Soft female voice
    }
    
    // Adjust speed based on emotion
    let speed = 1.0;
    if (segment.emotion === 'excited' || segment.emotion === 'shouting') {
      speed = 1.15;
    } else if (segment.emotion === 'sad' || segment.emotion === 'whisper') {
      speed = 0.9;
    } else if (segment.emotion === 'surprised') {
      speed = 1.1;
    }
    
    console.log(`Using voice: ${voice}, speed: ${speed}`);
    
    // Use OpenAI TTS API for human-like voice
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'tts-1-hd', // Use HD model for better quality
        voice: voice,
        input: segment.text,
        speed: speed
      })
    });
    
    if (!response.ok) {
      throw new Error(`TTS API failed: ${response.status}`);
    }
    
    // Get audio blob
    const audioBlob = await response.blob();
    
    // Convert to base64 for message passing
    const reader = new FileReader();
    const audioData = await new Promise((resolve) => {
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(audioBlob);
    });
    
    console.log('TTS audio generated, sending to popup...');
    
    // Send audio to popup for playback and wait for it to finish
    await new Promise((resolve) => {
      chrome.runtime.sendMessage({
        type: 'PLAY_AUDIO',
        audioData: audioData
      }).catch(() => {
        console.log('Popup not available for audio playback');
        resolve();
      });
      
      // Wait for audio duration (estimate based on text length)
      const estimatedDuration = (segment.text.length / 15) * 1000; // ~15 chars per second
      setTimeout(resolve, estimatedDuration);
    });
    
    console.log('Audio playback complete');
    
  } catch (error) {
    console.error('TTS error:', error);
    broadcastError('Text-to-speech failed: ' + error.message);
  }
}

console.log('Manga Narrator background service worker loaded');
console.log('Current status:', NarrationState.status);
console.log('Message listener registered');

// Test that services are available
if (typeof VisionService === 'undefined') {
  console.error('VisionService not loaded!');
}
if (typeof NarrationEngine === 'undefined') {
  console.error('NarrationEngine not loaded!');
}
if (typeof TTSService === 'undefined') {
  console.error('TTSService not loaded!');
}

console.log('All services loaded successfully');
