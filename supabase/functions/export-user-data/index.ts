import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExportResult {
  profiles: any[];
  child_profiles: any[];
  reading_sessions: any[];
  quiz_attempts: any[];
  game_sessions: any[];
  vocabulary_progress: any[];
  saved_stories: any[];
  story_collections: any[];
  user_preferences: any[];
  feedback: any[];
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's auth
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;
    console.log(`[export-user-data] Starting export for user: ${userId}`);

    // Collect all user data from various tables
    const exportData: ExportResult = {
      profiles: [],
      child_profiles: [],
      reading_sessions: [],
      quiz_attempts: [],
      game_sessions: [],
      vocabulary_progress: [],
      saved_stories: [],
      story_collections: [],
      user_preferences: [],
      feedback: [],
    };

    // Fetch profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId);
    exportData.profiles = profiles || [];

    // Fetch child profiles
    const { data: childProfiles } = await supabase
      .from("child_profiles")
      .select("*")
      .eq("parent_user_id", userId);
    exportData.child_profiles = childProfiles || [];

    // Fetch reading sessions
    const { data: readingSessions } = await supabase
      .from("reading_sessions")
      .select("*")
      .eq("user_id", userId);
    exportData.reading_sessions = readingSessions || [];

    // Fetch quiz attempts
    const { data: quizAttempts } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("user_id", userId);
    exportData.quiz_attempts = quizAttempts || [];

    // Fetch game sessions
    const { data: gameSessions } = await supabase
      .from("game_sessions")
      .select("*")
      .eq("user_id", userId);
    exportData.game_sessions = gameSessions || [];

    // Fetch vocabulary progress
    const { data: vocabularyProgress } = await supabase
      .from("vocabulary_progress")
      .select("*")
      .eq("user_id", userId);
    exportData.vocabulary_progress = vocabularyProgress || [];

    // Fetch saved stories
    const { data: savedStories } = await supabase
      .from("saved_stories")
      .select("*")
      .eq("user_id", userId);
    exportData.saved_stories = savedStories || [];

    // Fetch story collections
    const { data: storyCollections } = await supabase
      .from("story_collections")
      .select("*")
      .eq("user_id", userId);
    exportData.story_collections = storyCollections || [];

    // Fetch user preferences
    const { data: userPreferences } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId);
    exportData.user_preferences = userPreferences || [];

    // Fetch feedback
    const { data: feedback } = await supabase
      .from("feedback")
      .select("*")
      .eq("user_id", userId);
    exportData.feedback = feedback || [];

    // Log the export event for security audit
    const supabaseServiceRole = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabaseServiceRole.from("security_audit_log").insert({
      user_id: userId,
      event_type: "data_export_requested",
      details: {
        tables_exported: Object.keys(exportData),
        record_counts: Object.fromEntries(
          Object.entries(exportData).map(([key, value]) => [key, value.length])
        ),
        timestamp: new Date().toISOString(),
      },
      ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
      user_agent: req.headers.get("user-agent"),
    });

    // Create the export document
    const exportDocument = {
      export_info: {
        user_id: userId,
        user_email: user.email,
        exported_at: new Date().toISOString(),
        format_version: "1.0",
        data_categories: Object.keys(exportData),
      },
      data: exportData,
    };

    console.log(`[export-user-data] Export complete. Records: ${JSON.stringify(
      Object.fromEntries(Object.entries(exportData).map(([key, value]) => [key, value.length]))
    )}`);

    return new Response(
      JSON.stringify(exportDocument, null, 2),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="time2read-data-export-${new Date().toISOString().split('T')[0]}.json"`,
        },
      }
    );
  } catch (error: any) {
    console.error("[export-user-data] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Export failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
