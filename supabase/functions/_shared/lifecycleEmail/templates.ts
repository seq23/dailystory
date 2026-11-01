// The four parent lifecycle emails, word for word as Sequoia approved them on 1 Nov 2026
// (artifact "Time-2-Read: the four emails to parents"). Pure, so vitest renders them.
// Never edit the copy here without her approval. Guard: src/test/guards/lifecycle-emails.test.ts.
import { type EmailKind, SITE_URL } from "./rules.ts";

export interface ChildStats { name: string; stories: number; pages: number; quizzes: number }

export interface RenderInput {
  kind: EmailKind;
  parentName: string | null;
  /** Postal address for the CAN-SPAM footer, from the LIFECYCLE_MAILING_ADDRESS secret. */
  mailingAddress: string;
  unsubscribeUrl: string;
  siteUrl?: string;
  /** welcome, trial_ending */
  trialEnd?: Date;
  /** trial_ending: the plan that starts when the trial ends */
  plan?: "monthly" | "annual" | null;
  /** trial_ending: per child, during the trial */
  children?: ChildStats[];
  /** free_stories_used, come_back */
  childName?: string | null;
  /** come_back */
  storyCount?: number;
}

export interface RenderedEmail { subject: string; preview: string; html: string; text: string }

const TZ = "America/New_York";
const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: TZ, ...o }).format(d);
/** "Friday 13 November" */
export const longDate = (d: Date) => `${fmt(d, { weekday: "long" })} ${fmt(d, { day: "numeric", month: "long" })}`;
/** "Fri 13 Nov" */
export const shortDate = (d: Date) => `${fmt(d, { weekday: "short" })} ${fmt(d, { day: "numeric", month: "short" })}`;
/** "13 November" */
export const dayMonth = (d: Date) => fmt(d, { day: "numeric", month: "long" });
/** "Friday" */
export const weekday = (d: Date) => fmt(d, { weekday: "long" });

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const oneLine = (s: string) => s.split(/\s*[\r\n]+\s*/).filter(Boolean).join(", ");

// Email-safe styles (inline), after the approved mock: purple brand, soft box, small footer.
const C = { brand: "#5b3fa8", soft: "#ece6fa", fg: "#24211c", muted: "#6d665b", line: "#e3ddd1", card: "#fffdf8", bg: "#f4f1ea" };
const P = `margin:0 0 14px;font-size:16px;line-height:1.55;color:${C.fg}`;
const btn = (href: string, label: string) =>
  `<p style="margin:6px 0 14px"><a href="${esc(href)}" style="display:block;text-align:center;background:${C.brand};color:#ffffff;border-radius:10px;padding:12px;font-weight:700;font-size:16px;text-decoration:none">${esc(label)}</a></p>`;
const btn2 = (href: string, label: string) =>
  `<p style="margin:0 0 14px"><a href="${esc(href)}" style="display:block;text-align:center;border:1.5px solid ${C.brand};color:${C.brand};border-radius:10px;padding:10px;font-weight:700;font-size:16px;text-decoration:none">${esc(label)}</a></p>`;
const box = (inner: string) => `<div style="background:${C.soft};border-radius:10px;padding:12px 14px;margin:0 0 14px;font-size:15px;line-height:1.55;color:${C.fg}">${inner}</div>`;
const small = (inner: string) => `<p style="margin:0 0 14px;font-size:14px;line-height:1.5;color:${C.muted}">${inner}</p>`;
const list = (items: string[]) => `<ul style="margin:0 0 14px;padding-left:1.2em;font-size:16px;line-height:1.55;color:${C.fg}">${items.map((i) => `<li style="margin:0 0 4px">${i}</li>`).join("")}</ul>`;

function shell(preview: string, body: string, footLead: string, unsubscribeUrl: string, address: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Time-2-Read</title></head>` +
    `<body style="margin:0;padding:0;background:${C.bg};font-family:Nunito,-apple-system,'Segoe UI',Roboto,Arial,sans-serif">` +
    `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preview)}</div>` +
    `<div style="max-width:520px;margin:0 auto;padding:20px 12px"><div style="background:${C.card};border:1px solid ${C.line};border-radius:18px;padding:22px 20px">` +
    `<p style="margin:0 0 16px;font-weight:700;color:${C.brand};letter-spacing:.02em;font-size:17px">Time-2-Read</p>` +
    body +
    `<p style="margin:16px 0 0;padding-top:10px;border-top:1px solid ${C.line};font-size:12px;line-height:1.5;color:${C.muted}">${esc(footLead)} <a href="${esc(unsubscribeUrl)}" style="color:${C.muted}">Unsubscribe</a> · ${esc(oneLine(address))}</p>` +
    `</div></div></body></html>`;
}

/** Plain-text part, generated from the same lines. */
function textOf(lines: string[], foot: string, unsubscribeUrl: string, address: string): string {
  return `Time-2-Read\n\n${lines.join("\n\n")}\n\n--\n${foot} Unsubscribe: ${unsubscribeUrl}\n${oneLine(address)}\n`;
}

export function renderLifecycleEmail(i: RenderInput): RenderedEmail {
  const site = (i.siteUrl ?? SITE_URL).replace(/\/$/, "");
  const hi = `Hi ${i.parentName?.trim() || "there"},`;
  const child = i.childName?.trim() || null;

  if (i.kind === "welcome") {
    if (!i.trialEnd) throw new Error("welcome needs trialEnd");
    const subject = "Welcome! Three things to try tonight";
    const preview = `Your free week runs until ${shortDate(i.trialEnd)}.`;
    const intro = "Welcome to Time-2-Read: stories at your child's reading level, for ages 3–15. Here's how to get the most out of your first night:";
    const steps: [string, string][] = [
      ["Add each child.", "Their school grade, and the grade they read at, which can be different. That sets the story's level."],
      ["Add a few of their words.", "Spelling words or new vocabulary, and they'll show up in the story."],
      ["Let them steer.", "The story keeps going until they tap Finish Story, then they get the ending they chose."],
    ];
    const boxText = `Runs until ${longDate(i.trialEnd)}. We'll email you 2 days before it ends. Nothing to do now.`;
    const foot = "You're getting this because you started a Time-2-Read trial.";
    const html = shell(preview,
      `<p style="${P}">${esc(hi)}</p><p style="${P}">${esc(intro)}</p>` +
      list(steps.map(([b, r]) => `<b>${esc(b)}</b> ${esc(r)}`)) +
      btn(`${site}/`, "Start tonight's story") +
      box(`<b>Your free week</b><br>${esc(boxText)}`), foot, i.unsubscribeUrl, i.mailingAddress);
    const text = textOf([hi, intro, ...steps.map(([b, r]) => `- ${b} ${r}`), `Start tonight's story: ${site}/`, `Your free week: ${boxText}`], foot, i.unsubscribeUrl, i.mailingAddress);
    return { subject, preview, html, text };
  }

  if (i.kind === "trial_ending") {
    if (!i.trialEnd) throw new Error("trial_ending needs trialEnd");
    const day = weekday(i.trialEnd);
    const read = (i.children ?? []).filter((c) => c.stories > 0 || c.pages > 0 || c.quizzes > 0)
      .sort((a, b) => b.stories - a.stories);
    const subject = `Your free week ends ${day}`;
    const nothingRead = "Try one story tonight. It takes 10 minutes.";
    const first = read[0];
    const preview = first ? `${first.name} has read ${plural(first.stories, "story", "stories")} so far.` : nothingRead;
    const statLine = (c: ChildStats) => [plural(c.stories, "story", "stories"),
      ...(c.pages > 0 ? [`${plural(c.pages, "page", "pages")} read`] : []),
      ...(c.quizzes > 0 ? [plural(c.quizzes, "quiz", "quizzes")] : [])].join(", ");
    const annual = i.plan === "annual";
    const price = annual ? "$99 a year" : "$12.99 a month";
    const p1 = `Your free week ends on ${longDate(i.trialEnd)}. Here's what your family has so far:`;
    const p2 = `To keep reading, you don't need to do anything. Premium continues at ${price} on ${dayMonth(i.trialEnd)}, and every story, level and quiz stays saved.`;
    const cancelLabel = `Cancel before ${day}`;
    const foot = "Reminder about your Time-2-Read trial.";
    const boxHtml = read.length
      ? read.map((c) => `<b>${esc(c.name)}:</b> ${esc(statLine(c))}`).join("<br>")
      : esc(nothingRead);
    const html = shell(preview,
      `<p style="${P}">${esc(hi)}</p>` +
      `<p style="${P}">Your free week ends on <b>${esc(longDate(i.trialEnd))}</b>. Here's what your family has so far:</p>` +
      box(boxHtml) +
      `<p style="${P}">To keep reading, you don't need to do anything. Premium continues at <b>${esc(price)}</b> on ${esc(dayMonth(i.trialEnd))}, and every story, level and quiz stays saved.</p>` +
      btn(`${site}/?billing=keep`, "Keep Premium") +
      (annual ? "" : btn2(`${site}/?billing=yearly`, "Switch to yearly: $99, saves $56")) +
      small(`Not for you? <a href="${esc(`${site}/?billing=cancel`)}" style="color:${C.brand}">${esc(cancelLabel)}</a> ${esc("and you won't be charged. Your stories stay saved either way.")}`),
      foot, i.unsubscribeUrl, i.mailingAddress);
    const text = textOf([hi, p1, read.length ? read.map((c) => `${c.name}: ${statLine(c)}`).join("\n") : nothingRead, p2,
      `Keep Premium: ${site}/?billing=keep`, ...(annual ? [] : [`Switch to yearly: $99, saves $56: ${site}/?billing=yearly`]),
      `Not for you? ${cancelLabel} and you won't be charged (${site}/?billing=cancel). Your stories stay saved either way.`], foot, i.unsubscribeUrl, i.mailingAddress);
    return { subject, preview, html, text };
  }

  if (i.kind === "free_stories_used") {
    const who = child ?? "Your child";
    const subject = `${who} finished 3 stories`;
    const preview = "Here's what comes next.";
    const p1 = `${who} has read all 3 free stories. Nice work.`;
    const items = ["Unlimited stories, as long as they want", "Their own ending, every time",
      "Read-aloud, quizzes after each story, and progress you can see", "Stories for every child in the family"];
    const terms = "7 days free, then $12.99 a month or $99 a year. Cancel anytime.";
    const foot = "You're getting this because you have a Time-2-Read account.";
    const html = shell(preview,
      `<p style="${P}">${esc(hi)}</p><p style="${P}">${esc(p1)}</p><p style="${P}">With Premium, the reading keeps going:</p>` +
      list(items.map(esc)) + btn(`${site}/pricing`, "Start a free week") + small(esc(terms)),
      foot, i.unsubscribeUrl, i.mailingAddress);
    const text = textOf([hi, p1, "With Premium, the reading keeps going:", items.map((x) => `- ${x}`).join("\n"), `Start a free week: ${site}/pricing`, terms], foot, i.unsubscribeUrl, i.mailingAddress);
    return { subject, preview, html, text };
  }

  // come_back
  const n = i.storyCount ?? 0;
  const whose = child ? `${child}'s` : "Your child's";
  const subject = `${whose} stories are still saved`;
  const preview = "Whenever you're ready.";
  const p1 = `Just so you know: ${whose} ${plural(n, "story", "stories")} and reading level are still saved. If you come back, they pick up right where they left off.`;
  const only = "This is the only email we'll send about it.";
  const foot = "You're getting this because you had a Time-2-Read account.";
  const html = shell(preview,
    `<p style="${P}">${esc(hi)}</p><p style="${P}">${esc(p1)}</p>` + btn(`${site}/`, "Pick up where they left off") + small(esc(only)),
    foot, i.unsubscribeUrl, i.mailingAddress);
  const text = textOf([hi, p1, `Pick up where they left off: ${site}/`, only], foot, i.unsubscribeUrl, i.mailingAddress);
  return { subject, preview, html, text };
}
