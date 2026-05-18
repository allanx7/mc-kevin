const navbar = document.getElementById("navbar");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const revealItems = document.querySelectorAll(".reveal");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let lastScrollY = window.scrollY;

function handleNavbarState() {
  if (!navbar) {
    return;
  }

  const currentY = window.scrollY;
  navbar.classList.toggle("scrolled", currentY > 24);

  // Esconde no scroll para baixo e mostra ao subir, criando dinamica de clipe.
  if (currentY > lastScrollY + 8 && currentY > 140 && !navbar.classList.contains("open")) {
    navbar.classList.add("hide");
  } else if (currentY < lastScrollY - 8 || currentY <= 60) {
    navbar.classList.remove("hide");
  }

  lastScrollY = currentY;
}

window.addEventListener("scroll", handleNavbarState, { passive: true });
handleNavbarState();

if (menuToggle && navLinks && navbar) {
  const MOBILE_BREAKPOINT = 760;

  function setMenuState(isOpen) {
    navbar.classList.toggle("open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
  }

  function closeMenu() {
    setMenuState(false);
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = !navbar.classList.contains("open");
    setMenuState(isOpen);
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    if (window.innerWidth > MOBILE_BREAKPOINT) {
      return;
    }
    if (!navbar.contains(event.target)) {
      closeMenu();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > MOBILE_BREAKPOINT) {
      closeMenu();
    }
  });

  setMenuState(false);
}

// Scroll suave com foco no destino para acessibilidade.
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") {
      return;
    }

    const targetElement = document.querySelector(targetId);
    if (!targetElement) {
      return;
    }

    event.preventDefault();
    targetElement.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });

    if (targetElement instanceof HTMLElement) {
      targetElement.setAttribute("tabindex", "-1");
      targetElement.focus({ preventScroll: true });
    }
  });
});

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.2,
    rootMargin: "0px 0px -60px 0px",
  }
);

revealItems.forEach((item) => {
  revealObserver.observe(item);
});

const mouseGlow = document.querySelector(".mouse-glow");

if (mouseGlow && window.matchMedia("(pointer: fine)").matches && !prefersReducedMotion) {
  let nextX = window.innerWidth / 2;
  let nextY = window.innerHeight / 2;
  let rafId = null;

  function drawGlow() {
    document.documentElement.style.setProperty("--mouse-x", `${nextX}px`);
    document.documentElement.style.setProperty("--mouse-y", `${nextY}px`);
    mouseGlow.style.opacity = "1";
    rafId = null;
  }

  window.addEventListener(
    "pointermove",
    (event) => {
      nextX = event.clientX;
      nextY = event.clientY;

      if (rafId) {
        return;
      }
      rafId = window.requestAnimationFrame(drawGlow);
    },
    { passive: true }
  );

  window.addEventListener("pointerleave", () => {
    mouseGlow.style.opacity = "0";
  });

  window.addEventListener("pointerenter", () => {
    mouseGlow.style.opacity = "1";
  });
} else if (mouseGlow) {
  mouseGlow.remove();
}

const bannerSection = document.querySelector(".cinematic-banner");
const bannerImage = document.querySelector(".banner-image");

if (bannerSection && bannerImage && !prefersReducedMotion) {
  let parallaxTicking = false;

  function updateBannerParallax() {
    const rect = bannerSection.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const bannerCenter = rect.top + rect.height / 2;
    const distanceToCenter = bannerCenter - viewportCenter;
    const shift = Math.max(-34, Math.min(34, distanceToCenter * -0.08));

    bannerImage.style.setProperty("--banner-shift", `${shift}px`);
    parallaxTicking = false;
  }

  function scheduleParallax() {
    if (parallaxTicking) {
      return;
    }

    parallaxTicking = true;
    window.requestAnimationFrame(updateBannerParallax);
  }

  window.addEventListener("scroll", scheduleParallax, { passive: true });
  window.addEventListener("resize", scheduleParallax);
  scheduleParallax();
}

const galleryTrack = document.getElementById("galleryTrack");
const galleryDots = document.getElementById("galleryDots");
const galleryProgress = document.querySelector(".gallery-progress span");
const galleryControls = document.querySelectorAll("[data-gallery-nav]");

if (galleryTrack) {
  const slides = Array.from(galleryTrack.querySelectorAll(".photo-slide"));
  let activeIndex = 0;
  let scrollRafId = null;
  let autoplayId = null;

  function clampIndex(index) {
    return Math.max(0, Math.min(index, slides.length - 1));
  }

  function setActiveSlide(index) {
    activeIndex = clampIndex(index);

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.toggleAttribute("aria-current", isActive);
    });

    if (galleryDots) {
      galleryDots.querySelectorAll(".gallery-dot").forEach((dot, dotIndex) => {
        const isActive = dotIndex === activeIndex;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-pressed", String(isActive));
      });
    }

    if (galleryProgress) {
      const progress = slides.length > 0 ? ((activeIndex + 1) / slides.length) * 100 : 0;
      galleryProgress.style.width = `${progress}%`;
    }

    galleryControls.forEach((control) => {
      const direction = Number(control.dataset.galleryNav);
      control.disabled = direction < 0 ? activeIndex === 0 : activeIndex === slides.length - 1;
    });
  }

  function getClosestSlideIndex() {
    const trackRect = galleryTrack.getBoundingClientRect();
    const centerPoint = trackRect.left + trackRect.width / 2;
    let closestIndex = 0;
    let shortestDistance = Number.POSITIVE_INFINITY;

    slides.forEach((slide, index) => {
      const rect = slide.getBoundingClientRect();
      const slideCenter = rect.left + rect.width / 2;
      const distance = Math.abs(centerPoint - slideCenter);

      if (distance < shortestDistance) {
        shortestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  }

  function scrollToSlide(index, behavior = "smooth") {
    const safeIndex = clampIndex(index);
    const targetSlide = slides[safeIndex];
    if (!targetSlide) {
      return;
    }

    // Usa scroll horizontal manual para evitar que o navegador ajuste o eixo Y.
    const centeredLeft = targetSlide.offsetLeft - (galleryTrack.clientWidth - targetSlide.clientWidth) / 2;
    const maxLeft = galleryTrack.scrollWidth - galleryTrack.clientWidth;
    const clampedLeft = Math.max(0, Math.min(centeredLeft, maxLeft));

    galleryTrack.scrollTo({
      left: clampedLeft,
      behavior: prefersReducedMotion ? "auto" : behavior,
    });

    setActiveSlide(safeIndex);
  }

  function stopAutoplay() {
    if (!autoplayId) {
      return;
    }

    window.clearInterval(autoplayId);
    autoplayId = null;
  }

  function startAutoplay() {
    if (prefersReducedMotion || slides.length < 2 || autoplayId) {
      return;
    }

    autoplayId = window.setInterval(() => {
      const nextIndex = activeIndex >= slides.length - 1 ? 0 : activeIndex + 1;
      scrollToSlide(nextIndex);
    }, 5600);
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  function handleTrackScroll() {
    if (scrollRafId) {
      return;
    }

    scrollRafId = window.requestAnimationFrame(() => {
      setActiveSlide(getClosestSlideIndex());
      scrollRafId = null;
    });
  }

  if (galleryDots) {
    galleryDots.textContent = "";

    slides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "gallery-dot";
      dot.setAttribute("aria-label", `Ir para foto ${index + 1}`);
      dot.setAttribute("aria-pressed", "false");
      dot.addEventListener("click", () => {
        scrollToSlide(index);
        resetAutoplay();
      });
      galleryDots.appendChild(dot);
    });
  }

  galleryControls.forEach((control) => {
    control.addEventListener("click", () => {
      const direction = Number(control.dataset.galleryNav);
      scrollToSlide(activeIndex + direction);
      resetAutoplay();
    });
  });

  galleryTrack.addEventListener("scroll", handleTrackScroll, { passive: true });

  galleryTrack.addEventListener(
    "wheel",
    (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
        return;
      }

      event.preventDefault();
      galleryTrack.scrollBy({
        left: event.deltaY,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    },
    { passive: false }
  );

  galleryTrack.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }

    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    scrollToSlide(activeIndex + direction);
    resetAutoplay();
  });

  galleryTrack.addEventListener("pointerdown", stopAutoplay);
  galleryTrack.addEventListener("mouseenter", stopAutoplay);
  galleryTrack.addEventListener("mouseleave", startAutoplay);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoplay();
      return;
    }

    startAutoplay();
  });

  window.addEventListener("resize", () => {
    setActiveSlide(getClosestSlideIndex());
  });

  setActiveSlide(0);
  startAutoplay();
}
