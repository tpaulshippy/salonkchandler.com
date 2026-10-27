# Salon K — static site on Cloudflare Workers

Static replica of [salonkchandler.com](https://salonkchandler.com) (formerly WordPress + Divi).
No WordPress, no PHP, no database, no build step. Deploy target: **Cloudflare Workers Static Assets**.

## Structure

```
public/                    # everything served (wrangler [assets] directory)
  index.html               # Home (hero, contact band, quote, about, Vimeo, My Promise)
  meet-kelley/index.html
  social-media-gallery/index.html   # "Gallery" nav item
  products/index.html
  services/index.html
  payment-plans/index.html          # Cherry widget embed
  blogreviews/index.html            # 10 baked-in reviews
  404.html
  assets/css/style.css     # single stylesheet for the whole site
  assets/js/main.js        # mobile nav + footer year only
  assets/img/              # all display images vendored locally
src/worker.js              # tiny Worker: legacy redirects + security/cache headers
wrangler.toml              # Workers Static Assets config
```

## Deploy

```bash
npx wrangler login
npx wrangler deploy
# custom domain:
npx wrangler domains add salonkchandler.com
```

Preview locally without an account:

```bash
npx wrangler dev
# or: python3 -m http.server -d public 8000
```

## Backend features found on the live site — and how the static version handles them

| Live feature | Tech on WordPress | Static handling — **no backend needed** |
|---|---|---|
| Booking / consultation forms | External **JotForm** links (`form.jotform.com/261500575913152`, `…/221646044568055`) | Kept as-is; all CTA buttons link straight to JotForm (it hosts the form + emails). |
| Payment Plans page | **Cherry** widget (`files.withcherry.com/widgets/widget.js`, slug `salon-k`) | Same third-party `<script>` embed copied into `payment-plans/`; runs 100% client-side. `noscript` fallback lists the phone number. |
| Gallery / social feed | **Smash Balloon Instagram Feed** plugin (needs WP `admin-ajax.php` + Meta API token server-side) | Replaced with a static snapshot: 20 tiles linking to the live Instagram posts/reels + Follow button. Refresh tiles manually when the feed changes. No token to rotate, nothing to expire. |
| Blog / Reviews | WordPress posts under `/blog/…` | All 10 reviews baked into `blogreviews/` as plain HTML. New reviews = edit the file. |
| Hair Replacement nav item | External site `salonk.replicascalp.com` | External link, unchanged. |
| Maps, Facebook, Instagram, Goldie Locks affiliate link | External links | Unchanged (`target="_blank" rel="noopener"`). |
| Homepage video | Vimeo embed (`player.vimeo.com/video/167006051`) | Same iframe embed. |
| Search, comments, accounts, cart | None on the live site | Nothing to replace. |

Net: **zero first-party backend required.** The only servers involved at runtime are
third parties the browser talks to directly (JotForm, Cherry, Vimeo, Google Fonts,
Instagram/Facebook). If those embeds ever need secrets, add them as Worker
`[vars]` — no such need today.

## Redirects (src/worker.js)

- `/gallery` and `/gallery/` → `/social-media-gallery/` (old WP page slug still indexed)
- `/skwp/*` → `/` (legacy upload paths referenced around the web)

## Notes / known diffs from WordPress

- Logos/images load from the site's own `/wp-content/uploads/…` URLs (verified
  in a real browser). An older cached copy of the pages referenced a dead
  staging host (`salonk.tpaulshippy.com`, NXDOMAIN) — those URLs are not used
  by the live pages and are not referenced here.
- The `…/CJ-Academy-…webp` URL on the Products page currently serves a
  “Replica Scalp Professional System” logo; it is vendored as
  `replica-scalp.webp`.
- Meet Kelley contains a photo parallax band (`SalonK-12.jpg`, salon interior).
  On the WordPress site it renders as a blank white gap because the background
  URL is hard-coded `http://` and browsers block it as mixed content on the
  `https://` page. The static replica serves the photo locally, so the band
  displays as originally designed — the one intentional visual difference.
- Divi/Elegant-Themes footer credit kept to match the original footer.
- `SalonK-1.jpg` / `SalonK-39.jpg` / `SalonK-12.jpg` hero photos vendored
  locally (run them through an optimizer before deploy if you want smaller
  uploads).
