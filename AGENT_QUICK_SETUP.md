# Quick ElevenLabs Agent Setup - Charlotte (Buddy)

## Step 1: Access Your Agent
1. Go to [ElevenLabs Dashboard](https://elevenlabs.io/app)
2. Navigate to **Conversational AI** → **Agents**
3. Find agent: `agent_5101k2cxd4tfeearyk0y6hvbj9pm`

## Step 2: Configure Tools (Add These 6 Tools)

### Tool 1: `play`
```
Name: play
Type: Function
Description: Start reading the current page content aloud
Parameters: (leave empty)
Blocking: ✅ YES
```

### Tool 2: `stop`
```
Name: stop
Type: Function  
Description: Stop the current audio playback completely
Parameters: (leave empty)
Blocking: ✅ YES
```

### Tool 3: `pause`
```
Name: pause
Type: Function
Description: Temporarily pause the current audio playback
Parameters: (leave empty)
Blocking: ✅ YES
```

### Tool 4: `next`
```
Name: next
Type: Function
Description: Navigate to the next page of the story
Parameters: (leave empty)
Blocking: ✅ YES
```

### Tool 5: `previous`
```
Name: previous
Type: Function
Description: Navigate to the previous page of the story
Parameters: (leave empty)
Blocking: ✅ YES
```

### Tool 6: `wordHelp`
```
Name: wordHelp
Type: Function
Description: Get comprehensive help with understanding a word
Parameters: 
{
  "type": "object",
  "properties": {
    "word": {
      "type": "string",
      "description": "The word the user needs help with"
    }
  }
}
Blocking: ✅ YES
```

## Step 3: Update Agent Instructions

Replace your agent's current instructions with this:

```
You are Charlotte, a friendly reading buddy who helps children with interactive stories. 

When children start talking, say: "Hi there! I'm Charlotte, your magical reading buddy! Ready for your story adventure? Just say 'play story' to begin!"

CRITICAL: When you hear these commands, immediately call the corresponding tool:

READING COMMANDS:
- "read", "start reading", "play", "play story" → call play() tool
- "stop", "stop reading" → call stop() tool  
- "pause", "pause reading" → call pause() tool

NAVIGATION COMMANDS:  
- "next", "next page", "go forward" → call next() tool
- "back", "previous", "go back" → call previous() tool

WORD HELP:
- "what's this word", "help with word" → call wordHelp() tool

Always:
1. Acknowledge the command enthusiastically 
2. Call the appropriate tool immediately
3. Be encouraging and positive
4. Keep responses brief

Example responses:
- User: "play story" → You: "Let me start reading for you!" → call play()
- User: "next page" → You: "Going to the next page!" → call next()
- User: "help with this word" → You: "Let me help with that word!" → call wordHelp()
```

## Step 4: Test Commands

After setup, test these voice commands:
- ✅ "play story" 
- ✅ "stop"
- ✅ "next page"
- ✅ "go back" 
- ✅ "help with this word"

## Step 5: Verify in Console

Watch browser console for:
- `🔧 AGENT TOOL CALL:` ← ElevenLabs calling your tools
- `🔧 Tool execution started:` ← Your code receiving the call
- `🔧 Tool execution completed:` ← Successful execution

If you see AGENT TOOL CALL but no execution logs, tools aren't configured correctly.