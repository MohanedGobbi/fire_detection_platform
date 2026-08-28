# FireDetect — Handoff

Status snapshot for whoever picks this up next (including future-you).
Product context lives in [PRODUCT.md](PRODUCT.md), the visual system in
[DESIGN.md](DESIGN.md), and run/architecture basics in [README.md](README.md)
— this file is the layer between them: what's actually built, what's
faked, what's fragile, and what to do first.

## ⚠️ Nothing here is committed yet

Every change described below is still sitting **uncommitted in the working
tree** (`git status --short` currently shows ~40 changed/new files). Review
and commit in logical chunks before anyone else pulls this branch — don't
`git add -A` blindly; a couple of the new files are large binaries (demo
photos, the ThreeUI hero's bundled assets) that belong in the repo on
purpose, see "Assets that must ship" below, but skim the diff first.

## What this is

FireDetect: an early wildfire-detection platform. A Python stdlib HTTP
server runs a YOLOv8 fire/smoke model over camera frames and is the sole
alarm authority; a React/Vite frontend gives operators a camera wall, a
live map, and the public a no-login fire-report form. Originally scaffolded
as "Pyrophyte" (security-camera-dashboard look) — fully rebranded and
redesigned this pass into a National Park Service Unigrid-styled identity
around wildfire protection in northern Algeria. See PRODUCT.md for the
full why.

## Routes

| Route | What it is | Auth |
|---|---|---|
| `/` | Marketing landing page — 3D hero (ThreeUI) + bilingual EN/AR sections | none |
| `/dashboard` | Operator camera wall — add real cameras or use the seeded demo ones | none |
| `/map` | Live map — camera alarm state + public reports, Algeria-focused by default | none |
| `/report` | Public fire-report form — pin a location, describe, optional photo | none |
| `/admin` | Report triage — filter, view, change status | none |

**No authentication exists anywhere**, `/admin` included. That's a known,
explicit constraint (see PRODUCT.md's Capabilities and Constraints), not an
oversight — but it means anyone with the URL can change report status
right now. Gate this before any real deployment.

## Run it locally

```bash
# terminal 1 — detection server (needs server/models/best.pt, see README)
python server/detect_server.py --port 8700

# terminal 2 — frontend
npm install
npm run dev
```

Needs `.env.local` at the project root with `VITE_MAPBOX_TOKEN=<token>`
(see `.env.example`) or the map and the 3D hero's own map-adjacent bits
won't render. That file is gitignored on purpose — whoever deploys this
needs their own Mapbox token, don't reuse whatever is currently in it
without checking whose it is.

Verify a change before calling it done:
```bash
npx tsc -b        # must exit 0
npx eslint src     # 8 pre-existing errors in src/components/ui/*.tsx are
                   # unrelated scaffold issues, not yours — anything else is
npm run dev        # then actually click through it; this app has burned
                   # real bugs that only showed up in the browser (see below)
```

## Data model — read this before "fixing" anything that looks broken

- **Cameras live in `localStorage`** (`firedetect.cameras.v1`), per browser.
  Two operators on two machines see *different* camera rosters. There is
  no shared backend camera store. This is fine for a demo, not for a real
  multi-operator deployment — flagging so nobody "fixes" the map by adding
  a camera that only they can see.
- **Reports live server-side in SQLite** (`server/firedetect.db`, gitignored,
  auto-created). This part *is* shared/global — genuinely multi-client.
- **Report photos** land on local disk (`server/uploads/reports/`,
  gitignored). No cloud storage. Fine for dev.
- **`DETECTION_SERVER`** is hardcoded to `http://127.0.0.1:8700` in
  `src/lib/config.ts`. Any real deployment needs this to become a real env
  var — right now it's a single hardcoded constant everything imports, so
  that's a one-line change, not a hunt.

## The three things that look simple but aren't

1. **The landing page's 3D hero is a separate HTML document, not a React
   component.** `public/landing-pages/inner-green-3d.html` is a customized
   copy of ThreeUI's "Sylva — Living Green" (MIT-licensed, Community tier),
   loaded via `<iframe>` in `src/pages/Landing.tsx`. Every "Sylva"/ThreeUI
   brand reference was stripped and replaced with FireDetect copy; its two
   stat widgets fetch the real detection server directly (hardcoded URL
   inside that file, kept in sync by hand with `src/lib/config.ts` — see
   the comment at the top of its `<style>` block). **Its own text is
   English-only** — the layout is built on fixed-pixel offsets from a
   1600×880 reference frame and can't safely mirror for Arabic RTL. If you
   ever need to touch this file: the visible markup is only lines ~714–900;
   everything else is the (untouched, vendor) Three.js/shader engine. Don't
   hand-edit the shader code. Two real bugs got fixed in here already —
   worth knowing before you reintroduce them:
   - The template's own click handler calls `preventDefault()` on every
     `[data-dock]` nav click for a ripple effect; real navigation links
     need `target="_top"` checked before skipping that, or clicks silently
     do nothing.
   - A bare `href="#section-id"` with `target="_top"` resolves against the
     **iframe's own URL**, not the parent page — it'll navigate the whole
     tab to the raw HTML file. Anchor links out of the iframe need an
     absolute path: `href="/#section-id"`.
2. **Demo cameras are real photos, not video.** `src/components/DemoFeed.tsx`
   composites a real CC BY-SA photo (Wikimedia Commons, one per Algerian
   forest region — `public/demo-cameras/`, credits + license in
   `CREDITS.md` there, **don't delete that file**, the license requires
   attribution) with a canvas-drawn atmospheric overlay (drifting light,
   grain, vignette). They report `status: "live"` but are explicitly
   excluded from the AI detection loop (`camera.type === "demo"` skips the
   `/detect` fetch entirely in `CameraFeed.tsx`) — never sent to the real
   model. Auto-seeded once on a genuinely first-ever visit (checked via
   `localStorage.getItem(STORAGE_KEY) === null`, not "cameras array is
   empty" — a user who deliberately clears their cameras won't get
   silently re-seeded). Manually reloadable from the Dashboard's empty
   state ("Load demo cameras").
3. **Status color is one shared constant, not per-component.**
   `src/lib/statusLaw.ts` (`REPORT_STATUS_COLOR`, `CAMERA_STATUS_LAW`,
   `REPORT_STATUS_LAW`) is the *only* place status→color mapping is
   defined — the map markers (`FireMap.tsx`), the map legend, the landing
   page's status section, and the admin list all import from it. If a new
   status color is ever needed, it goes here once, not wherever the map
   marker happens to live.

## i18n

`src/lib/i18n.tsx` + `languageData.ts` + `src/hooks/useLanguage.ts`
(split across three files on purpose — a Fast Refresh lint rule blocks
mixing a component and a hook in one file). EN/AR, `localStorage`-persisted,
flips `<html dir>` and lets Tailwind's built-in `rtl:`/`ltr:` variants
(3.3+, no plugin) handle mirroring. Currently wired into the landing page
only — the dashboard/map/report/admin operator surfaces are English-only.
Extending it: add the new strings to `Dictionary` in `languageData.ts`,
fill both `en` and `ar`, consume via `useLanguage().t`.

## Assets that must ship (don't gitignore these)

- `public/landing-pages/` — the ThreeUI hero + its bundled `three.min.js`,
  font, and two stock images (~1.5MB). MIT-licensed, self-contained, no
  external requests at runtime.
- `public/demo-cameras/` — 5 JPGs + `CREDITS.md` (~1.4MB). CC BY-SA,
  attribution required, credits file must stay.

Both were fetched by hand this session, not via `npm install`, because the
sandbox's network path to npm/GitHub was unreliable for large packages —
that's an environment quirk of *this* session, not a statement about how
to add assets going forward. A normal `npm install` should work fine in a
real dev environment.

## Known gaps (not fixed, not forgotten)

- No tests. Nothing automated beyond `tsc`/`eslint` — every verification
  this session was manual, in-browser.
- No auth on `/admin` or anywhere else (see above).
- No production build/deploy config — this is dev-server-only
  (`npm run dev` + the stdlib Python server). No Dockerfile, no CI beyond
  whatever the repo already had.
- Camera roster isn't shared across operators (localStorage, see above).
- The YOLO model weights (`server/models/best.pt`) are gitignored — a
  fresh clone needs to download them separately (README has the URL) or
  the server silently falls back to a much weaker HSV heuristic detector.

## If you're picking this up cold

1. Read PRODUCT.md (who this is for, what it claims to do) and DESIGN.md
   (the visual system — pine/paper/Unigrid, the NFDRS status-color law,
   Archivo/Public Sans/Cairo) before changing anything visual.
2. Get both servers running (above), confirm `/health` and the map both
   load, then look at `/dashboard` — the 5 demo cameras should already be
   there.
3. `git diff --stat` to see the actual size of what's uncommitted before
   doing anything else.
