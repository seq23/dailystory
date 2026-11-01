import { chromium } from 'playwright';
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const b = await chromium.launch({ executablePath: exe });
const p = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
await p.goto('https://time-2-read.com/', { waitUntil: 'networkidle' });
await p.waitForTimeout(2000);
const btns = await p.$$eval('button, a', els => els.map(e => (e.innerText||'').trim().replace(/\s+/g,' ')).filter(t => t && t.length < 50));
console.log(JSON.stringify([...new Set(btns)].slice(0, 40)));
await b.close();
