import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client with user's token for getting user info
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Service role client for deletion operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get the current user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;
    const userEmail = user.email;

    console.log(`Starting account deletion for user: ${userId}`);

    // Log the deletion request to security audit
    await supabaseAdmin.from("security_audit_log").insert({
      event_type: "account_deletion_request",
      user_id: userId,
      details: { email: userEmail, requested_at: new Date().toISOString() },
    });

    // Delete user data in order (respecting foreign key constraints)
    const deletionSteps = [
      // Delete reading sessions
      { table: "reading_sessions", column: "user_id" },
      // Delete quiz attempts
      { table: "quiz_attempts", column: "user_id" },
      // Delete game sessions
      { table: "game_sessions", column: "user_id" },
      // Delete vocabulary progress
      { table: "vocabulary_progress", column: "user_id" },
      // Delete saved stories
      { table: "saved_stories", column: "user_id" },
      // Delete story collections
      { table: "story_collections", column: "user_id" },
      // Delete child profiles
      { table: "child_profiles", column: "parent_user_id" },
      // Delete user preferences
      { table: "user_preferences", column: "user_id" },
      // Delete profiles
      { table: "profiles", column: "user_id" },
      // Delete character traits
      { table: "character_traits", column: "user_id" },
      // Delete visual details
      { table: "visual_details", column: "user_id" },
      // Delete personal info incidents
      { table: "personal_info_incidents", column: "user_id" },
      // Delete feedback
      { table: "feedback", column: "user_id" },
      // Delete user sessions
      { table: "user_sessions", column: "user_id" },
    ];

    const deletionResults: { table: string; deleted: number; error?: string }[] = [];

    for (const step of deletionSteps) {
      try {
        const { data, error } = await supabaseAdmin
          .from(step.table)
          .delete()
          .eq(step.column, userId)
          .select("id");

        deletionResults.push({
          table: step.table,
          deleted: data?.length || 0,
          error: error?.message,
        });
      } catch (err) {
        console.error(`Error deleting from ${step.table}:`, err);
        deletionResults.push({
          table: step.table,
          deleted: 0,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    // Anonymize analytics sessions (keep for aggregate stats)
    try {
      const { error: analyticsError } = await supabaseAdmin
        .from("analytics_sessions")
        .update({ user_id: null })
        .eq("user_id", userId);

      if (analyticsError) {
        console.error("Error anonymizing analytics:", analyticsError);
      }
    } catch (err) {
      console.error("Error anonymizing analytics:", err);
    }

    // Anonymize cost tracking (keep for billing records)
    try {
      const { error: costError } = await supabaseAdmin
        .from("cost_tracking")
        .update({ user_id: null })
        .eq("user_id", userId);

      if (costError) {
        console.error("Error anonymizing cost tracking:", costError);
      }
    } catch (err) {
      console.error("Error anonymizing cost tracking:", err);
    }

    // Delete subscriber record
    try {
      await supabaseAdmin
        .from("subscribers")
        .delete()
        .eq("user_id", userId);
    } catch (err) {
      console.error("Error deleting subscriber record:", err);
    }

    // Log completion
    await supabaseAdmin.from("security_audit_log").insert({
      event_type: "account_deletion_completed",
      user_id: userId,
      details: {
        email: userEmail,
        completed_at: new Date().toISOString(),
        deletion_results: deletionResults,
      },
    });

    // Delete the user from auth (this should be last)
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteAuthError) {
      console.error("Error deleting auth user:", deleteAuthError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to delete authentication record. Please contact support.",
          details: deletionResults,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Account deletion completed for user: ${userId}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Account deleted successfully",
        details: deletionResults,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Account deletion error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

