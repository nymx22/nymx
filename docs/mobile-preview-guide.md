# Mobile preview shell — look summary and build instructions

This document describes how the **nymx** project implements a desktop “phone preview” of the site, and how to recreate the same pattern in other static or simple web projects.

---

## Summary: how the nymx mobile preview looks

- **Overall:** A dark gray workspace (`#1a1a1a`) centers a single **phone-shaped frame** on the screen. The real site loads **inside** that frame, not full-screen.
- **Frame:** Fixed **375×667 px** (iPhone SE–style logical size), with:
  - **Thick rounded bezel:** ~8px border in `#333`, **25px corner radius**, so it reads like a handset outline.
  - **Notch-style detail:** A small horizontal bar (`60×4px`, `#333`) centered along the **top** edge of the frame, suggesting a speaker / notch area.
  - **Depth:** Soft **box shadow** around the frame so it lifts off the background.
  - **Clip:** `overflow: hidden` so the embedded page does not spill past the rounded corners.
- **Content:** A full-width, full-height **iframe** (no border) loads your entry page (e.g. `index.html`).
- **Below the frame:** A **control strip** with blue buttons (**Reload**, **Toggle Size**) and a caption: *“iPhone SE size (375×667)”*. Toggle switches the frame to **320×568** (smaller phone) and back.
- **Preview page viewport:** The wrapper document uses `<meta name="viewport" content="width=375, initial-scale=1.0">` so the **browser chrome** around the preview behaves like a narrow device when you resize the outer window.

**What it does *not* do:** It does not emulate real iOS/Android WebViews, safe areas, or dynamic viewport units (`dvh`) perfectly—it is a **layout and width** preview, best paired with real device testing for final QA.

---

## Instructions: build a mobile preview for another project

### 1. Decide the target size

- Pick a **logical CSS width/height** (e.g. **375×667** for a common small phone, **390×844** for many modern iPhones, **360×800** for Android-ish).
- Document the size in the UI so teammates know what they are looking at.

### 2. Add a dedicated HTML file at the project root (or a known URL)

- Name it something obvious, e.g. `mobile-preview.html` or `mobile-view-index.html`.
- Keep it **next to** your main entry (e.g. `index.html`) so the iframe `src` can stay a simple relative path.

### 3. Structure the page

1. **Outer layout:** `body` uses flexbox (`display: flex; justify-content: center; align-items: center; min-height: 100vh`) on a neutral dark background so the phone frame sits in the middle of the viewport.
2. **Phone frame:** A wrapper `div` with fixed `width` / `height`, border, `border-radius`, `overflow: hidden`, `position: relative`, and optional `box-shadow`.
3. **Optional “notch”:** A `::before` (or extra `div`) absolutely positioned at the top center for a subtle hardware cue.
4. **iframe:** `width: 100%; height: 100%; border: none; display: block;` pointing at your app’s URL (`src="index.html"` or `src="./dist/index.html"` for a build output).

### 4. Set the preview document’s viewport meta

- On the **wrapper** page (the one with the frame), use a viewport meta that matches your target width, e.g.  
  `width=375, initial-scale=1.0`  
  so the outer page’s scale behavior is consistent when the window is resized.

### 5. Wire the iframe to the correct entry

- **Static site:** `src="index.html"` (or `pages/home.html` if that is your root).
- **SPA after build:** point `src` at the built `index.html` (same origin avoids many iframe restrictions).
- **Different environments:** use query params or a small script to swap `iframe.src` between local/staging URLs if needed.

### 6. Add small utilities (optional but useful)

- **Reload:** Set `iframe.src = iframe.src` (or reassign the same URL) to refresh the embedded app without reloading the preview chrome.
- **Toggle size:** Toggle between two preset `width`/`height` pairs on the frame element for quick “small phone vs. larger phone” checks.
- **Rotate:** Optional button that swaps width and height to simulate landscape (remember: not all sites handle orientation the same as a real device).

### 7. Same-origin and security notes

- The iframe should load a page from the **same origin** as the preview file when possible (local server or deployed host). That avoids **X-Frame-Options** / **CSP `frame-ancestors`** blocking the embed.
- If the app sets `X-Frame-Options: DENY` or a restrictive CSP, the preview will show a blank frame—relax those for dev or use a dev-only preview route.

### 8. Run from a local server

- Open the preview via **http://localhost** (e.g. `npx serve`, `python -m http.server`), not only `file://`, so module scripts, fetch, and service workers behave closer to production.

### 9. Keep real breakpoints in the actual app

- The preview only constrains **width/height inside the iframe**. Your app should still use **`meta viewport`** on the **real** pages and **CSS media queries** (`max-width`, `orientation`, etc.) so layout matches what users see on phones.
- Test on a physical device or browser devtools device mode in addition to this iframe shell.

### 10. Checklist before you ship

- [ ] Preview HTML lives where `iframe` `src` resolves correctly.
- [ ] Frame dimensions match the device class you document in the UI.
- [ ] Site root page loads inside the iframe on your dev server.
- [ ] No console errors from blocked iframe or mixed content (HTTPS parent vs HTTP child).
- [ ] Touch and hover: remember desktop mouse events still apply unless you enable device emulation in devtools.

---

## Reference: nymx implementation

| Piece | Location |
|--------|-----------|
| Preview page | `mobile-view-index.html` (project root) |
| iframe target | `index.html` |
| Default size | 375×667 px; toggle to 320×568 px |

Copy that file into another repo, change `iframe` `src`, colors, and dimensions to match your project’s entry and branding.
