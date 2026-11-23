// The one list of companies Time-2-Read sends data to. /subprocessors, the privacy policy and the
// data-transfers page all render from it, and src/test/guards/subprocessors-page.test.tsx checks it
// against the code (every host called has a vendor) and against docs/compliance/VENDOR_DPA_TRACKER.md.
// A new vendor goes here in the same PR that first sends it data.

export interface Subprocessor {
  name: string;
  purpose: string;
  dataProcessed: string;
  location: string;
  /** Omitted only when the vendor publishes no privacy policy; the card then says so. */
  privacyUrl?: string;
  /** Where a claim on the card comes from, shown as its own link. */
  source?: { label: string; url: string };
  riskTier: "high" | "medium" | "low";
  /** What it does for us, finishing "<name> …"; the tier's answer sentence is built from these. */
  role: string;
  /** Hosts (or "esm.sh/<sdk>") our code calls or loads for this vendor; the page guard fails on a host in code that no card claims. */
  hosts: string[];
  /**
   * The vendor's data processing agreement, as VENDOR_DPA_TRACKER.md records it (owner, 22 Nov 2026:
   * accepting a vendor's published terms counts as signing). Omitted when the tracker has no row.
   */
  dpa?: "signed" | "in-progress";
}

export const DPA_LABEL: Record<NonNullable<Subprocessor["dpa"]>, string> = {
  signed: "DPA signed",
  "in-progress": "DPA in progress",
};

export const subprocessors: Subprocessor[] = [
  {
    name: "Supabase",
    role: "runs sign-in and the database (accounts, child profiles, reading data)",
    purpose: "Database, authentication, and edge functions",
    dataProcessed: "User accounts, profiles, reading data, child profiles",
    location: "United States (AWS)",
    privacyUrl: "https://supabase.com/privacy",
    riskTier: "high",
    dpa: "signed",
    hosts: ["supabase.co"],
  },
  {
    name: "Stripe",
    role: "takes payments for Premium",
    purpose: "Payment processing for premium subscriptions",
    dataProcessed: "Email, payment information, subscription status",
    location: "United States",
    privacyUrl: "https://stripe.com/privacy",
    riskTier: "high",
    dpa: "signed",
    hosts: ["stripe.com", "esm.sh/stripe"],
  },
  {
    name: "Resend",
    role: "sends account and receipt email",
    purpose: "Transactional email delivery",
    dataProcessed: "Email addresses, transactional email content",
    location: "United States",
    privacyUrl: "https://resend.com/legal/privacy-policy",
    riskTier: "high",
    dpa: "signed",
    hosts: ["resend.com"],
  },
  {
    name: "ClassLink",
    role: "sends a school’s class rosters when a district connects it",
    purpose: "School roster import (OneRoster)",
    dataProcessed: "Student names and roster ids for the classes a school connects; we keep the first name and last initial",
    location: "United States",
    privacyUrl: "https://www.classlink.com/company/privacy",
    riskTier: "high",
    hosts: ["classlink.com"],
  },
  {
    name: "OpenRouter",
    role: "writes story text, quizzes and word help first",
    purpose: "AI text models (free models first, then one paid model)",
    dataProcessed: "Story prompts and text a reader asks about, with every child’s and family member’s name replaced by a stand-in before it leaves. Free models may log or train on prompts; the paid model is set to no data collection and zero retention",
    location: "United States",
    privacyUrl: "https://openrouter.ai/privacy",
    riskTier: "medium",
    hosts: ["openrouter.ai"],
  },
  {
    name: "Cloudflare Workers AI",
    role: "writes story text when OpenRouter’s free models don’t answer",
    purpose: "AI text model (Meta Llama) run by Cloudflare",
    dataProcessed: "Story prompts and text a reader asks about, with every child’s and family member’s name replaced by a stand-in before it leaves",
    location: "Global (Cloudflare network)",
    privacyUrl: "https://www.cloudflare.com/privacypolicy/",
    riskTier: "medium",
    hosts: ["api.cloudflare.com"],
  },
  {
    name: "OpenAI",
    role: "writes story text when the other text models fail and turns voice clips into text",
    purpose: "Last-resort story text model; speech-to-text for voice commands and read-aloud practice",
    dataProcessed: "Story prompts as written, including the child’s first name; short voice clips recorded only after a tap on the microphone by a signed-in account (not stored by Time-2-Read; OpenAI does not train on API data; its API data-controls page, checked 22 Nov 2026, lists speech-to-text with no abuse-monitoring retention)",
    source: { label: "OpenAI API data controls", url: "https://developers.openai.com/api/docs/guides/your-data" },
    location: "United States",
    privacyUrl: "https://openai.com/policies/privacy-policy",
    riskTier: "medium",
    dpa: "signed",
    hosts: ["openai.com"],
  },
  {
    name: "Lovable AI Gateway (Google Gemini)",
    role: "writes the one-line scene for each story picture",
    purpose: "AI model that turns a story page into a picture description",
    dataProcessed: "The story page’s text, with the child’s name replaced by a stand-in before it leaves",
    location: "Sweden (Lovable) and Google’s servers",
    privacyUrl: "https://lovable.dev/privacy",
    riskTier: "medium",
    hosts: ["ai.gateway.lovable.dev"],
  },
  {
    name: "ElevenLabs",
    role: "reads stories aloud and runs the talking voice helper",
    purpose: "Text-to-speech narration and voice conversation",
    dataProcessed: "Story text, which includes the child’s first name when the story uses it; words and explanations a reader taps to hear; in voice mode, what the reader says to the voice helper",
    location: "United States",
    privacyUrl: "https://elevenlabs.io/privacy",
    riskTier: "medium",
    dpa: "in-progress",
    hosts: ["elevenlabs.io"],
  },
  {
    name: "Runware",
    role: "draws the story pictures",
    purpose: "AI image generation for story illustrations",
    dataProcessed: "The picture scene, plus the reader’s avatar look, age and favorite color; never a name",
    location: "Europe / United States",
    privacyUrl: "https://runware.ai/privacy",
    riskTier: "medium",
    dpa: "in-progress",
    hosts: ["runware.ai"],
  },
  {
    name: "Free Dictionary API",
    role: "looks up a word when our own dictionary has no entry",
    purpose: "Word definitions",
    dataProcessed: "One word at a time, sent from our server with no account details",
    location: "Not published",
    riskTier: "medium",
    hosts: ["dictionaryapi.dev"],
  },
  {
    name: "Cloudflare",
    role: "hosts and protects the site and sees visitors’ IP addresses",
    purpose: "Hosting, CDN, DDoS protection, Web Application Firewall",
    dataProcessed: "IP addresses, request metadata",
    location: "Global",
    privacyUrl: "https://www.cloudflare.com/privacypolicy/",
    riskTier: "low",
    dpa: "signed",
    hosts: [],
  },
  {
    name: "Google Fonts",
    role: "serves the site’s fonts and sees visitors’ IP addresses",
    purpose: "Web fonts",
    dataProcessed: "IP addresses and browser details of every visitor",
    location: "Global",
    privacyUrl: "https://developers.google.com/fonts/faq/privacy",
    riskTier: "low",
    hosts: ["fonts.googleapis.com", "fonts.gstatic.com"],
  },
  {
    name: "Microsoft Clarity",
    role: "records how signed-out parents use the sign-in form",
    purpose: "Usage analytics on the parent sign-in and sign-up form only",
    dataProcessed: "Clicks, scrolls and page details on that form, and the visitor’s IP address; never loaded for a signed-in account or on children’s screens",
    location: "United States",
    privacyUrl: "https://www.microsoft.com/privacy/privacystatement",
    riskTier: "low",
    hosts: ["clarity.ms"],
  },
  {
    name: "GitHub",
    role: "holds the source code and runs the builds (no user data)",
    purpose: "Source code hosting and CI/CD pipelines",
    dataProcessed: "Source code only — no user data",
    location: "United States",
    privacyUrl: "https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement",
    riskTier: "low",
    dpa: "signed",
    hosts: [],
  },
];
