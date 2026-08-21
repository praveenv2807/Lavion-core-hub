# Lavion Core Hub — Phase 1

Homepage build: cinematic canvas frame-by-frame entrance + multilingual layer (10 languages) + core homepage sections.

## Run it
No build step. Open in VS Code and use the **Live Server** extension (right-click `index.html` → "Open with Live Server"), or run:

```
python3 -m http.server 8000
```
then visit `http://localhost:8000`.

> Don't just double-click `index.html` — the frame sequence and language files are loaded via `fetch`, which most browsers block on the `file://` protocol. You need a local server (Live Server or the command above).

## Folder structure
```
lavion-core-hub/
├── index.html
├── assets/
│   ├── css/style.css        → all styling, black + gold theme
│   ├── js/main.js            → canvas scrubber + i18n engine + nav/reveal
│   ├── frames/                → 90 placeholder JPGs (frame_0000.jpg … frame_0089.jpg)
│   └── i18n/                  → en, ta, hi, ar, fr, es, de, it, ml, te .json
```

## The entrance mechanic — how it actually works
This is a **real canvas image-sequence scrubber**, not a CSS animation:
- `assets/frames/` holds a numbered JPG sequence — 115 frames, built from real stock footage: a door-opening clip crossfaded into a gym-interior clip (15-frame blend in the middle), then color-graded toward the black+gold palette.
- On scroll, `main.js` calculates how far you are through the 400vh `#entrance` section (0 to 1), maps that directly to a frame index, and draws that exact frame to a `<canvas>`.
- This is the same technique Apple product pages use.
- **Source footage license note:** the door and interior clips came from free-for-commercial-use stock video sites (Pexels-style licensing). Since this is a portfolio/demo site, that's fine — but double-check the specific license terms of your source clips if this ever becomes a real client-facing production site instead of a demo.

## Replacing the placeholder frames with your real 4K footage
1. Shoot or render the door-opening sequence as a video (a physical door, a 3D render, whatever gives you the shot).
2. Extract frames with ffmpeg, e.g. for a 3-second clip at 30 fps → 90 frames:
   ```
   ffmpeg -i your-footage.mp4 -vf fps=30 assets/frames/frame_%04d.jpg
   ```
   Aim for 90–150 frames, JPG quality 80–85, 1600–2560px wide. More frames = smoother scrub but bigger download — 90–120 is a good balance for web.
3. In `assets/js/main.js`, update:
   ```js
   var FRAME_COUNT = 90; // set to your actual frame count
   ```
4. Refresh — no other code changes needed.

## Multilingual system
- All visible text is wired through `data-i18n="key"` attributes in `index.html`, pulling from `assets/i18n/{lang}.json`.
- Language auto-detects from the browser (`navigator.language`), falls back to English, and remembers manual overrides in `localStorage`.
- To edit copy: edit the `.json` files directly — no HTML changes needed.
- To add an 11th language: add a `{code}.json` file with the same keys, then add it to the `SUPPORTED_LANGS` array in `main.js`.
- **Translation quality note:** the 9 non-English files were machine-translated by me to a solid working standard, not reviewed by native speakers. Recommend a native pass before this goes live, especially for Arabic, Tamil, Hindi, Malayalam, and Telugu.
- Arabic is currently set to render **left-to-right** per your explicit instruction — this is unconventional (Arabic is natively RTL) and will look unusual to native readers. To switch it to proper RTL layout, change `"dir": "ltr"` to `"dir": "rtl"` for the `ar` entry in `SUPPORTED_LANGS` in `main.js`, and review `style.css` for RTL-specific spacing (a few rules are stubbed in already under `[dir="rtl"]`).

## What's placeholder vs. real right now
| Element | Status |
|---|---|
| Door frame sequence | Real composited stock footage (door + interior crossfade), color-graded |
| Trainer photos | Empty gradient blocks, need real photos |
| Gym name/logo mark | Text logo only — waiting on your uploaded logo file |
| Colors | Black + gold placeholder — waiting on your brand file |
| Map | Static placeholder block — needs Google Maps/Mapbox embed + real coordinates |
| Address/phone/hours | Placeholder values — need your real details |
| Membership pricing | Placeholder tiers/prices |
| Booking, payment, admin panel | Not built yet — Phase 2+ |

## Pages
| Page | What it does |
|---|---|
| `index.html` | Homepage — canvas door/interior entrance, About, Programs, Coaches teaser, Membership, Contact |
| `trainers.html` | Full coach bios |
| `gallery.html` | Equipment/space gallery (styled placeholders — swap in real photos) |
| `testimonials.html` | Member testimonials (fictional, written for this demo) |
| `schedule.html` | **Working client-side booking calendar** — filter by program, browse weeks, click a slot, fill in name/email, get a confirmation. Bookings are held in memory only (reset on page reload) since there's no backend. |
| `workout-plans.html` | Sample weekly program structure per track (Strength Forge / Conditioning Line / Recovery Bay), tabbed view |
| `nutrition.html` | General sample meal plans per track, framed as reference examples with a clear "consult a professional" note — not personalized dietary advice |
| `admin.html` | **Admin dashboard demo** — Overview/Bookings/Members/Content panels with mock data, working search filter, and an "Add Member" form that persists to browser local storage. Not connected to any real database. |

**Live member count:** the homepage "Members training on-site" stat and the admin panel's "Active Members" card both read the same `lavion_admin_members` local storage list. They start at 1,200 (a fixed baseline of 1,192 + the 8 default admin records) and increase by 1 each time you add a member in Admin → Members. This is still browser-local demo data, not a real membership database — but it means the number on the homepage is no longer just hardcoded text; it actually reflects what's in the admin panel.

Membership checkout (on the homepage, "Choose Plan" buttons) opens a 3-step demo flow: plan confirmation → mock payment form → success. No real payment is processed — clearly labeled as a demo throughout.

## What's real vs. demo, one more time
This is built as an **Upwork portfolio piece**, not a live production gym site. Everything *looks and behaves* like a real product — booking, checkout, admin panel — but none of it writes to a real database or processes real payments. That's intentional: it's meant to demonstrate front-end/UX capability, not to run an actual business. If this ever needs to become a real client site, Phases 3–7 from our build plan (real backend, payment processor integration, hosting) still apply.

## Known gaps / next steps if you keep iterating
- New pages (trainers/gallery/testimonials/schedule/admin) are **English only** — the homepage has full 10-language support, but extending i18n to these pages means adding `data-i18n` attributes + new keys in each `assets/i18n/*.json` file.
- Gallery images are styled placeholder blocks with labels — swap in real or licensed stock photos per the instructions further up this README.
- Trainer photos are still empty gradient blocks.
## VERSION 1 
- V.0.1.0.0
- TILL NOW FIVE LAN MADE 
## DEPLOYED
-RENDER because it moslty depends on the backend server so i used render for this.

## LOGIN [ADMIN,MD PASSWORDS]
- ADMIN PASSWORD - 1234
- MD PASSWORD - Praveen@2804
