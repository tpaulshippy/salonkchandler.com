// Gallery feed: renders snapshot instantly, replaces with live data from
// /api/instagram when reachable. Load More appends the next page.
(function () {
  var grid, moreBtn, afterCursor, liveOk;

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
    return a;
  }

  function render(items, append) {
    if (!append) grid.innerHTML = "";
    items.forEach(function (it) {
      if (it.image || it.img) grid.appendChild(tile(it));
    });
  }

  function loadMore() {
    if (!liveOk || !afterCursor) {
      moreBtn.hidden = true;
      return;
    }
    moreBtn.disabled = true;
    var url = "/api/instagram" + (afterCursor ? "?after=" + encodeURIComponent(afterCursor) : "");
    fetch(url, { headers: { Accept: "application/json" } })
      .then(function (r) {
        if (!r.ok) throw new Error("feed " + r.status);
        return r.json();
      })
      .then(function (d) {
        if (!d.items || !d.items.length) throw new Error("empty");
        if (!afterCursor) grid.innerHTML = "";
        render(d.items, true);
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
    // Instant paint from baked-in snapshot.
    if (window.IG_SNAPSHOT && window.IG_SNAPSHOT.length) {
      render(window.IG_SNAPSHOT, false);
    }
    moreBtn.addEventListener("click", loadMore);
    // Upgrade to live data in the background.
    fetch("/api/instagram", { headers: { Accept: "application/json" } })
      .then(function (r) {
        if (!r.ok) throw new Error("feed " + r.status);
        return r.json();
      })
      .then(function (d) {
        if (!d.items || !d.items.length) return;
        afterCursor = null;
        liveOk = true;
        render(d.items, false);
        moreBtn.hidden = !d.nextAfter;
        afterCursor = d.nextAfter || null;
      })
      .catch(function () {
        moreBtn.hidden = true; // snapshot is all there is
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
