# REPO_IDENTITY

- Repo: `dailystory`
- GitHub owner: seq23
- Production domain: https://time-2-read.com/
- Canonical domain: https://time-2-read.com/
- Brand: Time2Read
- Category: side business — subscription reading product for children
- Search Console property: `https://time-2-read.com/` (URL-prefix)
- Stack: Vite + React + TypeScript, Supabase (Postgres + edge functions)
- Deployment target: Lovable (the app shell is served for every path; see "Known limits")
- Sitemap: `public/sitemap.xml`, served at https://time-2-read.com/sitemap.xml

## Known limits of the host

Lovable answers the `www` host with its own 302 and serves the app shell with
`200` for every unknown path, so this repo cannot set a `301` on `www` or return
a real `404`. Both are recorded as known limits for this site in the Search
Readiness checklist rather than treated as repo defects.

## Cost stance

Nothing paid in this repo's own automation. See `docs/cost/zero-paid-llm.md` and
`config/llm_routing.json`; the product's subscriber-funded inference is a
separate, named lane.
