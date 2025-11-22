// Content Script - Screen Capture Module
const ScreenCaptureModule = {
  mediaStream: null,
  captureInterval: null,
  isCapturing: false,

  /**
   * Request screen capture permission and start capturing
   * Implements getDisplayMedia() API for screen sharing
   * @returns {Promise<MediaStream>}
   */
  async requestScreenCapture() {
    try {
      console.log('Requesting screen capture permission...');
      
      // Request screen capture using getDisplayMedia API
      // Minimum resolution: 1280x720 (Requirement 1.3)
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { min: 1280, ideal: 1920 },
          height: { min: 720, ideal: 1080 }
        },
        audio: false
      });
      
      this.mediaStream = stream;
      this.isCapturing = true;
      
      console.log('Screen capture permission granted');
      
      // Handle stream end event (user stops sharing)
      // Requirement 1.4: Release resources when user stops
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        console.log('Screen sharing stopped by user');
        this.stopCapture();
        chrome.runtime.sendMessage({
          type: 'CAPTURE_ERROR',
          error: 'Screen sharing was stopped'
        });
      });
      
      return stream;
      
    } catch (error) {
      console.error('Screen capture request failed:', error);
      
      // Requirement 1.5: Display error message on permission denied
      let errorMessage = 'Failed to capture screen';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Screen capture permission denied. Please allow screen sharing to use this extension.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No screen selected. Please select a screen to share.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Screen capture is not supported in this browser.';
      }
      
      chrome.runtime.sendMessage({
        type: 'CAPTURE_ERROR',
        error: errorMessage
      });
      
      throw error;
    }
  },

  /**
   * Capture a single frame from the media stream
   * Converts video stream to static image blob
   * @param {MediaStream} stream - The media stream to capture from
   * @returns {Promise<Blob>}
   */
  async captureFrame(stream) {
    if (!stream && !this.mediaStream) {
      throw new Error('No media stream available for capture');
    }
    
    const activeStream = stream || this.mediaStream;
    
    try {
      // Create video element to render stream
      const video = document.createElement('video');
      video.srcObject = activeStream;
      video.muted = true;
      
      // Start video playback
      await video.play();
      
      // Wait for video metadata to load
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror = reject;
        // Timeout after 5 seconds
        setTimeout(() => reject(new Error('Video load timeout')), 5000);
      });
      
      // Create canvas with video dimensions
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob (JPEG format, 90% quality)
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob from canvas'));
            }
          },
          'image/jpeg',
          0.9
        );
      });
      
      // Clean up video element
      video.pause();
      video.srcObject = null;
      
      console.log(`Frame captured: ${blob.size} bytes, ${canvas.width}x${canvas.height}`);
      
      return blob;
      
    } catch (error) {
      console.error('Failed to capture frame:', error);
      throw error;
    }
  },

  /**
   * Stop screen capture and release all resources
   * Requirement 1.4: Release resources when stopping
   */
  stopCapture() {
    console.log('Stopping screen capture and releasing resources...');
    
    // Clear capture interval
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
    }
    
    // Stop all media stream tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped track: ${track.kind}`);
      });
      this.mediaStream = null;
    }
    
    this.isCapturing = false;
    console.log('Screen capture resources released');
  }
};

// Message handler for background communication
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'START_CAPTURE':
      handleStartCapture()
        .then(() => sendResponse({ success: true }))
        .catch(error => {
          sendResponse({ success: false, error: error.message });
        });
      return true; // Keep channel open for async response
    
    case 'STOP_CAPTURE':
      ScreenCaptureModule.stopCapture();
      sendResponse({ success: true });
      break;
  }
});

async function handleStartCapture() {
  try {
    // Request screen capture permission
    const stream = await ScreenCaptureModule.requestScreenCapture();
    
    // Capture first frame immediately
    await captureAndSendFrame();
    
    // Set up interval for continuous capture
    const settings = await getSettings();
    const interval = (settings.captureInterval || 10) * 1000;
    
    ScreenCaptureModule.captureInterval = setInterval(() => {
      captureAndSendFrame().catch(error => {
        console.error('Periodic frame capture error:', error);
      });
    }, interval);
    
  } catch (error) {
    console.error('Failed to start capture:', error);
    throw error;
  }
}

async function captureAndSendFrame() {
  try {
    // Capture frame from stream
    const blob = await ScreenCaptureModule.captureFrame(ScreenCaptureModule.mediaStream);
    
    // Convert blob to base64 for message passing
    const reader = new FileReader();
    const base64Data = await new Promise((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    
    // Send captured image to background service worker
    chrome.runtime.sendMessage({
      type: 'SCREEN_CAPTURED',
      imageData: base64Data,
      timestamp: Date.now()
    });
    
    console.log('Frame captured and sent to background');
    
  } catch (error) {
    console.error('Failed to capture and send frame:', error);
    throw error;
  }
}

async function getSettings() {
  try {
    // Content scripts should get settings through message passing to background
    // For now, return defaults and let background handle settings
    return {
      captureInterval: 10 // Default 10 seconds
    };
  } catch (error) {
    console.error('Failed to load settings:', error);
    return { captureInterval: 10 };
  }
}

console.log('Manga Narrator content script loaded');
