# CLAUDE.md — MultiTwitch Reborn

## Project Summary

Rebuild and modernize [bhamrick/multitwitch](https://github.com/bhamrick/multitwitch) — a web app that lets anyone watch multiple Twitch streams on a single page at the same time. The original is a dated Python/Pyramid app where streams are specified in the URL path (e.g. `/user1/user2/user3`). We're replacing it with a modern, zero-backend, statically-hosted SPA with better UX.

**No login. No backend. No tracking. Free to host. Free for everyone to use.**

## Goals

1. **Zero backend.** Everything runs client-side. Twitch's embed player (`player.twitch.tv`) handles all video — no Twitch API key, no OAuth, no server.
2. **Free hosting.** Deployable to GitHub Pages or Vercel with zero config. Prefer a setup that works on both.
3. **Add streams by username.** Users type a Twitch username into an input, hit enter (or click add), and the stream appears. No URL editing required — though URL state should still sync so links are shareable.
4. **Fast ad/break controls.** One-click minimize and one-click close on every stream tile. Also: mute all, unmute all, and a "hide video (keep audio)" toggle for riding out ads without losing the stream slot.
5. **Better styling** than the original — modern, dark-first, responsive, mobile-friendly.

## Tech Stack

- **Framework:** React + Vite + TypeScript
- **Styling:** Tailwind CSS (v4 if available, otherwise v3)
- **State:** React hooks only. No Redux, no Zustand. URL query string is the source of truth for which streams are active.
- **Video:** Official Twitch embed via `<iframe src="https://player.twitch.tv/?channel={username}&parent={hostname}&muted=true">`. Use the Twitch Embed JS SDK (`https://embed.twitch.tv/embed/v1.js`) only if we need programmatic mute/pause control — otherwise stick to iframes for simplicity.
- **Routing:** None needed. Single page. Read/write `window.location.search` (e.g. `?streams=user1,user2,user3`) so links are shareable and back/forward work.
- **No backend, no database, no auth, no analytics.**

## Core Features

### MVP (build first)
- [ ] Add a stream by typing a Twitch username. Validate format (alphanumeric + underscore, 4–25 chars per Twitch rules). Trim whitespace, lowercase.
- [ ] Remove a stream with one click (X button on each tile).
- [ ] Minimize a stream (collapse to a small header bar; click to restore). Minimized streams should stop rendering the iframe to save bandwidth, OR keep it and just hide visually — make this configurable, default to **unmount iframe when minimized** so ads don't play.
- [ ] Responsive auto-grid layout: 1 stream = full width, 2 = side by side, 3–4 = 2x2, 5–6 = 3x2, etc. CSS Grid with `auto-fit` / `minmax` or a computed layout based on stream count.
- [ ] Per-stream mute toggle, plus global "Mute All" / "Unmute All" in the toolbar.
- [ ] URL sync: `?streams=zachari,someoneelse` — editing the stream list updates the URL, and loading a URL with streams restores them.
- [ ] Chat panel toggle: optional Twitch chat sidebar for the "focused" stream (user can pick which stream is focused). Uses `https://www.twitch.tv/embed/{username}/chat?parent={hostname}&darkpopout`.
- [ ] Dark theme by default. Clean, modern, purple-accented (Twitch-adjacent) but not a clone.

### Nice-to-haves (build after MVP works)
- [ ] **Drag-and-drop reorder** of stream tiles (use `@dnd-kit/core` — it's the lightest good option).
- [ ] **Layout presets:** "Equal grid", "Focus mode" (one big stream, others as thumbnails on the side), "Theater" (single stream full-bleed).
- [ ] **Resize streams** by dragging tile corners in focus mode.
- [ ] **Hide video, keep audio** toggle per stream — for riding out ads without losing the slot. Implement by swapping the iframe for a placeholder and keeping a hidden `<audio>` tag if possible, OR by keeping the iframe but visually hiding it (simpler; implement this way first).
- [ ] **Quick presets:** save a group of streams to localStorage as a named preset ("My Tuesday crew"), one-click load.
- [ ] **Quality selector** per stream (auto/source/720p/480p/160p) — helps with bandwidth when running 6+ streams.
- [ ] **Copy shareable link** button in toolbar.
- [ ] **Keyboard shortcuts:** `m` mute all, `u` unmute all, `1–9` focus stream N, `esc` exit focus mode, `/` focus the add-stream input.
- [ ] **Stream status check** (optional): ping `https://www.twitch.tv/{username}` via a `fetch` with `no-cors` — won't actually tell us if they're live (CORS), so skip this unless we find a way without a backend. **Acceptable fallback:** just show the embed; Twitch itself will show "offline" in the player.
- [ ] **Picture-in-picture** button for single streams (uses the browser's PiP API on the iframe's video — may not work on Twitch iframes; test and drop if blocked).

## Architecture Notes

### Component sketch
```
<App>
  <Toolbar>           // add input, mute all, layout selector, share link
  <StreamGrid>
    <StreamTile>      // per stream: iframe, controls, drag handle
      <StreamControls> // mute, minimize, hide-video, close
    </StreamTile>
  </StreamGrid>
  <ChatPanel>         // optional sidebar
</App>
```

### State shape
```ts
type Stream = {
  username: string;   // lowercased, validated
  id: string;         // nanoid or `${username}-${timestamp}` for React keys
  minimized: boolean;
  muted: boolean;
  hideVideo: boolean;
};

type AppState = {
  streams: Stream[];
  focusedId: string | null;
  layout: 'grid' | 'focus' | 'theater';
  chatVisible: boolean;
  chatUsername: string | null;
};
```

URL sync: on every state change, update `?streams=...&layout=...&focus=...`. On mount, parse `window.location.search` to hydrate.

### Twitch embed gotcha — `parent` parameter
The Twitch iframe **requires** a `parent` query param matching the hostname it's embedded on, or it refuses to load. This matters for deployment:
- Dev: `parent=localhost`
- GitHub Pages: `parent={username}.github.io`
- Vercel: `parent={project}.vercel.app` **and** any custom domain

You can pass multiple `parent` params in one URL (`&parent=a&parent=b`) — do this, OR detect `window.location.hostname` at runtime and inject it. **Use runtime detection** — simpler and works everywhere. Example:
```ts
const parent = window.location.hostname || 'localhost';
const src = `https://player.twitch.tv/?channel=${username}&parent=${parent}&muted=${muted}`;
```

### Minimize behavior
When a stream is minimized, **unmount the iframe** (conditional render) so it stops consuming bandwidth and playing ads. When restored, remount it. This is the whole point of the feature — don't just `display: none`.

## Styling Direction

- **Dark background** (`#0e0e10` Twitch-ish or true black `#0a0a0a`).
- **Accent:** a single purple (`#9146FF` Twitch purple) or pick a different accent (electric green, cyan) to feel like its own thing. Lean toward the latter for originality.
- **Tile borders:** subtle 1px border, rounded corners (`rounded-xl`), soft shadow on hover.
- **Typography:** Inter or system sans. Tight letter-spacing on headings.
- **Controls:** floating toolbar on each tile, fades in on hover, always visible on touch devices.
- **Empty state:** friendly prompt with an example username, not a blank page.
- **Mobile:** stack streams vertically below ~768px. Make controls bigger on touch.

## Deployment

### GitHub Pages
- Add `base: '/multitwitch/'` (or whatever the repo name is) to `vite.config.ts`.
- Use the `gh-pages` npm package or a GitHub Action (`peaceiris/actions-gh-pages`) to deploy `dist/` to the `gh-pages` branch on push to `main`.

### Vercel
- Zero config. `vercel` detects Vite automatically. Just connect the repo.
- If we use a custom domain, remember the Twitch `parent` param handling above.

**Recommendation:** Deploy to both. Vercel as primary (faster, better DX, automatic previews), GitHub Pages as a backup/demo link from the README.

## Explicit Non-Goals
- No user accounts. No favorites stored server-side — use localStorage only.
- No scraping the Twitch API for live status. If we want this later it'd need a tiny serverless function; out of scope for v1.
- No chat aggregation across streams. Too hard, off-scope.
- No monetization, no ads, no analytics beyond maybe a privacy-friendly counter (Plausible) if added later — **off by default**.

## Build Order

1. Scaffold Vite + React + TS + Tailwind. Verify it runs.
2. Hardcode two streams, get the iframe + `parent` param working locally.
3. Add input to add/remove streams dynamically. Get the grid layout working.
4. URL sync.
5. Per-tile controls (mute, minimize-unmount, close).
6. Global toolbar (mute all, layout selector).
7. Styling pass — make it look good.
8. Chat panel.
9. Deploy to Vercel, verify the `parent` param works on the live domain.
10. Nice-to-haves from the list above, in whatever order feels fun.

## Things to Double-Check Before Shipping
- Twitch embeds work on the actual deployed domain (not just localhost).
- Adding 6+ streams doesn't tank the browser (it will be heavy — that's Twitch's fault, not ours, but test it).
- Mobile layout is actually usable.
- Minimize truly unmounts the iframe (check Network tab — traffic should stop).
- URL share links work when pasted fresh in an incognito window.
- No console errors, no TS errors, no unused deps in `package.json`.

## Layout Details (important — the original's layout is the main thing we're fixing)

The original multitwitch crams iframes into a flex row with no responsive logic and no aspect-ratio preservation. That's the #1 thing to fix. Don't just "use a grid" — follow these specifics:

### Grid math by stream count
Compute `grid-template-columns` explicitly from the stream count. Do NOT use `auto-fit` / `minmax` — it gives inconsistent tile sizes that look sloppy when streams are added/removed.

- **1 stream:** full bleed, centered, max-width constrained so it doesn't get absurdly large on ultrawide monitors (cap around `max-w-[1600px]`).
- **2 streams:** side by side on desktop (≥768px), stacked on mobile.
- **3 streams:** 3 across on wide screens (≥1280px), otherwise 2-on-top + 1-centered-below, or stacked on mobile.
- **4 streams:** 2×2.
- **5–6 streams:** 3×2.
- **7–9 streams:** 3×3.
- **10+:** 4 columns, scroll vertically. Warn the user that performance will suffer past ~6 streams (Twitch embeds are heavy).

Implement this as a `getGridClasses(count: number)` helper or a `useMemo` that returns the Tailwind classes. Keep it in one place so it's easy to tweak.

### Aspect ratio
Every tile wrapper must use `aspect-ratio: 16/9` (Tailwind: `aspect-video`). The iframe inside is `w-full h-full`. This is non-negotiable — without it, tiles stretch into weird shapes and it looks amateur. The original project's biggest visual failure is ignoring this.

### Focus mode (first-class layout)
Focus mode is not a nice-to-have, it's a core layout option alongside the equal grid. When active:
- One stream takes ~75% of the horizontal space (the "focused" stream).
- Remaining streams render as a vertical thumbnail rail on the right (desktop) or a horizontal scrollable rail along the bottom (mobile, below ~1024px).
- Clicking a thumbnail swaps it into the focus slot (the old focused stream moves to the rail).
- Thumbnails in the rail are still live — they're real iframes, just smaller. Keep them muted by default.
- A draggable vertical divider between the focus area and the rail lets users adjust the split (min 60%, max 85% for the focus pane). Store the split percentage in state and optionally persist to localStorage.

This is the layout people actually want for watching tournaments with a main POV plus sub-POVs. Build it alongside the equal grid, not after.

### Theater mode
Simpler: one stream, full viewport, everything else hidden (but not unmounted — keep their state so toggling back to grid restores them). Press `esc` or click a "back to grid" button to exit.

### Spacing and visual polish
- `gap-3` between tiles (12px). The original has zero gap and tiles touch.
- `p-4` padding around the grid container.
- `rounded-xl` on tile wrappers, with `overflow-hidden` so the iframe corners clip properly.
- 1px subtle border (`border border-white/10`) on each tile for definition against the dark bg.
- Soft shadow on hover (`hover:shadow-2xl hover:shadow-black/50`) and a subtle border color shift (`hover:border-white/20`).
- Smooth transitions (`transition-all duration-200`) on hover states.

### Tile hover state
The original has no hover interaction at all. We need:
- Controls (mute, minimize, hide video, close, drag handle) fade in from opacity 0 to 100 on hover, always visible on touch devices (`@media (hover: none)`).
- A thin gradient overlay at the top of the tile on hover showing the streamer's username in a readable font.
- Drag handle icon (top-left) appears on hover, shows `cursor-grab` / `cursor-grabbing`.
- Close button (top-right) is red-tinted on hover for clear affordance.

### Drag-and-drop reordering (promote to MVP)
Move this from nice-to-haves to MVP. A layout-focused rebuild without drag-to-rearrange feels broken. Use `@dnd-kit/core` + `@dnd-kit/sortable`. Only the drag handle should initiate the drag, not the whole tile — otherwise users can't click the iframe controls without accidentally dragging.

### Mobile behavior (≥ actually good, not an afterthought)
- Below 768px: streams stack vertically, full width, `aspect-video` preserved.
- Toolbar collapses into a hamburger or stays as a bottom sheet.
- Controls on tiles are always visible (no hover on touch) and sized up for finger targets (`min-h-11 min-w-11`).
- Focus mode rail flips to the bottom and scrolls horizontally.
- Swipe gestures for closing a tile (swipe left) — nice-to-have, not required.

### Empty state
Don't leave a blank page. Show a centered card with:
- An icon or small illustration.
- "Add a Twitch username to get started" copy.
- The input field (same one as the toolbar) prominently placed.
- 3–4 example buttons for popular streamers the user can one-click add (pick neutral well-known ones or just `shroud`, `pokimane`, `xqc`, `sodapoppin`).
- Optional: a "Recent streams" list from localStorage if the user has used the app before.

### Layout-related Tailwind cheat sheet
```
Grid container: grid gap-3 p-4
Tile wrapper:   relative aspect-video rounded-xl overflow-hidden border border-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-black/50 transition-all duration-200 group
Iframe:         w-full h-full
Controls:       absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity
Drag handle:    absolute top-2 left-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100
```

## Reference
- Original project: https://github.com/bhamrick/multitwitch
- Twitch embed docs: https://dev.twitch.tv/docs/embed/video-and-clips/
- Twitch embed JS SDK: https://dev.twitch.tv/docs/embed/everything/
