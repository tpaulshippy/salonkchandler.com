/**
 * Salon K static site worker (Cloudflare Workers Static Assets).
 * Serves ./public via the ASSETS binding, with:
 *  - legacy /gallery/ -> /social-media-gallery/ redirect (old WP page)
 *  - security + cache headers
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Legacy WordPress gallery slug still indexed in search results.
    if (url.pathname === "/gallery" || url.pathname === "/gallery/") {
      return Response.redirect(new URL("/social-media-gallery/", url).toString(), 301);
    }
    // Old /skwp/* upload URLs referenced across the web: send to homepage.
    // (All display assets are bundled locally under /assets/img/.)
    if (url.pathname.startsWith("/skwp/")) {
      return Response.redirect(new URL("/", url).toString(), 301);
    }

    const res = await env.ASSETS.fetch(request);

    // Add headers to HTML responses.
    const ct = res.headers.get("content-type") || "";
    const headers = new Headers(res.headers);
    if (ct.includes("text/html")) {
      headers.set("X-Content-Type-Options", "nosniff");
      headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
      headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    }
    // Long-cache immutable local assets.
    if (url.pathname.startsWith("/assets/")) {
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
    }
    return new Response(res.body, { status: res.status, headers });
  },
};
