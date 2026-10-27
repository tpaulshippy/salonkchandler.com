// Mobile nav, footer year, featured-reviews slider. No backend, no tracking.
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".menu-btn");
  const navs = document.querySelector(".site-header .navs");
  if (btn && navs) {
    btn.addEventListener("click", () => {
      navs.classList.toggle("open");
      btn.setAttribute(
        "aria-expanded",
        navs.classList.contains("open") ? "true" : "false",
      );
    });
  }
  const hdr = document.querySelector(".site-header");
  if (hdr) {
    const onScroll = () =>
      hdr.classList.toggle("compact", window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
  const cue = document.querySelector(".scroll-cue");
  if (cue) {
    cue.addEventListener("click", (e) => {
      // Mobile shows the alternate contact band (mirrors Divi row_1).
      if (window.innerWidth <= 980) {
        const m = document.getElementById("visit-m");
        if (m) {
          e.preventDefault();
          m.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  }
  const y = document.getElementById("yr");
  if (y) y.textContent = new Date().getFullYear();

  // Featured reviews slider (Blog/Reviews page only).
  const slider = document.querySelector(".slider");
  if (slider) {
    const slides = [...slider.querySelectorAll(".slide")];
    const dotsBox = slider.querySelector(".dots");
    let cur = 0;
    let timer = null;
    const show = (i) => {
      cur = (i + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle("active", k === cur));
      if (dotsBox) {
        [...dotsBox.children].forEach((d, k) =>
          d.classList.toggle("on", k === cur),
        );
      }
    };
    if (dotsBox) {
      slides.forEach((_, k) => {
        const d = document.createElement("button");
        d.setAttribute("aria-label", "Show review " + (k + 1));
        d.addEventListener("click", () => {
          show(k);
          restart();
        });
        dotsBox.appendChild(d);
      });
    }
    const restart = () => {
      if (timer) clearInterval(timer);
      timer = setInterval(() => show(cur + 1), 6000);
    };
    show(0);
    restart();
  }
});

  // Review "read more" expander (Blog/Reviews grid).
  document.querySelectorAll(".more-toggle").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const card = a.closest("article");
      const full = card && card.querySelector(".full");
      if (full && (full.hidden || a.textContent === "read less")) {
        full.hidden = !full.hidden;
        a.textContent = full.hidden ? "read more" : "read less";
      } else if (card) {
        card.classList.toggle("collapsed");
      }
    });
  });
