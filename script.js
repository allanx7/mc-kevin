const navbar = document.getElementById("navbar");
const revealItems = document.querySelectorAll(".reveal");

function handleNavbarState() {
  if (window.scrollY > 30) {
    navbar.classList.add("scrolled");
    return;
  }
  navbar.classList.remove("scrolled");
}

window.addEventListener("scroll", handleNavbarState);
handleNavbarState();

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
