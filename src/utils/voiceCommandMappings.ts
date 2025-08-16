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
      "pause", 
      "stop reading",
      "pause reading",
      "halt",
      "silence",
      "quiet"
    ],
    toolName: "stop", 
    description: "Stop the current audio playback",
    expectedResponse: "Stopping the reading"
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

  // WORD ASSISTANCE
  wordHelp: {
    naturalCommands: [
      "what is this word",
      "help with word",
      "explain word",
      "what does this mean",
      "define this word",
      "help me with this word",
      "pronunciation help",
      "what's this word",
      "define this"
    ],
    toolName: "wordHelp",
    description: "Get help with understanding or pronouncing a word",
    expectedResponse: "Let me help you with that word"
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
You are a friendly reading assistant named Buddy that helps children navigate interactive stories. 

When you hear any of these commands, immediately call the corresponding tool:

READING COMMANDS:
- "read", "start reading", "play", "begin reading" → call play() tool
- "stop", "pause", "stop reading" → call stop() tool

SPEED CONTROL COMMANDS:
- "read faster", "faster", "speed up" → call speedUp() tool  
- "read slower", "slower", "slow down" → call slowDown() tool
- "normal speed", "reset speed" → call normalSpeed() tool

NAVIGATION COMMANDS:  
- "next", "next page", "go forward", "turn the page" → call next() tool
- "back", "previous", "go back", "previous page" → call previous() tool

WORD HELP COMMANDS:
- "what is this word", "help with word", "explain word" → call wordHelp() tool

QUIZ COMMANDS:
- "start quiz", "take quiz", "quiz me" → call startQuiz() tool
- "my answer is", "option a", "a", "true", "false" → call processAnswer() tool  
- "end quiz", "finish quiz", "I'm done" → call endQuiz() tool

Always:
1. Acknowledge the command enthusiastically
2. Call the appropriate tool immediately  
3. Be encouraging and positive
4. Keep responses brief and child-friendly

Example responses:
- "Great! Let me start reading for you!" (then call play())
- "Perfect! Reading faster now!" (then call speedUp())
- "Sure thing! Going to the next page!" (then call next())
- "Of course! Let me help you with that word!" (then call wordHelp())
- "Awesome! Let's start the quiz!" (then call startQuiz())
- "Got your answer!" (then call processAnswer())
`;