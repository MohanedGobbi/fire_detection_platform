---
name: FireDetect
description: An early wildfire/fire detection platform, styled after the NPS Unigrid brochure and signage system.
colors:
  paper: "#F3F0E7"
  panel: "#FBFAF8"
  ink: "#1F1C19"
  slate: "#6E665E"
  pine: "#15382A"
  pine-deep: "#0E2A20"
  hairline: "#DCD4C6"
  danger-low: "#4C8F5B"
  danger-moderate: "#3C74A6"
  danger-high: "#C99A16"
  danger-veryhigh: "#C96A1F"
  danger-extreme: "#B9282A"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontWeight: 900
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    letterSpacing: "0.14em"
rounded:
  sm: "1px"
  md: "3px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-plate:
    backgroundColor: "{colors.pine}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    padding: "13.6px 28px"
  button-plate-hover:
    backgroundColor: "{colors.pine}"
---

# Design System: FireDetect

## Overview

**Creative North Star: "The Unigrid Instrument"**

FireDetect is built as a US wildland-fire agency artifact rather than a
generic security-camera SaaS dashboard: a product styled after Massimo
Vignelli's National Park Service Unigrid system — the brochure and signage
program that puts one bold color field, a strict modular grid, and
condensed wayfinding lettering behind every park in the system. Warm
brochure-stock paper (`--paper`) is the resting ground; deep institutional
pine green (`--pine`) is the brand's own color, distinct from the status
language. Status color — camera alarm state, report review state — is
never invented per-component; it is the National Fire Danger Rating
System's own five-level scale (`--danger-low` through `--danger-extreme`),
the exact color law this audience already reads at every trailhead,
applied with zero exceptions.

This is a deliberate rejection of the "dark dashboard with red glowing
alerts" default every AI-camera-alert product ships as (the system's
previous identity, "Pyrophyte," was exactly that — evidence of what to
avoid, not what to preserve). Panels commit to one dominant color field at
a time — a cover panel is entirely pine, a mechanism panel is entirely
paper, a status panel is entirely pine-deep — the way a park brochure
never mixes two accent colors on one folded panel.

**Key Characteristics:**
- Warm parchment paper ground, never cool gray or pure white as the resting surface
- One color field per panel/section — color marks context, not decoration
- The NFDRS five-level scale is the only status vocabulary anywhere in the product
- Condensed-feel, black-weight Archivo for display and wayfinding labels; Public Sans (the US federal government's own typeface) for body copy
- Near-square corners (1–3px) — routed-sign plates, not rounded SaaS chrome
- No dark mode — this is a fixed, committed light identity

## Colors

Color is restrained-to-committed: neutrals and pine carry the operate
surfaces (dashboard, map, report form); the landing page commits full
panels to pine, pine-deep, and the danger-orange field.

### Primary
- **Pine** (`#15382A`): the brand's institutional color. Nav active state, primary buttons, links, focus rings, the landing page's cover and status panels.
- **Pine Deep** (`#0E2A20`): a darker pine used for full-bleed panels that need higher text contrast (the status-law section, the footer) — never used interchangeably with Pine; Pine Deep is for panels people read text on, Pine is for brand marks and controls.

### Status Law (not decorative — see Named Rule below)
- **Danger Low** (`#4C8F5B`, green): acknowledged / handled report.
- **Danger Moderate** (`#3C74A6`, blue): reserved in the system, not currently assigned to a product state.
- **Danger High** (`#C99A16`, gold): reserved in the system, not currently assigned to a product state.
- **Danger Very High** (`#C96A1F`, orange): recently alarmed camera; the landing page's "Get Started" panel.
- **Danger Extreme** (`#B9282A`, red): active fire alarm; an unverified public report.

### Neutral
- **Paper** (`#F3F0E7`): page background — warm parchment, the brochure-stock tone.
- **Panel** (`#FBFAF8`): card/panel surface, a near-white warm tone against Paper.
- **Ink** (`#1F1C19`): primary text — warm near-black, never pure `#000`.
- **Slate** (`#6E665E`): secondary/muted text.
- **Hairline** (`#DCD4C6`): all borders and dividers — warm, never cool gray.

### Named Rules
**The One Color Law Rule.** Danger Low/Very High/Extreme are the *only*
colors ever used for status anywhere in the product — camera alarm dots,
report markers, map legends, popup buttons. A new status must reuse one of
these five values or extend the scale; it may never introduce an
unrelated accent color.

**The One Field Per Panel Rule.** A full-bleed section commits to exactly
one background color. Multiple saturated accents never appear as siblings
inside the same panel — contrast comes from panel-to-panel sequencing, the
way a park brochure changes stock per fold, not from mixing hues within one fold.

**The Embedded Hero Exception.** The landing page's first viewport
(`public/landing-pages/inner-green-3d.html`, from the open-source ThreeUI
Community catalog, MIT-licensed) is a self-contained "full HTML document"
3D scene with its own dark moss-green palette and Lexend typography,
loaded via iframe. It is a deliberate, scoped exception to every rule in
this file — a vendor asset customized with FireDetect's own copy, real
live stats, and real navigation, not a token-system surface. Do not chase
its colors/fonts into the site palette, and do not extend its palette
elsewhere on the site.

## Typography

**Display Font:** Archivo (weights 700–900), with `system-ui, sans-serif` fallback
**Body Font:** Public Sans (weights 400–800), with `system-ui, sans-serif` fallback

**Character:** Archivo is a grotesk with squared, confident terminals —
used at black (900) weight for headlines and wordmarks so it reads as
signage lettering, not a soft SaaS display face. Public Sans is the US
federal government's own typeface (USWDS); pairing it as body copy is a
deliberate, literal extension of the "official land-agency instrument"
premise, not a generic system-font default.

### Hierarchy
- **Display** (900, `clamp(2.5rem, 13vw, 4.5rem)`, leading 0.95): landing-page hero headlines only.
- **Headline** (900, 1.875–2.25rem): section headings (`font-display text-3xl/4xl font-black`).
- **Title** (900, 1.125–1.25rem): card/module titles.
- **Body** (400, 0.875–1rem, leading relaxed): paragraph copy, 65–75ch measure where the layout allows.
- **Label** (700, 11px, tracking 0.1–0.16em, uppercase): the `.micro-label` utility and all nav/button caption text — wayfinding-style, never lowercase.

### Named Rules
**The No Mono Rule.** Monospace is never used as a "technical" costume for
labels or stats (the previous identity did this with Inconsolata). Tabular
alignment comes from `font-feature-settings: "tnum"` on Public Sans, not a
separate font family.

**Arabic.** FireDetect is bilingual (EN/AR) via `LanguageProvider`
(`src/lib/i18n.tsx`, `src/lib/languageData.ts`, `src/hooks/useLanguage.ts`),
toggled by `LanguageToggle` and persisted to `localStorage`. Arabic swaps
the *entire* pairing to Cairo (weights 400–900) for both display and body
— Archivo/Public Sans have no Arabic glyphs, so there is no per-role mix.
`<html dir>` flips to `rtl` and Tailwind's `rtl:`/`ltr:` variants (built
into Tailwind 3.3+, no plugin) handle icon mirroring and side-dependent
spacing; logical flow (flex/grid order, text alignment) mirrors for free.
The embedded 3D hero's own copy stays English-only — its fixed-pixel-offset
layout (see the Embedded Hero Exception above) cannot safely mirror for
RTL — every other section on every page is fully bilingual.

## Layout

Content is organized as **panels/modules**, not one undifferentiated
scroll: each landing-page section is a full-bleed block with its own
background color and internal `max-w-6xl` container. Within a panel, a
strict column grid applies — the "How It Works" section uses a 3-column
module grid on desktop (`sm:grid-cols-3`) with a single hairline vertical
rule between modules, collapsing to a single stacked column with vertical
gaps on mobile. Operate surfaces (dashboard, map) use a fixed three-pane
shell (rail / stage / detail) inherited from the pre-redesign layout,
unaffected by the landing page's panel grammar.

Spacing rhythm: sections use `py-20`–`py-28`; module/card internal padding
is `p-5`–`p-6`; more space sits above a heading than below it throughout.

## Elevation & Depth

Mostly flat. Popups (Mapbox) and the camera dialog use a single soft
shadow (`0 4px 16px rgba(20,15,5,0.16)`) for a functional "this is
floating above the page" cue — never a decorative glow. Buttons use no
shadow at rest; a `translateY(1px)` on `:active` is the only "pressed"
feedback (the "signage plate" being physically pushed, not a shadow
change).

### Named Rules
**The Flat Panel Rule.** Full-bleed color panels never carry a shadow —
color and hairline rules alone separate them.

## Shapes

Near-square throughout: `--radius: 3px`, with buttons (`.btn-plate`) at
`1px`. This is a deliberate departure from the pre-redesign system's
softer `4px` — the routed-sign/brochure-panel register reads as cut,
plate-like edges, not rounded SaaS chrome. Borders are always 1px
hairline (`--hairline`), never a heavier decorative rule, except the
`wayfinding-rule` utility (a full-opacity-reduced top border used
sparingly as a section kicker rule).

## Components

### Buttons
- **Shape:** near-square (1px radius), solid color plate — `.btn-plate` utility class.
- **Primary (`.btn-plate` + `bg-primary`/`bg-white` on pine):** solid pine or white plate, 11px bold tracked-caps label, `13.6px 28px` padding.
- **Secondary/outline (on dark panels):** `border border-white/30`, transparent fill, `hover:bg-white/10`.
- **Hover / Active:** background opacity shift on hover; `translateY(1px)` on active (the plate is "pressed").
- **Legacy small text-buttons** (e.g. "CONFIGURE" in the dashboard): 10–11px bold tracked-caps text, `text-ash` → `text-bone` on hover, no background — reserved for secondary in-context actions, not primary CTAs.

### Cards / Panels
- **Corner Style:** 1–3px (near-square).
- **Background:** `--panel` (`#FBFAF8`) on operate surfaces; the landing page's `StepCard` uses a translucent white-on-pine tint (`bg-white/[0.06]`) instead, since it lives inside a committed-color section.
- **Border:** always 1px `--hairline` (or `border-white/15–25` on dark panels).
- **Internal Padding:** `p-5`–`p-6`.

### Inputs / Fields
- **Style:** 1px hairline border, `--soot`/paper-tinted background, no inner shadow.
- **Focus:** 2px solid pine outline, 1px offset (global `:focus-visible`).
- **Labels:** small persistent inline captions (e.g. "LAT"/"LNG" prefixes inside the camera-position fields) rather than placeholder-only labels, so meaning survives once the field is filled.

### Navigation
- **Style:** tracked-caps (10–11px, bold) text links; active state is a `pine/10%` background tint with pine text; inactive is `--ash` → `--bone` on hover with a `--soot` hover background.
- **Mobile:** nav always renders (never `hidden` at any breakpoint) — a horizontally scrollable row (`overflow-x-auto`) rather than a collapsed hamburger, since the link set is short (3 items) and must stay reachable on every device.

### Status Swatch (signature component)
`StatusSwatch` (`src/components/StatusSwatch.tsx`) renders one entry from
the shared `statusLaw.ts` — a small circle (camera states) or 45°-rotated
diamond (report states), colored from the Danger scale, with an optional
`pyro-marker-alarm` pulse animation for active alarms
(`prefers-reduced-motion`-aware). It is the single source of status
color/shape truth, reused identically on the map legend, the landing
page's "One Status Law" panel, and map markers/popups (`FireMap.tsx`) —
never redefined per surface.

## Do's and Don'ts

### Do:
- **Do** reuse `statusLaw.ts` for any new status display — never hardcode a status color inline.
- **Do** keep one dominant background color per full-bleed panel/section.
- **Do** use `.btn-plate` for primary calls to action; reserve plain text-links (ash→bone) for secondary in-context actions.
- **Do** keep the top nav visible at every viewport width, even if that means a scrollable row on the narrowest phones.
- **Do** set persistent field-level captions (not just placeholders) wherever a field's identity would otherwise be lost once filled in.

### Don't:
- **Don't** introduce a new accent color outside Pine and the five Danger tokens — extend the Danger scale deliberately if a new status is ever needed, never invent a one-off hex.
- **Don't** use monospace fonts for labels, stats, or "technical" flavor — Public Sans with tabular numerals covers every case the previous Inconsolata treatment was doing.
- **Don't** round corners past 3px — the near-square language is load-bearing for the signage identity.
- **Don't** add a kicker/eyebrow line above a section heading — the heading itself carries the weight (see `craft-floor.md`'s standing ban).
- **Don't** show fabricated metrics (customer counts, testimonials, "used by") anywhere — the landing page's live strip only ever shows real data pulled from the running detection server, or a dash when unknown.
