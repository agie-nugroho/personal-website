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

function applyTheme() {
  const isDark = !root.classList.contains("dark");
  root.classList.toggle("dark", isDark);
  try {
    localStorage.setItem("theme", isDark ? "dark" : "light");
  } catch {
    /* private mode: theme just won't persist */
  }
  syncThemeState();
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

/** Reveal the new theme with a circle growing out of the toggle itself. */
themeToggle?.addEventListener("click", () => {
  const startViewTransition = (
    document as ViewTransitionDocument
  ).startViewTransition?.bind(document);
  const rect = themeToggle?.getBoundingClientRect();

  if (prefersReducedMotion || !startViewTransition || !rect) {
    applyTheme();
    return;
  }

  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  root.style.setProperty("--vt-x", `${x}px`);
  root.style.setProperty("--vt-y", `${y}px`);
  root.style.setProperty(
    "--vt-r",
    `${Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))}px`,
  );

  startViewTransition(() => applyTheme())
    .finished.catch(() => {})
    .finally(() => {
      root.style.removeProperty("--vt-x");
      root.style.removeProperty("--vt-y");
      root.style.removeProperty("--vt-r");
    });
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
const topRing = document.querySelector<SVGCircleElement>("[data-top-ring]");
const navLinks = Array.from(
  document.querySelectorAll<HTMLAnchorElement>("[data-nav-link]"),
);
const sectionDots = Array.from(
  document.querySelectorAll<HTMLAnchorElement>("[data-dot-link]"),
);
const sections = Array.from(
  document.querySelectorAll<HTMLElement>("[data-section]"),
);

function onScroll() {
  const scrollY = window.scrollY;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;

  header?.classList.toggle("is-scrolled", scrollY > 8);

  const ratio = scrollable > 0 ? Math.min(scrollY / scrollable, 1) : 0;
  if (progressBar) progressBar.style.transform = `scaleX(${ratio})`;
  if (topRing) topRing.style.strokeDashoffset = String(1 - ratio);

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

  sectionDots.forEach((dot) => {
    const isActive = dot.dataset.dotLink === activeId;
    dot.classList.toggle("is-active", isActive);
    if (isActive) dot.setAttribute("aria-current", "true");
    else dot.removeAttribute("aria-current");
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
      behavior: immediate ? "auto" : "smooth",
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
  if (
    document.getElementById("palette")?.getAttribute("aria-hidden") === "false"
  )
    return;

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
    // No Lenis (script failed or vendor blocked): native smooth is still better
    // than a jump, and this only runs on an explicit click.
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

/* ------------------------------------------------------------------
   Keep trigger positions honest once fonts and images settle
------------------------------------------------------------------ */
if (document.fonts?.ready) {
  document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
}
window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });

/* ------------------------------------------------------------------
   Hero chart — pointer guide and a gentle parallax
------------------------------------------------------------------ */
const heroSection = document.getElementById("home");
const heroChart = document.querySelector<SVGSVGElement>("[data-hero-chart]");
const heroPolyline = document.getElementById(
  "hero-line",
) as SVGPolylineElement | null;
const heroCursor = document.getElementById("hero-cursor");
const heroGuide = document.getElementById(
  "hero-guide",
) as SVGLineElement | null;
const heroDot = document.getElementById("hero-dot") as SVGCircleElement | null;
const heroHalo = document.getElementById(
  "hero-halo",
) as SVGCircleElement | null;

if (heroSection && heroChart && heroPolyline && heroCursor) {
  const points = Array.from(
    { length: heroPolyline.points.numberOfItems },
    (_, i) => heroPolyline.points.getItem(i),
  );

  const parallaxX = prefersReducedMotion
    ? null
    : gsap.quickTo(heroChart, "x", { duration: 0.9, ease: "power3" });
  const parallaxY = prefersReducedMotion
    ? null
    : gsap.quickTo(heroChart, "y", { duration: 0.9, ease: "power3" });

  heroSection.addEventListener("pointermove", (event) => {
    const rect = heroSection.getBoundingClientRect();
    if (rect.width === 0 || points.length === 0) return;

    // Map the pointer onto the chart's 1200-unit viewBox width.
    const chartX = ((event.clientX - rect.left) / rect.width) * 1200;
    let nearest = points[0];
    for (const point of points) {
      if (Math.abs(point.x - chartX) < Math.abs(nearest.x - chartX))
        nearest = point;
    }

    heroGuide?.setAttribute("x1", String(nearest.x));
    heroGuide?.setAttribute("x2", String(nearest.x));
    heroDot?.setAttribute("cx", String(nearest.x));
    heroDot?.setAttribute("cy", String(nearest.y));
    heroHalo?.setAttribute("cx", String(nearest.x));
    heroHalo?.setAttribute("cy", String(nearest.y));

    gsap.to(heroCursor, { opacity: 1, duration: 0.3, overwrite: true });

    parallaxX?.((event.clientX / window.innerWidth - 0.5) * 18);
    parallaxY?.((event.clientY / window.innerHeight - 0.5) * 10);
  });

  heroSection.addEventListener("pointerleave", () => {
    gsap.to(heroCursor, { opacity: 0, duration: 0.35, overwrite: true });
    parallaxX?.(0);
    parallaxY?.(0);
  });
}

/* ------------------------------------------------------------------
   Experience timeline — the rail fills as the section is read
------------------------------------------------------------------ */

const timeline = document.querySelector<HTMLElement>(".experience-timeline");

const timelineFill = document.querySelector<HTMLElement>(
  "[data-timeline-fill]",
);

if (timeline && timelineFill) {
  gsap.set(timelineFill, {
    scaleY: 0,
    transformOrigin: "top center",
  });

  gsap.to(timelineFill, {
    scaleY: 1,
    ease: "none",
    scrollTrigger: {
      trigger: timeline,
      start: "top 75%",
      end: "bottom 65%",
      scrub: 0.8,
      invalidateOnRefresh: true,
    },
  });
}

/* ------------------------------------------------------------------
   Project hover preview (pointer devices only)
------------------------------------------------------------------ */
const projectPreview = document.getElementById("project-preview");
const canHover = window.matchMedia(
  "(hover: hover) and (pointer: fine)",
).matches;

if (projectPreview && canHover) {
  const fields = {
    meta: projectPreview.querySelector<HTMLElement>("[data-pv-meta]"),
    title: projectPreview.querySelector<HTMLElement>("[data-pv-title]"),
    summary: projectPreview.querySelector<HTMLElement>("[data-pv-summary]"),
    tools: projectPreview.querySelector<HTMLElement>("[data-pv-tools]"),
  };

  let previewVisible = false;

  const placePreview = (event: PointerEvent) => {
    if (!projectPreview) return;
    const gap = 18;
    const box = projectPreview.getBoundingClientRect();
    let x = event.clientX + gap;
    let y = event.clientY + gap;

    if (x + box.width > window.innerWidth - 12)
      x = event.clientX - box.width - gap;
    if (y + box.height > window.innerHeight - 12)
      y = event.clientY - box.height - gap;

    projectPreview.style.transform = `translate3d(${Math.round(Math.max(8, x))}px, ${Math.round(
      Math.max(8, y),
    )}px, 0)`;
  };

  document.querySelectorAll<HTMLElement>("[data-project]").forEach((row) => {
    row.addEventListener("pointerenter", (event) => {
      if (fields.meta) fields.meta.textContent = row.dataset.previewMeta ?? "";
      if (fields.title)
        fields.title.textContent = row.dataset.previewTitle ?? "";
      if (fields.summary)
        fields.summary.textContent = row.dataset.previewSummary ?? "";
      if (fields.tools)
        fields.tools.textContent = row.dataset.previewTools ?? "";

      previewVisible = true;
      projectPreview.classList.add("is-visible");
      placePreview(event);
    });

    row.addEventListener("pointermove", (event) => {
      if (previewVisible) placePreview(event);
    });

    row.addEventListener("pointerleave", () => {
      previewVisible = false;
      projectPreview.classList.remove("is-visible");
    });
  });
}

/* ------------------------------------------------------------------
   Project rows — a soft spotlight that follows the pointer
------------------------------------------------------------------ */
if (canHover) {
  document.querySelectorAll<HTMLElement>("[data-project]").forEach((row) => {
    row.addEventListener("pointermove", (event) => {
      const rect = row.getBoundingClientRect();
      row.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      row.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  });
}

/* ------------------------------------------------------------------
   Magnetic buttons — lean toward the cursor, spring back on leave
------------------------------------------------------------------ */
if (canHover && !prefersReducedMotion) {
  const clampPull = gsap.utils.clamp(-10, 10);

  document
    .querySelectorAll<HTMLElement>("[data-magnetic]")
    .forEach((element) => {
      const xTo = gsap.quickTo(element, "x", { duration: 0.5, ease: "power3" });
      const yTo = gsap.quickTo(element, "y", { duration: 0.5, ease: "power3" });

      element.addEventListener("pointermove", (event) => {
        const rect = element.getBoundingClientRect();
        const pull = 0.22;
        xTo(clampPull((event.clientX - (rect.left + rect.width / 2)) * pull));
        yTo(clampPull((event.clientY - (rect.top + rect.height / 2)) * pull));
      });

      element.addEventListener("pointerleave", () => {
        xTo(0);
        yTo(0);
      });
    });
}

/* ------------------------------------------------------------------
   Marquee — shear with the scroll, settle when it stops
------------------------------------------------------------------ */
const marqueeShear = document.querySelector<HTMLElement>(
  "[data-marquee-shear]",
);

if (marqueeShear && !prefersReducedMotion) {
  const setShear = gsap.quickTo(marqueeShear, "skewX", {
    duration: 0.7,
    ease: "power3",
  });
  const clampShear = gsap.utils.clamp(-7, 7);
  let lastY = window.scrollY;
  let shearTimer: number | undefined;
  let shearTicking = false;

  const updateShear = () => {
    const y = window.scrollY;
    const delta = y - lastY;
    lastY = y;

    // Distance travelled per frame, not Lenis's internal velocity units.
    if (Math.abs(delta) > 0.5) setShear(clampShear(delta * 0.4));

    window.clearTimeout(shearTimer);
    shearTimer = window.setTimeout(() => {
      gsap.to(marqueeShear, {
        skewX: 0,
        duration: 0.6,
        ease: "power2.out",
        overwrite: true,
      });
    }, 180);
    shearTicking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (shearTicking) return;
      shearTicking = true;
      requestAnimationFrame(updateShear);
    },
    { passive: true },
  );
}

/* ------------------------------------------------------------------
   Copy email + toast
------------------------------------------------------------------ */
const toast = document.getElementById("toast");
let toastTimer: number | undefined;

function showToast(message: string) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(
    () => toast.classList.remove("is-visible"),
    2600,
  );
}

async function copyText(value: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    /* clipboard permission denied — fall back below */
  }

  try {
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.top = "-1000px";
    document.body.append(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    return copied;
  } catch {
    return false;
  }
}

document.addEventListener("click", async (event) => {
  const trigger =
    event.target instanceof Element
      ? event.target.closest<HTMLElement>("[data-copy-email]")
      : null;
  if (!trigger) return;

  const email = trigger.dataset.copyEmail ?? "";
  if (!email) return;

  const copied = await copyText(email);
  showToast(copied ? "Email copied" : email);
});

document.addEventListener("click", async (event) => {
  const trigger =
    event.target instanceof Element
      ? event.target.closest<HTMLElement>("[data-copy-link]")
      : null;
  if (!trigger) return;

  const url = window.location.href;
  const copied = await copyText(url);
  showToast(copied ? "Link copied" : url);
});

/* ------------------------------------------------------------------
   Jump-to palette (⌘K / Ctrl+K)
------------------------------------------------------------------ */
const palette = document.getElementById("palette");
const paletteInput = document.getElementById(
  "palette-input",
) as HTMLInputElement | null;
const paletteList = document.getElementById("palette-list");
const paletteTrigger = document.getElementById("palette-trigger");

interface PaletteItem {
  label: string;
  hint: string;
  href?: string;
  run?: () => void;
}

let paletteOpen = false;
let paletteMatches: PaletteItem[] = [];
let paletteIndex = 0;
let paletteReturnFocus: HTMLElement | null = null;

function paletteItems(): PaletteItem[] {
  const items: PaletteItem[] = [];

  document
    .querySelectorAll<HTMLElement>("[data-section]")
    .forEach((section) => {
      const heading = section.querySelector("h2");
      if (!heading) return;
      items.push({
        label: heading.textContent?.trim() ?? section.id,
        hint: "Section",
        run: () => scrollToElement(section),
      });
    });

  document
    .querySelectorAll<HTMLAnchorElement>("[data-project-title]")
    .forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) return;
      items.push({
        label: link.textContent?.trim() ?? "",
        hint: "Case study",
        href,
      });
    });

  const mailLink =
    document.querySelector<HTMLAnchorElement>('a[href^="mailto:"]');
  const mailHref = mailLink?.getAttribute("href");
  if (mailHref)
    items.push({ label: "Send an email", hint: "Contact", href: mailHref });

  const cvLink = document.querySelector<HTMLAnchorElement>("a[download]");
  const cvHref = cvLink?.getAttribute("href");
  if (cvHref) items.push({ label: "Download CV", hint: "PDF", href: cvHref });

  items.push({
    label: root.classList.contains("dark")
      ? "Switch to light theme"
      : "Switch to dark theme",
    hint: "Action",
    run: applyTheme,
  });

  if (mailHref) {
    const email = mailHref.replace(/^mailto:/, "");
    items.push({
      label: "Copy email address",
      hint: "Action",
      run: async () => {
        const copied = await copyText(email);
        showToast(copied ? "Email copied" : email);
      },
    });
  }

  items.push({ label: "Back to top", hint: "Action", run: () => scrollToY(0) });

  return items;
}

function runPaletteItem(item: PaletteItem | undefined) {
  if (!item) return;
  closePalette();

  if (item.href) {
    window.location.href = item.href;
    return;
  }

  item.run?.();
}

function renderPalette(query: string) {
  if (!paletteList) return;

  const needle = query.trim().toLowerCase();
  paletteMatches = paletteItems()
    .filter(
      (item) => needle === "" || item.label.toLowerCase().includes(needle),
    )
    .slice(0, 8);
  paletteIndex = 0;
  paletteList.replaceChildren();

  if (paletteMatches.length === 0) {
    const empty = document.createElement("li");
    empty.className = "palette-empty";
    empty.textContent = "Nothing matches — try another word.";
    paletteList.append(empty);
    return;
  }

  paletteMatches.forEach((item, index) => {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = index === 0 ? "palette-item is-active" : "palette-item";

    const label = document.createElement("span");
    label.textContent = item.label;
    const hint = document.createElement("span");
    hint.textContent = item.hint;

    button.append(label, hint);
    button.addEventListener("click", () => runPaletteItem(item));
    li.append(button);
    paletteList.append(li);
  });
}

function highlightPalette() {
  paletteList
    ?.querySelectorAll<HTMLElement>(".palette-item")
    .forEach((button, index) => {
      button.classList.toggle("is-active", index === paletteIndex);
    });
}

function openPalette() {
  if (!palette || !paletteInput) return;

  paletteOpen = true;
  paletteReturnFocus =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  palette.hidden = false;
  palette.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  lenis?.stop();

  paletteInput.value = "";
  renderPalette("");
  paletteInput.focus();
}

function closePalette() {
  if (!palette || !paletteOpen) return;

  paletteOpen = false;
  palette.hidden = true;
  palette.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (!menu?.classList.contains("is-open")) lenis?.start();

  paletteReturnFocus?.focus();
  paletteReturnFocus = null;
}

paletteTrigger?.addEventListener("click", () => openPalette());
paletteInput?.addEventListener("input", () =>
  renderPalette(paletteInput.value),
);
palette?.addEventListener("click", (event) => {
  if (event.target === palette) closePalette();
});

document.addEventListener("keydown", (event) => {
  const meta = event.metaKey || event.ctrlKey;

  if (meta && event.key.toLowerCase() === "k") {
    event.preventDefault();
    if (paletteOpen) closePalette();
    else openPalette();
    return;
  }

  if (!paletteOpen) return;

  if (event.key === "Escape") {
    event.preventDefault();
    closePalette();
    return;
  }

  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    if (paletteMatches.length === 0) return;
    const step = event.key === "ArrowDown" ? 1 : -1;
    paletteIndex =
      (paletteIndex + step + paletteMatches.length) % paletteMatches.length;
    highlightPalette();
    return;
  }

  if (event.key === "Enter") {
    event.preventDefault();
    runPaletteItem(paletteMatches[paletteIndex]);
  }
});

/* ------------------------------------------------------------------
   Case study — highlight the section currently being read
------------------------------------------------------------------ */
const spyLinks = Array.from(
  document.querySelectorAll<HTMLAnchorElement>("[data-spy-link]"),
);
const spyTargets = Array.from(
  document.querySelectorAll<HTMLElement>("[data-spy-target]"),
);

if (spyLinks.length > 0 && spyTargets.length > 0) {
  const setSpy = (id: string) => {
    spyLinks.forEach((link) => {
      const isActive = link.dataset.spyLink === id;
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };

  // Position-based rather than IntersectionObserver: short sections (the last
  // one especially) would otherwise never enter a narrow band.
  const updateSpy = () => {
    const marker = window.scrollY + window.innerHeight * 0.35;
    let active = spyTargets[0]?.id ?? "";

    for (const target of spyTargets) {
      if (target.getBoundingClientRect().top + window.scrollY <= marker)
        active = target.id;
    }

    setSpy(active);
  };

  let spyTicking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (spyTicking) return;
      spyTicking = true;
      requestAnimationFrame(() => {
        updateSpy();
        spyTicking = false;
      });
    },
    { passive: true },
  );

  updateSpy();
}

/* ------------------------------------------------------------------
   Local time in Bekasi — real clock, updated quietly
------------------------------------------------------------------ */
const localTime = document.querySelector<HTMLElement>("[data-local-time]");

if (localTime) {
  try {
    const clock = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const tick = () => {
      localTime.textContent = `${clock.format(new Date())} WIB`;
    };

    tick();
    window.setInterval(tick, 15000);
  } catch {
    localTime.textContent = "WIB";
  }
}

/* Cross-document view transitions land here too: refresh the scroll state. */
window.addEventListener("pageshow", () => {
  onScroll();
  ScrollTrigger.refresh();
});
