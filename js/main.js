(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const hero = document.querySelector(".hero");
  const video = document.querySelector("#heroVideo");
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const conserveData = Boolean(connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || ""));

  document.documentElement.classList.add("js");

  const showAll = () => {
    document.querySelectorAll(".reveal").forEach((item) => item.classList.add("is-visible"));
  };

  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    showAll();
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));
  }

  if (video && hero && !reduceMotion.matches && !conserveData) {
    video.addEventListener("error", () => hero.classList.add("video-fallback"), { once: true });
    video.play().catch(() => {
      /* The poster remains visible when a browser blocks decorative autoplay. */
    });
  }

  const lazyVideos = [...document.querySelectorAll("[data-lazy-video]")];

  const loadVideo = (item) => {
    if (item.dataset.loaded === "true") return;
    item.querySelectorAll("source[data-src]").forEach((source) => {
      source.src = source.dataset.src;
      source.removeAttribute("data-src");
    });
    item.dataset.loaded = "true";
    item.load();
  };

  if (!reduceMotion.matches && !conserveData && lazyVideos.length) {
    if ("IntersectionObserver" in window) {
      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const item = entry.target;
          if (entry.isIntersecting) {
            loadVideo(item);
            item.play().catch(() => {});
          } else {
            item.pause();
          }
        });
      }, { rootMargin: "240px 0px", threshold: 0.01 });
      lazyVideos.forEach((item) => videoObserver.observe(item));
    } else {
      lazyVideos.forEach((item) => loadVideo(item));
    }
  }

  reduceMotion.addEventListener?.("change", (event) => {
    if (event.matches) {
      showAll();
      if (video) {
        video.pause();
        video.removeAttribute("src");
        video.querySelectorAll("source").forEach((source) => source.removeAttribute("src"));
        video.load();
      }
      lazyVideos.forEach((item) => {
        item.pause();
        item.querySelectorAll("source").forEach((source) => source.removeAttribute("src"));
        item.load();
      });
    }
  });

  document.querySelectorAll(".mobile-nav a").forEach((link) => {
    link.addEventListener("click", () => link.closest("details")?.removeAttribute("open"));
  });
})();
