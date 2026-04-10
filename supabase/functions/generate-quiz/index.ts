import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { storyText, age, difficulty, language } = await req.json();

    if (!storyText || typeof storyText !== "string" || storyText.length < 20) {
      return new Response(JSON.stringify({ error: "Invalid story text" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Truncate story to ~2000 chars to keep costs low
    const truncatedStory = storyText.slice(0, 2000);

    const isYoung = (age || 6) < 8;
    const isLowerLevel = difficulty === "beginner" || difficulty === "easy";
    const questionCount = isLowerLevel ? 3 : isYoung ? 3 : 5;

    const systemPrompt = `You are a children's reading comprehension quiz generator. Generate exactly ${questionCount} multiple-choice questions about the story provided. Questions must test actual comprehension of THIS specific story — characters, events, settings, emotions, and details that appear in the text. The child is ${age || 6} years old reading at ${difficulty || "easy"} level${language && language !== "en" ? `, language: ${language}` : ""}.

Rules:
- Each question must have exactly 4 options (A-D)
- Wrong answers (distractors) must be plausible but clearly wrong based on the story
- Mix question types: character identification, plot events, setting details, character emotions, cause/effect
- Keep language age-appropriate
- Include a brief explanation for the correct answer`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate quiz questions for this story:\n\n${truncatedStory}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_quiz",
              description: "Create a comprehension quiz from the story",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", description: "Unique question id like q1, q2" },
                        question: { type: "string", description: "The question text" },
                        options: {
                          type: "array",
                          items: { type: "string" },
                          description: "Exactly 4 answer options",
                        },
                        correctAnswer: {
                          type: "number",
                          description: "Index (0-3) of the correct option",
                        },
                        explanation: {
                          type: "string",
                          description: "Brief explanation of why the answer is correct",
                        },
                        type: {
                          type: "string",
                          enum: ["multiple-choice", "true-false", "character-emotion"],
                        },
                      },
                      required: ["id", "question", "options", "correctAnswer", "explanation", "type"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["questions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_quiz" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "AI did not return quiz data" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const quizData = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(quizData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-quiz error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
