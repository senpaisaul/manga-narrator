// Unit Tests for Vision Service
// Run these tests in the browser console on the extension's background page

const VisionServiceTests = {
  async runAll() {
    console.log('=== Running Vision Service Tests ===\n');
    
    await this.testParseAnalysisResponse();
    await this.testDetermineReadingOrder();
    await this.testValidateAnalysisTiming();
    await this.testRetryLogic();
    
    console.log('\n=== Vision Service Tests Complete ===');
  },

  testParseAnalysisResponse() {
    console.log('Test: Parse Analysis Response');
    
    const mockResponse = JSON.stringify({
      overallScene: "A dramatic battle scene",
      readingOrder: [0, 1, 2],
      panels: [
        {
          id: 0,
          setting: "City rooftop at sunset",
          characters: [
            {
              description: "A young hero in red costume",
              position: "center",
              expression: "determined look"
            }
          ],
          actions: ["Hero prepares to jump"],
          emotions: ["tension", "determination"],
          dialogue: ["I won't give up!"]
        }
      ]
    });

    const result = VisionService.parseAnalysisResponse(mockResponse);
    
    console.assert(result.overallScene === "A dramatic battle scene", "Overall scene parsed");
    console.assert(result.panels.length === 1, "Panels array has correct length");
    console.assert(result.panels[0].characters.length === 1, "Characters parsed");
    console.assert(result.readingOrder.length === 3, "Reading order parsed");
    
    console.log('✓ Parse Analysis Response test passed\n');
  },

  testDetermineReadingOrder() {
    console.log('Test: Determine Reading Order');
    
    const mockPanels = [
      { id: 0, setting: "Panel 1" },
      { id: 1, setting: "Panel 2" },
      { id: 2, setting: "Panel 3" }
    ];

    const order = VisionService.determineReadingOrder(mockPanels);
    
    console.assert(Array.isArray(order), "Returns array");
    console.assert(order.length === 3, "Correct length");
    console.assert(order[0] === 0 && order[1] === 1 && order[2] === 2, "Sequential order");
    
    console.log('✓ Determine Reading Order test passed\n');
  },

  testValidateAnalysisTiming() {
    console.log('Test: Validate Analysis Timing');
    
    // Test within limit
    const startTime1 = Date.now() - 3000; // 3 seconds ago
    const result1 = VisionService.validateAnalysisTiming(startTime1);
    console.assert(result1 === true, "Within 5 second limit");
    
    // Test exceeding limit
    const startTime2 = Date.now() - 6000; // 6 seconds ago
    const result2 = VisionService.validateAnalysisTiming(startTime2);
    console.assert(result2 === false, "Exceeds 5 second limit");
    
    console.log('✓ Validate Analysis Timing test passed\n');
  },

  async testRetryLogic() {
    console.log('Test: Retry Logic');
    
    let attemptCount = 0;
    const mockFn = async () => {
      attemptCount++;
      if (attemptCount < 3) {
        throw new Error('Temporary failure');
      }
      return 'success';
    };

    try {
      const result = await VisionService.retryWithBackoff(mockFn, 3);
      console.assert(result === 'success', "Eventually succeeds");
      console.assert(attemptCount === 3, "Retried correct number of times");
      console.log('✓ Retry Logic test passed\n');
    } catch (error) {
      console.error('✗ Retry Logic test failed:', error);
    }
  }
};

// Export for manual testing
console.log('Vision Service Tests loaded. Run: VisionServiceTests.runAll()');
