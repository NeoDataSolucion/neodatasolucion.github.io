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