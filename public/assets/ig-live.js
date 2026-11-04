// Gallery feed: instant skeleton paint, then live data from /api/instagram.
// A localStorage copy of the last live response paints instantly on repeat
// visits (no visible swap); baked-in snapshot is the offline fallback.
(function () {
  var grid, moreBtn, afterCursor, liveOk;
  var LS_KEY = "ig-feed-v1";
  var LS_TTL = 12 * 3600 * 1000;

  function tile(it) {
    var a = document.createElement("a");
    a.className = "ig-cell";
    a.href = it.permalink || it.href;
    a.target = "_blank";
    a.rel = "noopener";
    var img = document.createElement("img");
    img.src = it.image || it.img;
    img.alt = (it.caption || "Salon K on Instagram").slice(0, 120);
    img.loading = "lazy";
    a.appendChild(img);
    if (it.type === "VIDEO" || it.video) {
      var play = document.createElement("span");
      play.className = "ig-play";
      a.appendChild(play);
    }
    if (it.caption) {
      var cap = document.createElement("span");
      cap.className = "ig-cap";
      cap.textContent = it.caption;
      a.appendChild(cap);
    }
    a.dataset.iid = it.id || it.href;
    return a;
  }

  function render(items, append) {
    if (!append) grid.innerHTML = "";
    items.forEach(function (it) {
      if (it.image || it.img) grid.appendChild(tile(it));
    });
  }

  function skeletons(n) {
    grid.innerHTML = "";
    for (var i = 0; i < (n || 8); i++) {
      var d = document.createElement("div");
      d.className = "ig-cell ig-sk";
      grid.appendChild(d);
    }
  }

  function readCache() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (!raw) return null;
      var d = JSON.parse(raw);
      if (!d || !d.items || !d.items.length) return null;
      if (Date.now() - d.ts > LS_TTL) return null;
      return d;
    } catch (e) {
      return null;
    }
  }

  function writeCache(d) {
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({ ts: Date.now(), items: d.items, nextAfter: d.nextAfter || null }),
      );
    } catch (e) {
      /* storage unavailable */
    }
  }

  function firstId(items) {
    return items && items.length ? items[0].id || items[0].href : null;
  }

  function loadLive(silent) {
    return fetch("/api/instagram", { headers: { Accept: "application/json" } })
      .then(function (r) {
        if (!r.ok) throw new Error("feed " + r.status);
        return r.json();
      })
      .then(function (d) {
        if (!d.items || !d.items.length) throw new Error("empty");
        liveOk = true;
        afterCursor = d.nextAfter || null;
        writeCache(d);
        if (silent) {
          // Only repaint when the feed head actually moved.
          var cur = grid.querySelector(".ig-cell");
          var curId = cur && (cur.dataset.iid || cur.href);
          if (curId && curId === firstId(d.items)) {
            moreBtn.hidden = !afterCursor;
            return;
          }
        }
        render(d.items, false);
        moreBtn.hidden = !afterCursor;
      });
  }

  function loadMore() {
    if (!liveOk || !afterCursor) {
      moreBtn.hidden = true;
      return;
    }
    moreBtn.disabled = true;
    fetch("/api/instagram?after=" + encodeURIComponent(afterCursor), {
      headers: { Accept: "application/json" },
    })
      .then(function (r) {
        if (!r.ok) throw new Error("feed " + r.status);
        return r.json();
      })
      .then(function (d) {
        render(d.items || [], true);
        afterCursor = d.nextAfter || null;
        moreBtn.hidden = !afterCursor;
        moreBtn.disabled = false;
      })
      .catch(function () {
        moreBtn.disabled = false;
      });
  }

  function init() {
    grid = document.getElementById("ig-grid");
    moreBtn = document.getElementById("ig-more");
    if (!grid || !moreBtn) return;
    moreBtn.addEventListener("click", loadMore);
    var cached = readCache();
    if (cached) {
      // Instant paint, no swap: revalidate quietly afterwards.
      render(cached.items, false);
      afterCursor = cached.nextAfter || null;
      liveOk = true;
      moreBtn.hidden = !afterCursor;
      loadLive(true).catch(function () {});
    } else {
      skeletons(8);
      loadLive(false).catch(function () {
        // Offline fallback: baked-in snapshot, no live paging.
        liveOk = false;
        if (window.IG_SNAPSHOT && window.IG_SNAPSHOT.length) {
          render(window.IG_SNAPSHOT, false);
        }
        moreBtn.hidden = true;
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
