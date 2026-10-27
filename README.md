# Salon K — static port on Cloudflare Workers

Direct static port of [salonkchandler.com](https://salonkchandler.com)
(WordPress + Divi). Same rendered HTML/CSS/JS, vendored locally — no
WordPress, no PHP, no database, no build step. Deploy target:
**Cloudflare Workers Static Assets**.

## Structure

```
public/                    # everything served (wrangler [assets] directory)
  index.html               # Home (verbatim rendered HTML)
  meet-kelley/index.html
  social-media-gallery/index.html   # "Gallery" nav item
  products/index.html
  services/index.html
  payment-plans/index.html          # Cherry widget embed (third-party, unchanged)
  blogreviews/index.html            # featured slider + review grid
  blog/2016/.../           # 10 review posts (read-more targets, all ported)
  404.html
  robots.txt
  assets/vendor/           # Divi theme CSS/JS, jQuery, ETmodules fonts,
                           # all images, IG feed cache — copied from the live
                           # site and referenced relatively. No hotlinking.
src/worker.js              # tiny Worker: legacy redirects + security/cache headers
wrangler.toml              # Workers Static Assets config
```

## Deploy

```bash
npx wrangler login
npx wrangler deploy
```

Preview locally without an account:

```bash
npx wrangler dev
# or: python3 -m http.server -d public 8000
```

## What was changed vs the live HTML

Almost nothing — that is the point. Mechanical transforms only:

- Same-origin CSS/JS/image/font URLs rewritten to `/assets/vendor/…`.
- Dead staging `src` attributes (`salonk.tpaulshippy.com`, NXDOMAIN) pointed at
  the live `srcset` equivalent, vendored locally. Browsers used `srcset`
  anyway; this fixes non-srcset clients.
- Dead staging parallax URL (`kevinmurphy-…jpg` on the gift band) left as-is:
  it 404s on the live site too (band renders flat purple on both).
- Third-party embeds untouched: JotForm booking links, Cherry payment widget,
  Vimeo video, Google Fonts, Instagram/Facebook outbound links, Goldie Locks
  affiliate link.
- Removed dead WordPress head cruft: pingback, RSD, wlwmanifest, shortlink,
  oEmbed discovery, speculation-rules (they only prefetched WP routes).
- Footer service links (`/skwp/services…`) rewritten to `/services/`
  (the `/skwp/` path dies with WordPress).
- The Instagram feed is the server-rendered snapshot baked into the page
  (same as any visitor sees); the live-update AJAX has no backend here.
  Refresh the snapshot by re-running the port when the feed changes.

## Redirects (src/worker.js)

- `/gallery` and `/gallery/` → `/social-media-gallery/`
- `/skwp/*`, `/wp-admin*`, `/wp-login*`, `/wp-content/uploads/*`,
  `/xmlrpc.php`, `/feed*`, `/comments/feed*` → `/`

## Backend features

None required. Booking = JotForm, financing = Cherry widget, video = Vimeo —
all third-party embeds that run client-side. See git history for the earlier
hand-built attempt and why the verbatim port replaced it.
