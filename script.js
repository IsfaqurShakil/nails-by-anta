/* =========================================================
   NAILS BY ANTA — SITE INTERACTIONS
   Vanilla JavaScript; no libraries required.
========================================================= */

(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const WHATSAPP_NUMBER = "8801XXXXXXXXX"; // Replace with Anta's WhatsApp number, digits only.
  const INSTAGRAM_URL = "#";               // Replace with Instagram profile URL.
  const FACEBOOK_URL = "#";                // Replace with Facebook page URL.

  /* Footer year */
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* Mobile navigation */
  const menuToggle = $("#menuToggle");
  const nav = $("#nav");

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      menuToggle.classList.toggle("active", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
      document.body.classList.toggle("menu-open", isOpen);
    });

    $$("a", nav).forEach(link => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        menuToggle.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
        document.body.classList.remove("menu-open");
      });
    });
  }

  /* WhatsApp booking links */
  $$(".whatsapp-link").forEach(link => {
    const message = link.dataset.message || "Hi Anta, I would like to know more.";
    const numberReady = /^\d{8,15}$/.test(WHATSAPP_NUMBER);
    if (numberReady) {
      link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      link.target = "_blank";
      link.rel = "noopener";
    } else {
      link.href = `https://wa.me/?text=${encodeURIComponent(message)}`;
      link.target = "_blank";
      link.rel = "noopener";
      link.addEventListener("click", event => {
        // Opens WhatsApp with the message; the user can choose the contact until number is configured.
      });
    }
  });

  /* Social profile links */
  const instagram = $("#instagramLink");
  const facebook = $("#facebookLink");
  if (instagram && INSTAGRAM_URL !== "#") instagram.href = INSTAGRAM_URL;
  if (facebook && FACEBOOK_URL !== "#") facebook.href = FACEBOOK_URL;

  /* Portfolio filters */
  const filterButtons = $$(".filter-btn");
  const galleryItems = $$(".gallery-item");

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter || "all";
      filterButtons.forEach(item => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });

      galleryItems.forEach(item => {
        const visible = filter === "all" || item.dataset.category === filter;
        item.classList.toggle("hide", !visible);
        item.setAttribute("aria-hidden", String(!visible));
      });
    });
  });

  /* Gallery lightbox — product buttons are intentionally excluded. */
  const lightbox = $("#lightbox");
  const lightboxImage = $("#lightboxImage");
  const lightboxClose = $("#lightboxClose");
  const lightboxPrev = $("#lightboxPrev");
  const lightboxNext = $("#lightboxNext");

  let activeImages = [];
  let activeImageIndex = 0;

  const visibleGalleryButtons = () =>
    $$(".gallery-item.image-open").filter(item => !item.classList.contains("hide"));

 function showLightboxImage(index) {
  if (!activeImages.length || !lightboxImage) return;

  activeImageIndex = (index + activeImages.length) % activeImages.length;

  const item = activeImages[activeImageIndex];
  const thumbnail = $("img", item);

  const src = thumbnail?.currentSrc || thumbnail?.src || item.dataset.image;

  if (src) {
    lightboxImage.src = src;
    lightboxImage.alt = thumbnail?.alt || "Nail design";
  }
}

  function openLightbox(item) {
    if (!lightbox || !lightboxImage) return;
    activeImages = visibleGalleryButtons();
    activeImageIndex = activeImages.indexOf(item);
    if (activeImageIndex < 0) activeImageIndex = 0;
    showLightboxImage(activeImageIndex);
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    lightboxClose?.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    if (lightboxImage) lightboxImage.src = "";
  }

  $$(".gallery-item.image-open").forEach(item => {
    item.addEventListener("click", () => openLightbox(item));
  });

  lightboxClose?.addEventListener("click", closeLightbox);
  lightboxPrev?.addEventListener("click", () => showLightboxImage(activeImageIndex - 1));
  lightboxNext?.addEventListener("click", () => showLightboxImage(activeImageIndex + 1));

  lightbox?.addEventListener("click", event => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", event => {
    if (!lightbox?.classList.contains("open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") showLightboxImage(activeImageIndex - 1);
    if (event.key === "ArrowRight") showLightboxImage(activeImageIndex + 1);
  });

  /* Hero image slider.
     4 slides cross-fade automatically. Each slide uses object-fit: cover (no empty gaps),
     and its framing is controlled by --pos-d (desktop) / --pos-m (mobile) in index.html. */
  const HERO_INTERVAL = 5000; // ms per slide
  const heroSlider = $("#heroSlider");
  const heroSlides = heroSlider ? $$(".hero-slide", heroSlider) : [];
  const heroCounter = $("#heroCounter");
  const pad = n => String(n).padStart(2, "0");

  let heroSlideIndex = 0;
  let heroSlideTimer = null;

  function showHeroSlide(index) {
    heroSlideIndex = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach((slide, i) => slide.classList.toggle("is-active", i === heroSlideIndex));
    if (heroCounter) heroCounter.textContent = `${pad(heroSlideIndex + 1)} — ${pad(heroSlides.length)}`;
  }

  function stopHeroSlider() {
    if (heroSlideTimer) window.clearInterval(heroSlideTimer);
    heroSlideTimer = null;
  }

  function startHeroSlider() {
    stopHeroSlider();
    heroSlideTimer = window.setInterval(() => showHeroSlide(heroSlideIndex + 1), HERO_INTERVAL);
  }

  /* True zoom-out: the photo is drawn at (cover size x zoom) instead of being cropped to fill.
     zoom 1 = fills the frame (old look), 0.8 = shows more of the photo.
     Any space left at the edges is filled by the blurred copy of the same photo (CSS). */
  function layoutHeroImages() {
    if (!heroSlider || !heroSlides.length) return;
    const isMobile = window.matchMedia("(max-width: 850px)").matches;
    const rootStyle = getComputedStyle(heroSlider);
    const zoom = parseFloat(rootStyle.getPropertyValue(isMobile ? "--zoom-m" : "--zoom-d")) || 1;
    const boxW = heroSlider.clientWidth;
    const boxH = heroSlider.clientHeight;
    if (!boxW || !boxH) return;

    heroSlides.forEach(slide => {
      const img = $("img", slide);
      if (!img || !img.naturalWidth) return;

      const slideStyle = getComputedStyle(slide);
      const pos = (slideStyle.getPropertyValue(isMobile ? "--pos-m" : "--pos-d") || "50% 50%").trim().split(/\s+/);
      const px = (parseFloat(pos[0]) || 50) / 100;
      const py = (parseFloat(pos[1]) || 50) / 100;

      const cover = Math.max(boxW / img.naturalWidth, boxH / img.naturalHeight);
      const scale = cover * zoom;
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;

      img.style.setProperty("width", `${w}px`, "important");
      img.style.setProperty("height", `${h}px`, "important");
      img.style.setProperty("left", `${(boxW - w) * px}px`, "important");
      img.style.setProperty("top", `${(boxH - h) * py}px`, "important");
    });
  }

  heroSlides.forEach(slide => {
    const img = $("img", slide);
    if (!img) return;
    if (img.complete) layoutHeroImages();
    else img.addEventListener("load", layoutHeroImages);
  });
  window.addEventListener("resize", layoutHeroImages);
  window.addEventListener("load", layoutHeroImages);

  if (heroSlides.length > 1) {
    showHeroSlide(0);

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      startHeroSlider();
      // Pause while the tab is hidden so slides do not jump when you come back.
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) stopHeroSlider();
        else startHeroSlider();
      });
    }
  }

  /* Scroll reveal: side-to-centre movement with a stagger for cards. */
  const revealGroups = [
    { selector: ".intro-inner, .section-heading > div, .academy-content, .story-content", direction: "left" },
    { selector: ".intro-ornament, .section-heading > .heading-note, .academy-visual, .story-image", direction: "right" },
    { selector: ".service-card, .collection-card, .product-card, .gallery-item, .filter-bar, .shop-note", direction: "bottom" },
    { selector: ".booking > *", direction: "bottom" }
  ];

  const revealElements = [];
  revealGroups.forEach(group => {
    $$(group.selector).forEach((element, index) => {
      if (element.classList.contains("reveal-ready")) return;
      element.classList.add("reveal-ready", `reveal-from-${group.direction}`);
      if (["service-card", "collection-card", "product-card", "gallery-item"].some(c => element.classList.contains(c))) {
        element.style.transitionDelay = `${(index % 4) * 110}ms`;
      }
      revealElements.push(element);
    });
  });

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06, rootMargin: "0px 0px -3% 0px" });

    revealElements.forEach(element => revealObserver.observe(element));
  } else {
    revealElements.forEach(element => element.classList.add("revealed"));
  }

  /* Graceful image fallback: mark missing images so CSS can show their background. */
  $$("img").forEach(image => {
    image.addEventListener("error", () => {
      image.classList.add("image-missing");
      image.setAttribute("data-image-error", "true");
    });
  });

  window.addEventListener("beforeunload", () => {
    if (heroSlideTimer) window.clearInterval(heroSlideTimer);
  });
})();
