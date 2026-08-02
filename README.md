# HUBC website

Vite + React single-page site.

## Local

```bash
npm install
npm run dev
```

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. In Vercel: **Add New → Project → import the repo.**
3. Framework preset: **Vite** (auto-detected). Build command `npm run build`, output directory `dist`. No env vars needed.
4. Deploy.

## Point the GoDaddy domain at it

1. Vercel → Project → **Settings → Domains → Add** `harvardblockchain.org` (and `www.`).
2. Vercel shows the records to create. In GoDaddy → **My Products → DNS**:
   - `A` record, host `@`, value `76.76.21.21`
   - `CNAME` record, host `www`, value `cname.vercel-dns.com`
   (Use whatever values Vercel displays — they take precedence over these.)
3. Delete GoDaddy's default parking/forwarding records for `@` and `www`.
4. Wait for propagation (usually minutes, up to a few hours). Vercel issues the SSL cert automatically.

## Notes

- Images live in `public/` and are referenced as `/name.jpg`.
- Fonts: Instrument Serif (display), IBM Plex Sans (body), IBM Plex Mono (labels), loaded in `index.html`.
- The hero skyline is generated in `src/App.jsx` (`buildCells()`); each building is a few `box` / `pediment` / `spire` / `dome` calls on a 93-column grid, so shapes are easy to adjust.
