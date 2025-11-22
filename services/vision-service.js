// Vision Analysis Service - OpenAI GPT-4 Vision Integration
const VisionService = {
  apiEndpoint: 'https://api.openai.com/v1/chat/completions',
  model: 'gpt-4o',
  maxRetries: 3, // Requirement 2.4: Retry up to 2 additional times (3 total attempts)
  baseDelay: 1000, // Base delay for exponential backoff (1 second)

  /**
   * Analyze manga image using GPT-4 Vision with retry logic
   * Requirement 2.1: Send image to vision AI model for analysis
   * Requirement 2.2: Extract characters, actions, emotions, dialogue, scene composition
   * Requirement 2.4: Retry analysis up to 2 additional times on failure
   * Requirement 2.5: Return structured data with visual elements
   * @param {string} imageData - Base64 encoded image data
   * @returns {Promise<VisualAnalysis>}
   */
  async analyzeImage(imageData) {
    console.log('Starting vision analysis...');
    
    // Use retry wrapper for resilient API calls
    return await this.retryWithBackoff(
      () => this.performAnalysis(imageData),
      this.maxRetries
    );
  },

  /**
   * Perform the actual vision analysis API call
   * @param {string} imageData - Base64 encoded image data
   * @returns {Promise<VisualAnalysis>}
   */
  async performAnalysis(imageData) {
    try {
      // Get API key from settings
      const settings = await this.getSettings();
      if (!settings.apiKey) {
        throw new Error('OpenAI API key not configured. Please add your API key in Settings.');
      }

      // Prepare the structured prompt for manga analysis
      const prompt = this.createMangaAnalysisPrompt();

      // Call OpenAI API
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageData,
                    detail: 'high'
                  }
                }
              ]
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      // Handle API errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || response.statusText;
        
        // Requirement 7.2: Handle specific error types
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your OpenAI API key in Settings.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        } else if (response.status >= 500) {
          throw new Error(`OpenAI service error (${response.status}). Retrying...`);
        } else {
          throw new Error(`API request failed: ${response.status} - ${errorMessage}`);
        }
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid API response format');
      }

      const analysisText = data.choices[0].message.content;

      // Parse the response into structured data
      const analysis = this.parseAnalysisResponse(analysisText);

      console.log('Vision analysis complete:', analysis);
      return analysis;

    } catch (error) {
      console.error('Vision analysis failed:', error);
      throw error;
    }
  },

  /**
   * Retry function with exponential backoff
   * Requirement 2.4: Implement retry mechanism with exponential backoff
   * @param {Function} fn - Function to retry
   * @param {number} maxRetries - Maximum number of retry attempts
   * @param {number} attempt - Current attempt number
   * @returns {Promise<any>}
   */
  async retryWithBackoff(fn, maxRetries, attempt = 1) {
    try {
      return await fn();
    } catch (error) {
      // Don't retry on authentication errors or invalid API key
      if (error.message.includes('Invalid API key') || 
          error.message.includes('not configured')) {
        throw error;
      }

      // Check if we should retry
      if (attempt >= maxRetries) {
        console.error(`Max retries (${maxRetries}) reached. Giving up.`);
        throw new Error(`Vision analysis failed after ${maxRetries} attempts: ${error.message}`);
      }

      // Calculate delay with exponential backoff
      const delay = this.baseDelay * Math.pow(2, attempt - 1);
      console.log(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms delay...`);

      // Wait before retrying
      await this.sleep(delay);

      // Retry
      return await this.retryWithBackoff(fn, maxRetries, attempt + 1);
    }
  },

  /**
   * Sleep utility for delays
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Create structured prompt for manga analysis
   * Instructs AI to identify panels, characters, actions, emotions, dialogue, and reading order
   * @returns {string}
   */
  createMangaAnalysisPrompt() {
    return `You are analyzing a manga page. Please provide a detailed analysis in the following JSON format:

{
  "overallScene": "Brief description of the overall scene and atmosphere",
  "readingOrder": [0, 1, 2, ...],
  "panels": [
    {
      "id": 0,
      "setting": "Description of the panel's setting/background",
      "characters": [
        {
          "description": "Character appearance and identity",
          "position": "Where they are in the panel",
          "expression": "Facial expression and body language",
          "gender": "male or female",
          "isSpeaking": true
        }
      ],
      "actions": ["Action 1", "Action 2"],
      "emotions": ["Emotion 1", "Emotion 2"],
      "dialogue": ["Dialogue line 1", "Dialogue line 2"]
    }
  ]
}

Instructions:
1. Identify all manga panels in the image
2. Determine the reading order (typically right-to-left, top-to-bottom for Japanese manga)
3. For each panel, describe:
   - The setting and background
   - All visible characters (appearance, position, expressions, gender, and whether they are speaking)
   - Actions taking place
   - Emotions being conveyed
   - Any visible dialogue or text (if readable)
4. For characters: Identify their gender (male/female) and mark "isSpeaking": true for the character who is speaking the dialogue
5. For dialogue: Extract the text EXACTLY as written in the manga. Use casual, natural language. Don't add formal phrases or explanations.
6. Provide the overall scene context

Return ONLY the JSON object, no additional text.`;
  },

  /**
   * Parse AI response into structured VisualAnalysis object
   * @param {string} responseText - Raw text response from AI
   * @returns {VisualAnalysis}
   */
  parseAnalysisResponse(responseText) {
    try {
      // Try to extract JSON from response
      let jsonText = responseText.trim();
      
      // Remove markdown code blocks if present
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }

      const parsed = JSON.parse(jsonText);

      // Validate and structure the response
      const analysis = {
        overallScene: parsed.overallScene || 'A manga scene',
        readingOrder: Array.isArray(parsed.readingOrder) ? parsed.readingOrder : [],
        panels: []
      };

      // Process panels
      if (Array.isArray(parsed.panels)) {
        analysis.panels = parsed.panels.map((panel, index) => ({
          id: panel.id !== undefined ? panel.id : index,
          setting: panel.setting || '',
          characters: Array.isArray(panel.characters) ? panel.characters.map(char => ({
            description: char.description || '',
            position: char.position || '',
            expression: char.expression || ''
          })) : [],
          actions: Array.isArray(panel.actions) ? panel.actions : [],
          emotions: Array.isArray(panel.emotions) ? panel.emotions : [],
          dialogue: Array.isArray(panel.dialogue) ? panel.dialogue : []
        }));
      }

      // Generate reading order if not provided
      if (analysis.readingOrder.length === 0 && analysis.panels.length > 0) {
        analysis.readingOrder = analysis.panels.map((_, index) => index);
      }

      return analysis;

    } catch (error) {
      console.error('Failed to parse analysis response:', error);
      console.log('Raw response:', responseText);
      
      // Return minimal valid structure on parse failure
      return {
        overallScene: 'Unable to parse manga analysis',
        readingOrder: [0],
        panels: [{
          id: 0,
          setting: 'Analysis parsing failed',
          characters: [],
          actions: [],
          emotions: [],
          dialogue: []
        }]
      };
    }
  },

  /**
   * Extract panel layout from vision analysis
   * Requirement 2.3: Identify panel layout within 5 seconds
   * @param {string} imageData - Base64 encoded image
   * @returns {Promise<Panel[]>}
   */
  async extractPanels(imageData) {
    const startTime = Date.now();
    
    try {
      const analysis = await this.analyzeImage(imageData);
      
      const duration = Date.now() - startTime;
      console.log(`Panel extraction completed in ${duration}ms`);
      
      // Requirement 2.3: Should complete within 5 seconds
      if (duration > 5000) {
        console.warn(`Panel extraction took ${duration}ms, exceeding 5 second target`);
      }
      
      return analysis.panels;
    } catch (error) {
      console.error('Panel extraction failed:', error);
      throw error;
    }
  },

  /**
   * Determine reading order for manga panels
   * Requirement 2.3: Identify reading order within 5 seconds
   * Typically right-to-left, top-to-bottom for Japanese manga
   * @param {Panel[]} panels - Array of panel objects
   * @returns {number[]}
   */
  determineReadingOrder(panels) {
    console.log('Determining reading order for', panels.length, 'panels');
    
    // Reading order is determined by the AI during analysis
    // This method provides a fallback if AI doesn't provide order
    
    if (!panels || panels.length === 0) {
      return [];
    }

    // Default: sequential order (0, 1, 2, ...)
    // The AI prompt instructs it to determine proper manga reading order
    const order = panels.map((_, index) => index);
    
    console.log('Reading order:', order);
    return order;
  },

  /**
   * Validate that analysis meets timing requirements
   * Requirement 2.3: Panel layout and reading order within 5 seconds
   * @param {number} startTime - Analysis start timestamp
   * @returns {boolean}
   */
  validateAnalysisTiming(startTime) {
    const duration = Date.now() - startTime;
    const withinLimit = duration <= 5000;
    
    if (!withinLimit) {
      console.warn(`Analysis took ${duration}ms, exceeding 5 second requirement`);
    } else {
      console.log(`Analysis completed in ${duration}ms (within 5 second requirement)`);
    }
    
    return withinLimit;
  },

  /**
   * Get settings from Chrome storage
   * @returns {Promise<Object>}
   */
  async getSettings() {
    try {
      const result = await chrome.storage.sync.get('settings');
      return result.settings || {};
    } catch (error) {
      console.error('Failed to load settings:', error);
      return {};
    }
  }
};

// Export for use in background script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VisionService;
}
