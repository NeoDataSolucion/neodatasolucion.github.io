"use strict";

const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector(".main-navigation");
const siteHeader = document.querySelector("#site-header");

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("open");

    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.textContent = isOpen ? "✕" : "☰";
  });

  navigation.addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLAnchorElement)) {
      return;
    }

    navigation.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.textContent = "☰";
  });
}

/* Header flotante */

function updateHeader() {
  if (!siteHeader) {
    return;
  }

  siteHeader.classList.toggle("header-scrolled", window.scrollY > 70);
}

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

/* Animaciones al aparecer en pantalla */

const elementsToReveal = document.querySelectorAll(
    ".section-heading, .problems-heading, .approach-step, .asset-card, .problem-card, .problems-message, .use-cases-alyout, .why-card, .process-step, .collaboration-summary"
);

elementsToReveal.forEach((element) => {
  element.classList.add("reveal");
});

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("reveal-visible");
      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.12,
    rootMargin: "0px 0px -45px 0px",
  }
);

elementsToReveal.forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 6, 5) * 70}ms`;
  revealObserver.observe(element);
});

/* Navegación activa según la sección visible */

const navigationLinks = document.querySelectorAll(
  '.main-navigation a[href^="#"]'
);

const pageSections = Array.from(navigationLinks)
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visibleSection = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visibleSection) {
      return;
    }

    navigationLinks.forEach((link) => {
      const isCurrentSection =
        link.getAttribute("href") === `#${visibleSection.target.id}`;

      link.classList.toggle("active", isCurrentSection);
    });
  },
  {
    rootMargin: "-35% 0px -55% 0px",
    threshold: [0, 0.1, 0.25],
  }
);

pageSections.forEach((section) => {
  sectionObserver.observe(section);
});

/* Casos de uso interactivos */

const useCaseTabs = document.querySelectorAll(".use-case-tab");
const useCasePanels = document.querySelectorAll(".use-case-panel");

useCaseTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const selectedCase = tab.dataset.case;

    useCaseTabs.forEach((currentTab) => {
      const isActive = currentTab === tab;

      currentTab.classList.toggle("active", isActive);
      currentTab.setAttribute("aria-selected", String(isActive));
    });

    useCasePanels.forEach((panel) => {
      panel.classList.toggle(
        "active",
        panel.dataset.panel === selectedCase
      );
    });
  });
});

console.log("NeoWeb v0.2 iniciado correctamente");

/* Sistema unificado de iconos decorativos */

const neoDecorativeIcons = {
  "👥": '<circle cx="9" cy="8" r="3"></circle><circle cx="17" cy="9" r="2.3"></circle><path d="M3.5 20v-2.2c0-3 2.4-5.3 5.5-5.3s5.5 2.3 5.5 5.3V20h-11ZM14.3 13.4c.8-.5 1.7-.8 2.7-.8 2.5 0 4.5 1.9 4.5 4.3V20h-4.8"></path>',
  "⌕": '<circle cx="10.5" cy="10.5" r="6.3"></circle><path d="m15.2 15.2 5 5"></path><path d="M8 10.5h5M10.5 8v5"></path>',
  "✎": '<path d="m4 16-.8 4.8L8 20l10.7-10.7-4-4L4 16Z"></path><path d="m13.2 6.8 4 4M3.2 20.8h7"></path>',
  "</>": '<path d="m8.5 6-5 6 5 6M15.5 6l5 6-5 6M14 3l-4 18"></path>',
  "↗": '<path d="M5 19 19 5M10 5h9v9"></path><path d="M5 8v11h11"></path>',
  "▦": '<rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M3 9h18M9 9v11M15 9v11"></path>',
  "◫": '<path d="M6 3h9l3 3v15H6V3Z"></path><path d="M15 3v4h4M9 11h6M9 15h6M9 18h4"></path>',
  "⌁": '<path d="M4 20V9M10 20V5M16 20v-8M3 20h18"></path><path d="m5 7 4-3 4 3 6-5M16.5 2l2.5.1-.1 2.5"></path>',
  "↻": '<path d="M20 7v5h-5M4 17v-5h5"></path><path d="M18.2 9A7 7 0 0 0 6.1 6.1L4 8M5.8 15A7 7 0 0 0 17.9 17.9L20 16"></path>',
  "▥": '<ellipse cx="12" cy="5" rx="7.2" ry="2.8"></ellipse><path d="M4.8 5v5c0 1.6 3.2 2.8 7.2 2.8s7.2-1.2 7.2-2.8V5M4.8 10v5c0 1.6 3.2 2.8 7.2 2.8s7.2-1.2 7.2-2.8v-5M4.8 15v4c0 1.6 3.2 2.8 7.2 2.8s7.2-1.2 7.2-2.8v-4"></path>',
  "▤": '<path d="M6 2.8h9l3 3V21H6V2.8Z"></path><path d="M15 2.8V6h3M9 10h6M9 13.5h6M9 17h4.2"></path>',
  "⌬": '<path d="M12 3 4.5 7.3v9.4L12 21l7.5-4.3V7.3L12 3Z"></path><path d="m8.2 9.1 3.8-2.2 3.8 2.2v4.4L12 15.7l-3.8-2.2V9.1Z"></path>',
  "⌘": '<circle cx="5" cy="6" r="2.2"></circle><circle cx="19" cy="6" r="2.2"></circle><circle cx="12" cy="18" r="2.2"></circle><path d="M7.2 6h9.6M18 8l-4.7 7.8M10.7 15.8 6 8"></path>',
  "✦": '<path d="M12 2.5c.8 5.2 3.8 8.2 9 9-5.2.8-8.2 3.8-9 9-.8-5.2-3.8-8.2-9-9 5.2-.8 8.2-3.8 9-9Z"></path>',
  "◎": '<circle cx="12" cy="12" r="8.5"></circle><circle cx="12" cy="12" r="4.5"></circle><circle cx="12" cy="12" r="1"></circle>',
  "⬡": '<path d="m12 2.8 8 4.6v9.2l-8 4.6-8-4.6V7.4l8-4.6Z"></path><path d="m12 8 3.5 2v4L12 16l-3.5-2v-4L12 8Z"></path>',
  "∞": '<path d="M8.2 8.2C4.7 4.7 2.5 7 2.5 12s2.2 7.3 5.7 3.8l7.6-7.6c3.5-3.5 5.7-1.2 5.7 3.8s-2.2 7.3-5.7 3.8L8.2 8.2Z"></path>',
  "◈": '<path d="m12 2.8 8.2 9.2-8.2 9.2L3.8 12 12 2.8Z"></path><path d="m12 7.5 4 4.5-4 4.5L8 12l4-4.5Z"></path>',
  "📁": '<path d="M3 6.5h7l2 2h9v10.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6.5Z"></path><path d="M3 10h18"></path>',
  "✓": '<circle cx="12" cy="12" r="9"></circle><path d="m7.5 12.2 3 3 6-6.5"></path>'
};

const decorativeIconSelector = [
  ".step-icon",
  ".problem-icon",
  ".project-icon",
  ".why-icon",
  ".project-feature-icon",
  ".project-assets-strip-icon",
  ".asset-icon"
].join(",");

document.querySelectorAll(decorativeIconSelector).forEach((iconElement) => {
  if (iconElement.querySelector("svg")) {
    return;
  }

  const iconKey = iconElement.textContent.trim();
  const iconPaths = neoDecorativeIcons[iconKey];

  if (!iconPaths) {
    return;
  }

  iconElement.innerHTML = `
    <svg
      class="neo-decorative-svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      ${iconPaths}
    </svg>
  `;
});
