// Narration Engine - Converts visual analysis into narrative text
const NarrationEngine = {
  /**
   * Generate narrative text from visual analysis
   * Requirement 3.1: Generate narrative text describing manga content
   * Requirement 3.2: Create narration in storytelling tone conveying emotions and actions
   * Requirement 3.3: Organize narration following natural reading order
   * @param {VisualAnalysis} analysis - Structured visual analysis data
   * @returns {Promise<string>}
   */
  async generateNarration(analysis) {
    console.log('Generating narration from analysis...');
    const startTime = Date.now();

    try {
      if (!analysis || !analysis.panels || analysis.panels.length === 0) {
        return 'No manga content detected in the image.';
      }

      // Build narrative following reading order
      const narrativeParts = [];

      // Skip overall scene context - only narrate dialogue
      
      // Process panels in reading order
      const readingOrder = analysis.readingOrder || analysis.panels.map((_, i) => i);
      
      const narrationSegments = [];
      
      for (let i = 0; i < readingOrder.length; i++) {
        const panelIndex = readingOrder[i];
        const panel = analysis.panels[panelIndex];
        
        if (!panel) continue;

        // Generate narration for this panel (returns object with text, gender, emotion)
        const panelNarration = this.generatePanelNarration(panel, i, readingOrder.length);
        
        if (panelNarration) {
          narrationSegments.push(panelNarration);
        }
      }

      const duration = Date.now() - startTime;
      console.log(`Narration generated in ${duration}ms: ${narrationSegments.length} segments`);

      // Return array of narration segments with metadata
      return narrationSegments;

    } catch (error) {
      console.error('Narration generation failed:', error);
      throw error;
    }
  },

  /**
   * Format scene introduction
   * @param {string} sceneDescription - Overall scene description
   * @returns {string}
   */
  formatSceneIntro(sceneDescription) {
    return `The scene shows ${sceneDescription}.`;
  },

  /**
   * Generate narration for a single panel
   * Requirement 3.2: Storytelling tone with emotions and actions
   * @param {Panel} panel - Panel data
   * @param {number} panelNumber - Panel sequence number
   * @param {number} totalPanels - Total number of panels
   * @returns {string}
   */
  generatePanelNarration(panel, panelNumber, totalPanels) {
    // Narrate dialogue with emotional context and return metadata
    
    // Include dialogue if present
    if (panel.dialogue && panel.dialogue.length > 0) {
      return this.narrateDialogueWithEmotion(panel);
    }

    return null;
  },

  /**
   * Get transition phrase between panels
   * @param {number} panelNumber - Current panel number
   * @returns {string}
   */
  getTransitionPhrase(panelNumber) {
    const transitions = [
      'In the next panel,',
      'Moving forward,',
      'Then,',
      'Next,',
      'Following this,',
      'Subsequently,'
    ];
    
    // Use modulo to cycle through transitions
    return transitions[panelNumber % transitions.length];
  },

  /**
   * Narrate setting/background
   * @param {string} setting - Setting description
   * @returns {string}
   */
  narrateSetting(setting) {
    return `The setting is ${setting}.`;
  },

  /**
   * Narrate characters with expressions and positions
   * Requirement 3.2: Convey character emotions
   * @param {Character[]} characters - Array of character objects
   * @returns {string}
   */
  narrateCharacters(characters) {
    if (characters.length === 0) return '';

    const characterDescriptions = characters.map(char => {
      const parts = [];
      
      if (char.description) {
        parts.push(char.description);
      }
      
      if (char.position) {
        parts.push(`positioned ${char.position}`);
      }
      
      if (char.expression) {
        parts.push(`with ${char.expression}`);
      }
      
      return parts.join(', ');
    });

    if (characterDescriptions.length === 1) {
      return `We see ${characterDescriptions[0]}.`;
    } else if (characterDescriptions.length === 2) {
      return `We see ${characterDescriptions[0]}, and ${characterDescriptions[1]}.`;
    } else {
      const lastChar = characterDescriptions.pop();
      return `We see ${characterDescriptions.join(', ')}, and ${lastChar}.`;
    }
  },

  /**
   * Narrate actions taking place
   * Requirement 3.2: Describe actions
   * @param {string[]} actions - Array of action descriptions
   * @returns {string}
   */
  narrateActions(actions) {
    if (actions.length === 0) return '';

    if (actions.length === 1) {
      return `${actions[0]}.`;
    } else if (actions.length === 2) {
      return `${actions[0]}, and ${actions[1]}.`;
    } else {
      const lastAction = actions[actions.length - 1];
      const otherActions = actions.slice(0, -1).join(', ');
      return `${otherActions}, and ${lastAction}.`;
    }
  },

  /**
   * Narrate emotions being conveyed
   * Requirement 3.2: Convey emotions
   * @param {string[]} emotions - Array of emotion descriptions
   * @returns {string}
   */
  narrateEmotions(emotions) {
    if (emotions.length === 0) return '';

    const emotionList = emotions.join(' and ');
    return `The atmosphere conveys ${emotionList}.`;
  },

  /**
   * Narrate dialogue with emotional context
   * @param {Panel} panel - Panel containing dialogue and emotions
   * @returns {Object} Object with dialogue text and metadata
   */
  narrateDialogueWithEmotion(panel) {
    if (!panel.dialogue || panel.dialogue.length === 0) return null;

    const dialogue = panel.dialogue;
    const emotions = panel.emotions || [];
    const expressions = panel.characters?.map(c => c.expression).filter(e => e) || [];
    
    // Find the speaking character's gender
    const speakingCharacter = panel.characters?.find(c => c.isSpeaking) || panel.characters?.[0];
    const gender = speakingCharacter?.gender || 'neutral';
    
    // Combine emotions and expressions to understand the tone
    const emotionalContext = [...emotions, ...expressions].join(' ');
    
    // Add emotional cues to dialogue based on context
    let narratedDialogue = dialogue.join('. ');
    let emotion = 'neutral';
    
    // Add emotional emphasis based on detected emotions
    if (emotionalContext.toLowerCase().includes('excit') || 
        emotionalContext.toLowerCase().includes('happy') ||
        emotionalContext.toLowerCase().includes('joy')) {
      narratedDialogue = this.addExcitement(narratedDialogue);
      emotion = 'excited';
    } else if (emotionalContext.toLowerCase().includes('sad') || 
               emotionalContext.toLowerCase().includes('cry') ||
               emotionalContext.toLowerCase().includes('tear')) {
      narratedDialogue = this.addSadness(narratedDialogue);
      emotion = 'sad';
    } else if (emotionalContext.toLowerCase().includes('angry') || 
               emotionalContext.toLowerCase().includes('mad') ||
               emotionalContext.toLowerCase().includes('furious')) {
      narratedDialogue = this.addAnger(narratedDialogue);
      emotion = 'angry';
    } else if (emotionalContext.toLowerCase().includes('shock') || 
               emotionalContext.toLowerCase().includes('surprise') ||
               emotionalContext.toLowerCase().includes('amaz')) {
      narratedDialogue = this.addSurprise(narratedDialogue);
      emotion = 'surprised';
    } else if (emotionalContext.toLowerCase().includes('whisper') || 
               emotionalContext.toLowerCase().includes('quiet')) {
      narratedDialogue = this.addWhisper(narratedDialogue);
      emotion = 'whisper';
    } else if (emotionalContext.toLowerCase().includes('shout') || 
               emotionalContext.toLowerCase().includes('yell') ||
               emotionalContext.toLowerCase().includes('scream')) {
      narratedDialogue = this.addShouting(narratedDialogue);
      emotion = 'shouting';
    }
    
    return {
      text: narratedDialogue,
      gender: gender,
      emotion: emotion
    };
  },

  /**
   * Add excitement markers to dialogue
   */
  addExcitement(text) {
    // Add emphasis and exclamation
    return text.replace(/\./g, '!').replace(/([.!?])$/, '!');
  },

  /**
   * Add sadness markers to dialogue
   */
  addSadness(text) {
    // Add pauses for emotional weight
    return text.replace(/\./g, '...').replace(/,/g, '...');
  },

  /**
   * Add anger markers to dialogue
   */
  addAnger(text) {
    // Make it more forceful
    return text.toUpperCase().replace(/\./g, '!');
  },

  /**
   * Add surprise markers to dialogue
   */
  addSurprise(text) {
    // Add exclamation and emphasis
    return text.replace(/\./g, '?!').replace(/([.!?])$/, '?!');
  },

  /**
   * Add whisper markers to dialogue
   */
  addWhisper(text) {
    // Add ellipses for softer tone
    return '...' + text.replace(/\./g, '...') + '...';
  },

  /**
   * Add shouting markers to dialogue
   */
  addShouting(text) {
    // Make it loud and emphatic
    return text.toUpperCase() + '!!';
  },

  /**
   * Narrate dialogue (legacy method)
   * @param {string[]} dialogue - Array of dialogue lines
   * @returns {string}
   */
  narrateDialogue(dialogue) {
    if (dialogue.length === 0) return '';

    // Just speak the dialogue directly without "The text reads"
    if (dialogue.length === 1) {
      return dialogue[0];
    } else {
      return dialogue.join('. ');
    }
  },

  /**
   * Format text for natural speech output
   * Removes special characters, adds pauses, etc.
   * @param {string} text - Raw narrative text
   * @returns {string}
   */
  formatForSpeech(text) {
    let formatted = text;

    // Remove excessive whitespace
    formatted = formatted.replace(/\s+/g, ' ').trim();

    // Add pauses after sentences for better pacing
    formatted = formatted.replace(/\.\s+/g, '. ');

    // Remove problematic characters that might affect TTS
    formatted = formatted.replace(/[*_~`]/g, '');

    // Ensure proper sentence endings
    if (formatted && !formatted.endsWith('.') && !formatted.endsWith('!') && !formatted.endsWith('?')) {
      formatted += '.';
    }

    return formatted;
  },

  /**
   * Check if narration is redundant with previous narration
   * Requirement 3.5: Exclude redundant descriptions
   * @param {string} currentNarration - Current narration text
   * @param {string} previousNarration - Previous narration text
   * @returns {boolean}
   */
  isRedundant(currentNarration, previousNarration) {
    if (!previousNarration) return false;

    // Simple similarity check - could be enhanced with more sophisticated algorithms
    const currentWords = new Set(currentNarration.toLowerCase().split(/\s+/));
    const previousWords = new Set(previousNarration.toLowerCase().split(/\s+/));

    // Calculate overlap
    const intersection = new Set([...currentWords].filter(word => previousWords.has(word)));
    const similarity = intersection.size / Math.max(currentWords.size, previousWords.size);

    // Consider redundant if more than 70% similar
    return similarity > 0.7;
  }
};

// Export for use in background script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NarrationEngine;
}
