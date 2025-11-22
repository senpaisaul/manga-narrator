// Unit Tests for Narration Engine
// Run these tests in the browser console on the extension's background page

const NarrationEngineTests = {
  async runAll() {
    console.log('=== Running Narration Engine Tests ===\n');
    
    await this.testGenerateNarration();
    await this.testFormatForSpeech();
    await this.testIsRedundant();
    await this.testNarrateCharacters();
    
    console.log('\n=== Narration Engine Tests Complete ===');
  },

  async testGenerateNarration() {
    console.log('Test: Generate Narration');
    
    const mockAnalysis = {
      overallScene: "A peaceful garden scene",
      readingOrder: [0, 1],
      panels: [
        {
          id: 0,
          setting: "Cherry blossom garden",
          characters: [
            {
              description: "A young girl in kimono",
              position: "under a tree",
              expression: "peaceful smile"
            }
          ],
          actions: ["Girl watches petals fall"],
          emotions: ["serenity", "joy"],
          dialogue: ["Spring is beautiful"]
        },
        {
          id: 1,
          setting: "Same garden, closer view",
          characters: [],
          actions: ["Petals swirl in the wind"],
          emotions: ["tranquility"],
          dialogue: []
        }
      ]
    };

    const narration = await NarrationEngine.generateNarration(mockAnalysis);
    
    console.assert(typeof narration === 'string', "Returns string");
    console.assert(narration.length > 0, "Narration is not empty");
    console.assert(narration.includes('scene'), "Includes scene description");
    console.log('Sample narration:', narration.substring(0, 100) + '...');
    console.log('✓ Generate Narration test passed\n');
  },

  testFormatForSpeech() {
    console.log('Test: Format For Speech');
    
    const rawText = "This is   a test.  With extra   spaces. And *special* _characters_!";
    const formatted = NarrationEngine.formatForSpeech(rawText);
    
    console.assert(!formatted.includes('  '), "No double spaces");
    console.assert(!formatted.includes('*'), "No asterisks");
    console.assert(!formatted.includes('_'), "No underscores");
    console.assert(formatted.endsWith('.') || formatted.endsWith('!') || formatted.endsWith('?'), "Ends with punctuation");
    
    console.log('Formatted:', formatted);
    console.log('✓ Format For Speech test passed\n');
  },

  testIsRedundant() {
    console.log('Test: Is Redundant');
    
    const text1 = "The hero stands on the rooftop looking determined";
    const text2 = "The hero stands on the rooftop looking determined";
    const text3 = "A completely different scene with a villain laughing";
    
    const redundant1 = NarrationEngine.isRedundant(text2, text1);
    const redundant2 = NarrationEngine.isRedundant(text3, text1);
    
    console.assert(redundant1 === true, "Identical text is redundant");
    console.assert(redundant2 === false, "Different text is not redundant");
    
    console.log('✓ Is Redundant test passed\n');
  },

  testNarrateCharacters() {
    console.log('Test: Narrate Characters');
    
    const characters = [
      {
        description: "A brave knight",
        position: "in the foreground",
        expression: "fierce determination"
      },
      {
        description: "A wise wizard",
        position: "in the background",
        expression: "calm confidence"
      }
    ];

    const narration = NarrationEngine.narrateCharacters(characters);
    
    console.assert(typeof narration === 'string', "Returns string");
    console.assert(narration.includes('knight'), "Includes first character");
    console.assert(narration.includes('wizard'), "Includes second character");
    console.assert(narration.includes('and'), "Uses 'and' for multiple characters");
    
    console.log('Character narration:', narration);
    console.log('✓ Narrate Characters test passed\n');
  }
};

// Export for manual testing
console.log('Narration Engine Tests loaded. Run: NarrationEngineTests.runAll()');
