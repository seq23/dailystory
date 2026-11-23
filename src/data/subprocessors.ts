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
   * The vendor's data processing agreement, exactly as VENDOR_DPA_TRACKER.md records it (owner,
   * 22 Nov 2026: accepting a vendor's published terms counts as signing). Every vendor has one:
   * the tracker's DPA matrix holds the original nine, its "Other vendors" table the rest, each
   * "signed" row with the vendor's live legal page linked.
   */
  dpa: DpaStatus;
}

export type DpaStatus = "signed" | "in-progress" | "signed-cloudflare" | "signed-terms" | "school-provider" | "no-personal-data";

export const DPA_LABEL: Record<DpaStatus, string> = {
  signed: "DPA signed",
  "in-progress": "DPA in progress",
  // Workers AI runs under the same Cloudflare account and Customer DPA as the hosting.
  "signed-cloudflare": "DPA signed (Cloudflare)",
  // OpenRouter's Terms (s.10.2) incorporate its DPA by reference.
  "signed-terms": "DPA signed (part of terms)",
  // ClassLink is the school's own roster provider: it sends us the roster; we send it nothing.
  "school-provider": "School’s provider (district DPA)",
  "no-personal-data": "No personal data sent",
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
    dpa: "school-provider",
    hosts: ["classlink.com"],
  },
  {
    name: "OpenRouter",
    role: "writes story text and quizzes first, and word help when Workers AI doesn’t answer",
    purpose: "AI text models (free models first, then one paid model)",
    dataProcessed: "Story prompts and quizzes, with the reader’s name replaced by a stand-in before it leaves (other names typed into a request are sent as written); free models may log or train on these. Text a reader asks to spell, translate or define, as written, goes only to the paid model, set to no data collection and zero retention",
    location: "United States",
    privacyUrl: "https://openrouter.ai/privacy",
    riskTier: "medium",
    dpa: "signed-terms",
    hosts: ["openrouter.ai"],
  },
  {
    name: "Cloudflare Workers AI",
    role: "answers word help first and writes story text when OpenRouter’s free models don’t",
    purpose: "AI text model (Meta Llama) run by Cloudflare",
    dataProcessed: "Story prompts and quizzes, with the reader’s name replaced by a stand-in before it leaves (other names typed into a request are sent as written); text a reader asks to spell, translate or define, as written",
    location: "Global (Cloudflare network)",
    privacyUrl: "https://www.cloudflare.com/privacypolicy/",
    riskTier: "medium",
    dpa: "signed-cloudflare",
    hosts: ["api.cloudflare.com"],
  },
  {
    name: "OpenAI",
    role: "writes story text when the other text models fail and turns voice clips into text",
    purpose: "Last-resort story text model; speech-to-text for voice commands and read-aloud practice",
    dataProcessed: "Story prompts, used only when the other text models fail: the reader’s age, grade, favorites, hobbies and typed request, including the child’s first name (replaced by a stand-in for a school account), and text a reader asks to spell, translate or define when the other models fail; OpenAI keeps chat prompts up to 30 days for abuse monitoring; short voice clips recorded only after a tap on the microphone by a signed-in account (not stored by Time-2-Read; OpenAI does not train on API data; its API data-controls page, checked 22 Nov 2026, lists speech-to-text with no abuse-monitoring retention)",
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
    dataProcessed: "The story page’s text, with the reader’s name replaced by a stand-in before it leaves; other names on the page are sent as written",
    location: "Sweden (Lovable) and Google’s servers",
    privacyUrl: "https://lovable.dev/privacy",
    riskTier: "medium",
    dpa: "in-progress",
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
    dataProcessed: "The picture scene, plus the reader’s avatar look, age and favorite color; never a name. Runware keeps generated images up to 7 days",
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
    dataProcessed: "One word at a time, sent from our server with no account details; a word that is a reader’s or account’s name is never sent",
    location: "Not published",
    riskTier: "medium",
    dpa: "no-personal-data",
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
