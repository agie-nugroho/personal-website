import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

/* ------------------------------------------------------------------
   Theme
------------------------------------------------------------------ */
const root = document.documentElement;
const themeToggle = document.querySelector<HTMLButtonElement>("#theme-toggle");

function syncThemeState() {
  const isDark = root.classList.contains("dark");
  themeToggle?.setAttribute("aria-pressed", String(isDark));
  themeToggle?.setAttribute(
    "aria-label",
    isDark ? "Switch to light theme" : "Switch to dark theme",
  );
}

themeToggle?.addEventListener("click", () => {
  const isDark = !root.classList.contains("dark");
  root.classList.toggle("dark", isDark);
  try {
    localStorage.setItem("theme", isDark ? "dark" : "light");
  } catch {
    /* private mode: theme just won't persist */
  }
  syncThemeState();
});

syncThemeState();

/* ------------------------------------------------------------------
   Smooth scrolling (Lenis drives GSAP's ticker; native fallback)
------------------------------------------------------------------ */
let lenis: Lenis | null = null;

// Lenis stays on even when the OS asks for reduced motion: passive wheel
// smoothing is switched off there, but scrolls the visitor explicitly asks for
// (clicking a nav link or the back-to-top button) still glide instead of
// jumping. Reveal and counter animations stay off for reduced motion below.
lenis = new Lenis({
  duration: 1.05,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: !prefersReducedMotion,
  // Lenis forces every programmatic scrollTo to be instant while the OS asks
  // for reduced motion; keep that decision ours so button/anchor clicks glide.
  respectReducedMotion: false,
  touchMultiplier: 1.4,
});

lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis?.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/* ------------------------------------------------------------------
   Header, progress bar, active section and back-to-top
------------------------------------------------------------------ */
const header = document.getElementById("site-header");
const progressBar = document.getElementById("scroll-progress");
const backToTop = document.querySelector<HTMLButtonElement>("#back-to-top");
const navLinks = Array.from(
  document.querySelectorAll<HTMLAnchorElement>("[data-nav-link]"),
);
const sections = Array.from(
  document.querySelectorAll<HTMLElement>("[data-section]"),
);

function onScroll() {
  const scrollY = window.scrollY;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;

  header?.classList.toggle("is-scrolled", scrollY > 8);

  if (progressBar) {
    const ratio = scrollable > 0 ? Math.min(scrollY / scrollable, 1) : 0;
    progressBar.style.transform = `scaleX(${ratio})`;
  }

  const showBackToTop = scrollY > 640;
  if (backToTop) {
    backToTop.classList.toggle("opacity-0", !showBackToTop);
    backToTop.classList.toggle("translate-y-3", !showBackToTop);
    backToTop.classList.toggle("pointer-events-none", !showBackToTop);
    backToTop.setAttribute("aria-hidden", String(!showBackToTop));
    backToTop.tabIndex = showBackToTop ? 0 : -1;
  }

  let activeId = "";
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= 140) activeId = section.id;
  }

  navLinks.forEach((link) => {
    const isActive = link.dataset.navLink === activeId;
    link.classList.toggle("is-active", isActive);
    if (isActive) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });
}

let scrollTicking = false;
window.addEventListener(
  "scroll",
  () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      onScroll();
      scrollTicking = false;
    });
  },
  { passive: true },
);
window.addEventListener("resize", onScroll, { passive: true });
onScroll();

/* ------------------------------------------------------------------
   Mobile menu
------------------------------------------------------------------ */
const menuToggle = document.querySelector<HTMLButtonElement>("#menu-toggle");
const menu = document.getElementById("mobile-menu");
const menuIconOpen = document.querySelector("[data-menu-icon-open]");
const menuIconClose = document.querySelector("[data-menu-icon-close]");

function setMenu(open: boolean) {
  if (!menu || !menuToggle) return;

  menu.classList.toggle("is-open", open);
  menu.setAttribute("aria-hidden", String(!open));
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  header?.classList.toggle("is-open", open);
  menuIconOpen?.classList.toggle("hidden", open);
  menuIconClose?.classList.toggle("hidden", !open);

  if (open) {
    lenis?.stop();
    document.body.style.overflow = "hidden";
  } else {
    lenis?.start();
    document.body.style.overflow = "";
  }
}

menuToggle?.addEventListener("click", () => {
  setMenu(!menu?.classList.contains("is-open"));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu?.classList.contains("is-open")) {
    setMenu(false);
    menuToggle?.focus();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth >= 1024 && menu?.classList.contains("is-open"))
    setMenu(false);
});

/* ------------------------------------------------------------------
   Scroll helpers — every in-page jump goes through the same easing
------------------------------------------------------------------ */
const headerOffset = () => -((header?.offsetHeight ?? 0) + 10);

function maxScroll() {
  return Math.max(
    document.documentElement.scrollHeight - window.innerHeight,
    0,
  );
}

/** True for elements that own their own key handling (links, inputs, buttons…). */
function isInteractive(target: EventTarget | null) {
  return (
    target instanceof Element &&
    target.closest(
      'a, button, input, textarea, select, summary, [role="button"], [contenteditable]',
    ) !== null
  );
}

function scrollToY(top: number, duration = 1.15, immediate = false) {
  const destination = Math.min(Math.max(top, 0), maxScroll());

  if (lenis) {
    lenis.scrollTo(destination, immediate ? { immediate: true } : { duration });
  } else {
    window.scrollTo({
      top: destination,
      behavior: immediate || prefersReducedMotion ? "auto" : "smooth",
    });
  }
}

function scrollToElement(target: Element, duration = 1.15, immediate = false) {
  const top =
    target.getBoundingClientRect().top + window.scrollY + headerOffset();
  scrollToY(top, duration, immediate);
}

/* ------------------------------------------------------------------
   Anchor navigation (keeps the header height out of the way)
------------------------------------------------------------------ */
document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href || href === "#") return;

    const target = document.querySelector<HTMLElement>(href);
    if (!target) return;

    event.preventDefault();
    setMenu(false);
    scrollToElement(target);

    if (window.location.hash !== href) {
      history.replaceState(null, "", href);
    }
  });
});

/* ------------------------------------------------------------------
   Keyboard scrolling — same easing as the wheel and anchor clicks
------------------------------------------------------------------ */
document.addEventListener("keydown", (event) => {
  if (prefersReducedMotion || event.defaultPrevented) return;
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  if (isInteractive(event.target)) return;
  if (menu?.classList.contains("is-open")) return;

  const page = window.innerHeight * 0.88;
  const step = 120;
  let destination: number;

  switch (event.key) {
    case "PageDown":
      destination = window.scrollY + page;
      break;
    case "PageUp":
      destination = window.scrollY - page;
      break;
    case " ":
      destination = window.scrollY + (event.shiftKey ? -page : page);
      break;
    case "Home":
      destination = 0;
      break;
    case "End":
      destination = maxScroll();
      break;
    case "ArrowDown":
      destination = window.scrollY + step;
      break;
    case "ArrowUp":
      destination = window.scrollY - step;
      break;
    default:
      return;
  }

  event.preventDefault();
  scrollToY(destination, 0.85);
});

/* ------------------------------------------------------------------
   Deep links (/ #work) — land below the header, ease on hash change
------------------------------------------------------------------ */
function scrollToHash(hash: string, immediate = false) {
  if (hash.length < 2) return;

  let target: HTMLElement | null = null;
  try {
    target = document.querySelector<HTMLElement>(hash);
  } catch {
    return; /* not a valid selector — leave the browser default alone */
  }
  if (!target) return;

  scrollToElement(target, 1.15, immediate);
}

if (window.location.hash) {
  // The browser has already jumped to the raw anchor; correct for the fixed header.
  scrollToHash(window.location.hash, true);
  window.addEventListener(
    "load",
    () => scrollToHash(window.location.hash, true),
    { once: true },
  );
}

window.addEventListener("hashchange", () => scrollToHash(window.location.hash));

/* ------------------------------------------------------------------
   Hero entrance + chart draw
------------------------------------------------------------------ */
const heroLine = document.getElementById("hero-line");
const heroArea = document.getElementById("hero-area");
const heroLines = gsap.utils.toArray<HTMLElement>("[data-hero-line] > span");

if (prefersReducedMotion) {
  gsap.set(heroLines, { yPercent: 0, opacity: 1 });
  if (heroLine) {
    heroLine.style.strokeDasharray = "none";
    heroLine.style.opacity = "0.55";
  }
  if (heroArea) heroArea.style.opacity = "1";
} else {
  const geometry = heroLine as unknown as SVGGeometryElement | null;
  if (geometry && typeof geometry.getTotalLength === "function") {
    const length = geometry.getTotalLength();
    gsap.set(heroLine, { strokeDasharray: length, strokeDashoffset: length });
  }

  // `y: 0` matters: GSAP parses the CSS percentage transform into a pixel y,
  // which would otherwise survive the yPercent tween and leave the line hidden.
  gsap.set(heroLines, { yPercent: 110, y: 0 });

  const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
  intro
    .to(heroLines, { yPercent: 0, duration: 1.15, stagger: 0.09 }, 0.15)
    .to(
      heroLine,
      { strokeDashoffset: 0, duration: 2.4, ease: "power2.inOut" },
      0.45,
    )
    .to(heroArea, { opacity: 1, duration: 1.6 }, 1.15);
}

/* ------------------------------------------------------------------
   Scroll reveals
------------------------------------------------------------------ */
const revealTargets = document.querySelectorAll<HTMLElement>("[data-reveal]");

if (prefersReducedMotion) {
  revealTargets.forEach((el) => {
    el.style.opacity = "1";
  });
} else {
  revealTargets.forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 26 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
      },
    );
  });
}

/* ------------------------------------------------------------------
   Stat counters
------------------------------------------------------------------ */
document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
  const target = Number(el.dataset.count ?? 0);
  const decimals = Number(el.dataset.decimals ?? 0);
  const format = (value: number) =>
    decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));

  if (prefersReducedMotion) {
    el.textContent = format(target);
    return;
  }

  el.textContent = format(0);
  const state = { value: 0 };

  ScrollTrigger.create({
    trigger: el,
    start: "top 95%",
    once: true,
    onEnter: () => {
      gsap.to(state, {
        value: target,
        duration: 1.5,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent = format(state.value);
        },
        onComplete: () => {
          el.textContent = format(target);
        },
      });
    },
  });
});

/* ------------------------------------------------------------------
   Project search + filters
------------------------------------------------------------------ */
const projectRows = Array.from(
  document.querySelectorAll<HTMLElement>("[data-project]"),
);
const searchInput = document.querySelector<HTMLInputElement>("#project-search");
const filterChips = Array.from(
  document.querySelectorAll<HTMLButtonElement>("[data-filter]"),
);
const countOutput = document.querySelector<HTMLElement>("[data-project-count]");
const emptyState = document.querySelector<HTMLElement>("[data-project-empty]");

let activeFilter = "All";

function applyProjectFilters(animate = false) {
  const query = (searchInput?.value ?? "").trim().toLowerCase();
  const visible: HTMLElement[] = [];

  projectRows.forEach((row) => {
    const tech = (row.dataset.tech ?? "").split("|");
    const matchesFilter = activeFilter === "All" || tech.includes(activeFilter);
    const matchesQuery =
      query === "" || (row.textContent ?? "").toLowerCase().includes(query);
    const show = matchesFilter && matchesQuery;

    row.hidden = !show;
    if (show) visible.push(row);
  });

  if (countOutput)
    countOutput.textContent = String(visible.length).padStart(2, "0");
  if (emptyState) emptyState.hidden = visible.length > 0;

  if (animate && !prefersReducedMotion && visible.length > 0) {
    gsap.fromTo(
      visible,
      { opacity: 0, y: 10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.04,
        ease: "power2.out",
        overwrite: true,
      },
    );
  }
}

searchInput?.addEventListener("input", () => applyProjectFilters(true));

filterChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    activeFilter = chip.dataset.filter ?? "All";
    filterChips.forEach((other) => {
      const isActive = other === chip;
      other.classList.toggle("is-active", isActive);
      other.setAttribute("aria-pressed", String(isActive));
    });
    applyProjectFilters(true);
  });
});

applyProjectFilters();

/* ------------------------------------------------------------------
   Back to top — a visible glide; longer distance gets more time
------------------------------------------------------------------ */
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

backToTop?.addEventListener("click", () => {
  const distance = window.scrollY;
  const duration = distance > 4000 ? 1.9 : distance > 1200 ? 1.4 : 0.9;

  if (lenis) {
    lenis.scrollTo(0, { duration, easing: easeInOutCubic });
  } else {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }
});

/* ------------------------------------------------------------------
   Keep trigger positions honest once fonts and images settle
------------------------------------------------------------------ */
if (document.fonts?.ready) {
  document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
}
window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
