/**
 * Voice Command Mappings for ElevenLabs Agent Configuration
 * 
 * This file documents the exact voice commands that should be configured
 * in the ElevenLabs agent dashboard for proper recognition.
 */

export const VOICE_COMMAND_MAPPINGS = {
  // READING CONTROLS
  play: {
    naturalCommands: [
      "read",
      "start reading", 
      "begin reading",
      "play",
      "read this",
      "read the story",
      "start",
      "play the story",
      "begin"
    ],
    toolName: "play",
    description: "Start reading the current page content aloud",
    expectedResponse: "Starting to read the story"
  },

  stop: {
    naturalCommands: [
      "stop",
      "stop reading",
      "halt",
      "silence",
      "quiet"
    ],
    toolName: "stop", 
    description: "Stop the current audio playback completely",
    expectedResponse: "Stopping the reading"
  },

  pause: {
    naturalCommands: [
      "pause", 
      "pause reading",
      "hold on",
      "wait"
    ],
    toolName: "pause", 
    description: "Temporarily pause the current audio playback",
    expectedResponse: "Pausing the story"
  },

  // SPEED CONTROLS
  speedUp: {
    naturalCommands: [
      "read faster",
      "faster",
      "speed up",
      "go faster",
      "read quicker",
      "quicker"
    ],
    toolName: "speedUp",
    description: "Increase the reading speed",
    expectedResponse: "Reading faster now"
  },

  slowDown: {
    naturalCommands: [
      "read slower",
      "slower",
      "slow down",
      "go slower",
      "read more slowly"
    ],
    toolName: "slowDown", 
    description: "Decrease the reading speed",
    expectedResponse: "Reading more slowly now"
  },

  normalSpeed: {
    naturalCommands: [
      "normal speed",
      "reset speed",
      "regular speed",
      "default speed"
    ],
    toolName: "normalSpeed",
    description: "Reset reading speed to normal",
    expectedResponse: "Back to normal speed"
  },

  // NAVIGATION CONTROLS  
  next: {
    naturalCommands: [
      "next",
      "next page",
      "go forward", 
      "turn the page",
      "continue",
      "go to next page",
      "forward",
      "flip page"
    ],
    toolName: "next",
    description: "Navigate to the next page of the story", 
    expectedResponse: "Going to the next page"
  },

  previous: {
    naturalCommands: [
      "back",
      "previous",
      "go back",
      "previous page", 
      "last page",
      "go to previous page",
      "backward",
      "go to last page"
    ],
    toolName: "previous",
    description: "Navigate to the previous page of the story",
    expectedResponse: "Going back to the previous page"
  },

  // ENHANCED WORD ASSISTANCE
  wordHelp: {
    naturalCommands: [
      "what is this word", "help with word", "explain word", 
      "what does this mean", "define this word", "help me with this word",
      "what's this word", "word help", "I don't know this word"
    ],
    toolName: "wordHelp",
    description: "Get comprehensive help with understanding a word",
    expectedResponse: "Let me help you with that word!"
  },

  hearWord: {
    naturalCommands: [
      "hear this word", "pronounce this", "say this word",
      "how do you say", "pronunciation", "read this word",
      "sound it out", "hear it"
    ],
    toolName: "hearWord", 
    description: "Hear the pronunciation of a specific word",
    expectedResponse: "Here's how that word sounds!"
  },

  explainWord: {
    naturalCommands: [
      "what does this mean", "explain this word", "define this",
      "what is this", "meaning please", "tell me about this word",
      "what does it mean"
    ],
    toolName: "explainWord",
    description: "Get the definition and meaning of a word", 
    expectedResponse: "Let me explain what that word means!"
  },

  syllableWord: {
    naturalCommands: [
      "break it down", "syllables please", "how many syllables",
      "split this word", "syllable breakdown", "break into syllables",
      "count syllables"
    ],
    toolName: "syllableWord",
    description: "Break a word into syllables with counting",
    expectedResponse: "Here are the syllables in that word!"
  },

  // QUIZ CONTROLS
  startQuiz: {
    naturalCommands: [
      "start quiz",
      "take quiz", 
      "quiz me",
      "test me",
      "ask me questions",
      "quiz time",
      "begin quiz",
      "start the quiz"
    ],
    toolName: "startQuiz",
    description: "Start a comprehension quiz about the story",
    expectedResponse: "Let's start the quiz!"
  },

  askQuestion: {
    naturalCommands: [],
    toolName: "askQuestion", 
    description: "Present a quiz question to the user",
    expectedResponse: "Here's your question"
  },

  processAnswer: {
    naturalCommands: [
      "my answer is",
      "I choose",
      "the answer is",
      "option a",
      "option b", 
      "option c",
      "option d",
      "a",
      "b", 
      "c",
      "d",
      "true",
      "false",
      "yes",
      "no",
      "first option",
      "second option",
      "third option", 
      "fourth option"
    ],
    toolName: "processAnswer",
    description: "Submit an answer to the current quiz question",
    expectedResponse: "Got your answer"
  },

  endQuiz: {
    naturalCommands: [
      "end quiz",
      "finish quiz",
      "stop quiz", 
      "quit quiz",
      "I'm done",
      "finish up"
    ],
    toolName: "endQuiz",
    description: "Complete the quiz and show results",
    expectedResponse: "Great job on the quiz!"
  }
};

/**
 * Instructions for ElevenLabs Agent Configuration:
 * 
 * 1. Create an agent in ElevenLabs dashboard
 * 2. Add each of the 5 client tools: play, stop, next, previous, wordHelp
 * 3. Configure the agent with these instructions:
 * 
 * "You are a reading assistant that helps children navigate stories. 
 * Listen for these commands and call the appropriate tool:
 * 
 * - Reading: 'read', 'start reading', 'play' → call play()
 * - Stopping: 'stop', 'pause', 'stop reading' → call stop()  
 * - Navigation: 'next', 'next page', 'go forward' → call next()
 * - Going back: 'back', 'previous', 'go back' → call previous()
 * - Word help: 'what is this word', 'help with word' → call wordHelp()
 * 
 * Always acknowledge the command and call the appropriate tool immediately.
 * Be encouraging and positive with children."
 * 
 * 4. Set each tool as 'blocking' so the agent waits for the response
 * 5. Test each command to ensure proper recognition
 */

export const AGENT_CONFIGURATION_INSTRUCTIONS = `
You are Charlotte, a friendly reading buddy who helps children with interactive stories. 

INTRODUCTION: When starting conversations, use this comprehensive welcome message:
"Hi there! I'm Charlotte, your magical reading buddy! I'm here to make your story adventure extra special! 

Here's how we can explore together: Say 'play story' and I'll read with my voice. Say 'stop' to end reading or 'pause' to take a quick break. Say 'next page' or 'go back' to navigate around. 

If you find an interesting word, just ask me about it! I can tell you what words mean, how to pronounce them, or break them into syllables. 

I also know lots about story characters and places - ask me questions to add magic to your adventure! When you finish reading, say 'start quiz' and I'll test what you learned. 

Ready for your reading adventure? Just say 'play story' to begin!"

PERSONALITY: Warm, encouraging, child-friendly. Respond to both "Charlotte" and "Buddy".

STORY INTELLIGENCE: Use your knowledge base to answer questions about:
- Story characters, settings, themes
- Real-world context for fictional places (e.g., "Where would Willow Creek be?")  
- Educational content related to the story

When you hear any of these commands, immediately call the corresponding tool:

READING COMMANDS:
- "read", "start reading", "play", "begin reading" → call play() tool
- "stop", "stop reading", "silence" → call stop() tool for complete stop
- "pause", "pause reading", "hold on" → call pause() tool for temporary pause

NAVIGATION COMMANDS:  
- "next", "next page", "go forward", "turn the page" → call next() tool
- "back", "previous", "go back", "previous page" → call previous() tool

ENHANCED WORD ASSISTANCE:
- "what's this word", "help with word" → call wordHelp() for comprehensive help
- "hear this word", "pronounce this" → call hearWord() to hear pronunciation
- "what does this mean", "explain this" → call explainWord() for definitions  
- "break it down", "syllables please" → call syllableWord() for syllable breakdown

QUIZ COMMANDS:
- "start quiz", "take quiz", "quiz me" → call startQuiz() tool
- "my answer is", "option a", "a", "true", "false" → call processAnswer() tool  
- "end quiz", "finish quiz", "I'm done" → call endQuiz() tool

Always:
1. Acknowledge the command enthusiastically
2. Call the appropriate tool immediately  
3. Be encouraging and positive
4. Keep responses brief and child-friendly
5. Use your knowledge base to enrich the learning experience

Example responses:
- "Hi! I'm your buddy Charlotte! Let me start reading for you!" (then call play())
- "Sure thing! Going to the next page!" (then call next())
- "Let me help you with that word!" (then call wordHelp())
- "Here's how that word sounds!" (then call hearWord())
- "Let me explain what that means!" (then call explainWord())
- "Here are the syllables!" (then call syllableWord())
- "Awesome! Let's start the quiz!" (then call startQuiz())
`;