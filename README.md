# multitwitch — reborn

Zero-backend SPA for watching multiple Twitch streams at once. React + Vite + TS + Tailwind v4.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Build

```bash
npm run build
npm run preview
```

## Deploy

- **Vercel:** connect the repo, zero config.
- **GitHub Pages:** `npm run deploy` (uses `gh-pages`). If hosting under a sub-path, set `base` in `vite.config.ts`.

The Twitch iframe `parent` param is detected at runtime from `window.location.hostname`, so it works on any domain.

## Shortcuts

- `/` focus the add-stream input
- `m` / `u` mute / unmute all
- `1`–`9` focus stream N (switches to focus layout)
- `esc` back to grid

## URL state

`?streams=a,b,c&layout=focus&focus=a&chat=1` — share links round-trip.
