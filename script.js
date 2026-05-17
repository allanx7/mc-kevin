const navbar = document.getElementById("navbar");
const revealItems = document.querySelectorAll(".reveal");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

function handleNavbarState() {
  if (window.scrollY > 30) {
    navbar.classList.add("scrolled");
    return;
  }
  navbar.classList.remove("scrolled");
}

window.addEventListener("scroll", handleNavbarState);
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
    rootMargin: "0px 0px -40px 0px",
  }
);

revealItems.forEach((item) => {
  revealObserver.observe(item);
});

if (window.lucide) {
  window.lucide.createIcons();
}
