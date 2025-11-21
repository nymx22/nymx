# Static Cloudflare Pages Starter

Minimal static layout ready for deployment on Cloudflare Pages.

## Structure
- `index.html` serves at `/`.
- `pages/` mirrors additional entrypoints (`about`, `work`, `archive`).
- `style/` contains reset, variables, and main stylesheets.
- `js/` is modularized into `main.js`, `ui/desktop.js`, and reusable modules under `lib/`.
- `assets/` holds `images/`, `icons/`, `fonts/`, and `video/` for static content.

## Deployment
Drop this folder into Cloudflare Pages and leave the build settings empty (root directory). All files are static, so no bundler or package manager is required.
