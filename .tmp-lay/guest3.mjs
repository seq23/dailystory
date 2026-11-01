import { chromium } from 'playwright';
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const out = process.argv[2];
const b = await chromium.launch({ executablePath: exe });
const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
await p.goto('https://time-2-read.com/', { waitUntil: 'networkidle' });
await p.getByText('Only needed').click().catch(()=>{});
await p.getByText('Create Your First Story').first().click();
await p.waitForTimeout(2000);
await p.getByLabel(/Child's Name/i).fill('Maya').catch(async()=>{ await p.locator('input').first().fill('Maya'); });
await p.getByText('Skip and create story now').click();
const snap = async (i) => {
  const t = (await p.locator('main').innerText().catch(()=>p.locator('body').innerText())).replace(/\s+/g,' ');
  const pg = (t.match(/Page \d+ of \d+/)||[''])[0];
  console.log(`#${i} ${pg} | nextStory=${/Next Story/i.test(t)} finish=${/Finish Story/i.test(t)} | ${t.slice(t.indexOf('Save')+5, t.indexOf('Save')+170)}`);
};
await p.waitForTimeout(20000); await p.getByText('Start Adventure').click().catch(()=>{}); await p.waitForTimeout(20000);
await snap(1);
for (let i = 2; i <= 8; i++) {
  const nx = p.getByRole('button', { name: /^Next$/ }).last();
  if (!(await nx.isVisible().catch(()=>false))) { console.log('no Next button'); break; }
  await nx.click();
  await p.waitForTimeout(25000);
  await snap(i);
}
await p.screenshot({ path: out + '/guest_end.png' });
await b.close();
