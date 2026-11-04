/**
 * Salon K static site worker (Cloudflare Workers Static Assets).
 * Serves ./public via the ASSETS binding, with:
 *  - legacy /gallery/ -> /social-media-gallery/ redirect (old WP page)
 *  - security + cache headers
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Live Instagram feed proxy. The access token lives only in the
    // encrypted IG_ACCESS_TOKEN worker secret — never in browser code.
    // Response cached at the edge for 1h; the gallery page keeps its
    // baked-in snapshot as fallback when this is unreachable.
    if (url.pathname === "/api/instagram") {
      const token = env.IG_ACCESS_TOKEN;
      if (!token) {
        return Response.json({ error: "not configured" }, { status: 500 });
      }
      const cache = caches.default;
      const after = url.searchParams.get("after") || "";
      const cacheKey = new Request(url.origin + "/api/instagram" + (after ? "?after=" + after : ""), {
        method: "GET",
      });
      let res = await cache.match(cacheKey);
      if (!res) {
        let api =
          "https://graph.facebook.com/v26.0/17841403164044702/media" +
          "?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp" +
          "&limit=20&access_token=" +
          encodeURIComponent(token);
        if (after && /^[A-Za-z0-9_-]+$/.test(after)) {
          api += "&after=" + after;
        }
        const r = await fetch(api);
        if (!r.ok) {
          return Response.json({ error: "upstream" }, { status: 502 });
        }
        const j = await r.json();
        const items = (j.data || []).map((it) => ({
          id: it.id,
          type: it.media_type,
          permalink: it.permalink,
          caption: it.caption || "",
          timestamp: it.timestamp || "",
          image:
            it.media_type === "VIDEO"
              ? it.thumbnail_url || it.media_url
              : it.media_url,
        }));
        // Paging cursor only — the access token never leaves the worker.
        let nextAfter = null;
        try {
          const nextUrl =
            j.paging && j.paging.cursors && j.paging.cursors.after;
          if (typeof nextUrl === "string" && nextUrl) nextAfter = nextUrl;
        } catch (e) {
          nextAfter = null;
        }
        res = Response.json(
          { items, nextAfter, updated: new Date().toISOString() },
          {
            headers: {
              "Cache-Control": "public, max-age=300",
              "Access-Control-Allow-Origin": "*",
            },
          },
        );
        ctx.waitUntil(
          cache.put(
            cacheKey,
            new Response(
              JSON.stringify({
                items,
                nextAfter,
                updated: new Date().toISOString(),
              }),
              {
                headers: {
                  "Content-Type": "application/json",
                  "Cache-Control": "public, max-age=3600",
                },
              },
            ),
          ),
        );
      }
      return res;
    }

    // Legacy WordPress gallery slug still indexed in search results.
    if (url.pathname === "/gallery" || url.pathname === "/gallery/") {
      return Response.redirect(new URL("/social-media-gallery/", url).toString(), 301);
    }
    // Retired WordPress routes (no WP backend on this static port).
    if (
      url.pathname.startsWith("/skwp/") ||
      url.pathname.startsWith("/wp-admin") ||
      url.pathname.startsWith("/wp-login") ||
      url.pathname.startsWith("/wp-content/uploads/") ||
      url.pathname === "/xmlrpc.php" ||
      url.pathname === "/feed" ||
      url.pathname === "/feed/" ||
      url.pathname.startsWith("/comments/feed")
    ) {
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
    // Versioned local assets (style.css?v=N): cache 1h so redesigns roll out
    // promptly; unversioned URLs stay immutable-friendly.
    if (url.pathname.startsWith("/assets/")) {
      headers.set("Cache-Control", "public, max-age=3600");
    }
    return new Response(res.body, { status: res.status, headers });
  },
};
