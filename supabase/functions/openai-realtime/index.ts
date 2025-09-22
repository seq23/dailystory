import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleHealthAndCors } from "../_shared/healthCors.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '600',
};

serve(async (req) => {
  console.log('🔄 OpenAI Realtime API function called');
  
  // Handle CORS and health checks
  const healthResponse = handleHealthAndCors(req);
  if (healthResponse) return healthResponse;

  

  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    console.error('❌ OpenAI API key not found');
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log('✅ OpenAI API key configured');

  try {
    // Upgrade to WebSocket
    const { socket, response } = Deno.upgradeWebSocket(req);
    console.log('🔌 WebSocket connection established');

    let openaiWs: WebSocket | null = null;
    let sessionConfigured = false;

    // Connect to OpenAI Realtime API
    const connectToOpenAI = () => {
      console.log('🚀 Connecting to OpenAI Realtime API...');
      openaiWs = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01', [
        'realtime',
        `Bearer.${openaiApiKey}`
      ]);

      openaiWs.onopen = () => {
        console.log('✅ Connected to OpenAI Realtime API');
      };

      openaiWs.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('📨 OpenAI message:', data.type);

        // Configure session after receiving session.created
        if (data.type === 'session.created' && !sessionConfigured) {
          console.log('🛠️ Configuring session...');
          sessionConfigured = true;
          
          const sessionConfig = {
            event_id: `session_${Date.now()}`,
            type: 'session.update',
            session: {
              modalities: ['text', 'audio'],
              instructions: `You are Buddy, a friendly reading assistant for children. 

When children say these commands, call the appropriate function immediately:

READING COMMANDS:
- "read", "start reading", "play", "begin reading" → call play_story()
- "stop", "pause", "stop reading" → call stop_reading()

NAVIGATION COMMANDS:
- "next", "next page", "go forward", "turn the page" → call next_page()
- "back", "previous", "go back", "previous page" → call previous_page()

WORD HELP COMMANDS:
- "what is this word", "help with word", "explain word" → call word_help()

Always acknowledge the command enthusiastically and call the function immediately. Keep responses brief and encouraging for children.`,
              voice: 'alloy',
              input_audio_format: 'pcm16',
              output_audio_format: 'pcm16',
              input_audio_transcription: {
                model: 'whisper-1'
              },
              turn_detection: {
                type: 'server_vad',
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 1000
              },
              tools: [
                {
                  type: 'function',
                  name: 'play_story',
                  description: 'Start reading the current story page aloud',
                  parameters: {
                    type: 'object',
                    properties: {},
                    required: []
                  }
                },
                {
                  type: 'function',
                  name: 'stop_reading',
                  description: 'Stop the current audio reading',
                  parameters: {
                    type: 'object',
                    properties: {},
                    required: []
                  }
                },
                {
                  type: 'function',
                  name: 'next_page',
                  description: 'Navigate to the next page of the story',
                  parameters: {
                    type: 'object',
                    properties: {},
                    required: []
                  }
                },
                {
                  type: 'function',
                  name: 'previous_page',
                  description: 'Navigate to the previous page of the story',
                  parameters: {
                    type: 'object',
                    properties: {},
                    required: []
                  }
                },
                {
                  type: 'function',
                  name: 'word_help',
                  description: 'Get help with understanding or pronouncing a word',
                  parameters: {
                    type: 'object',
                    properties: {
                      word: {
                        type: 'string',
                        description: 'The word to get help with'
                      }
                    },
                    required: []
                  }
                }
              ],
              tool_choice: 'auto',
              temperature: 0.8,
              max_response_output_tokens: 'inf'
            }
          };

          openaiWs?.send(JSON.stringify(sessionConfig));
          console.log('📤 Session configuration sent');
        }

        // Handle function calls
        if (data.type === 'response.function_call_arguments.done') {
          console.log('🎯 Function call completed:', data.name);
          
          // Send function result back to OpenAI
          const functionResult = {
            event_id: `result_${Date.now()}`,
            type: 'conversation.item.create',
            item: {
              type: 'function_call_output',
              call_id: data.call_id,
              output: JSON.stringify({ success: true })
            }
          };
          
          openaiWs?.send(JSON.stringify(functionResult));
          
          // Trigger response generation
          openaiWs?.send(JSON.stringify({
            event_id: `response_${Date.now()}`,
            type: 'response.create'
          }));

          // Forward function call to client
          socket.send(JSON.stringify({
            type: 'function_call',
            function: data.name,
            arguments: data.arguments ? JSON.parse(data.arguments) : {}
          }));
        }

        // Forward all other messages to client
        socket.send(event.data);
      };

      openaiWs.onerror = (error) => {
        console.error('❌ OpenAI WebSocket error:', error);
        socket.send(JSON.stringify({
          type: 'error',
          message: 'OpenAI connection error'
        }));
      };

      openaiWs.onclose = (event) => {
        console.log('🔌 OpenAI WebSocket closed:', event.code, event.reason);
        socket.send(JSON.stringify({
          type: 'disconnected',
          reason: event.reason
        }));
      };
    };

    // Client WebSocket handlers
    socket.onopen = () => {
      console.log('👤 Client connected');
      connectToOpenAI();
    };

    socket.onmessage = (event) => {
      console.log('📨 Client message received');
      if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
        openaiWs.send(event.data);
      }
    };

    socket.onclose = () => {
      console.log('👤 Client disconnected');
      if (openaiWs) {
        openaiWs.close();
      }
    };

    socket.onerror = (error) => {
      console.error('❌ Client WebSocket error:', error);
      if (openaiWs) {
        openaiWs.close();
      }
    };

    return response;

  } catch (error) {
    console.error('❌ Error in realtime function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});