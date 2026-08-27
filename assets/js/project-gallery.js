document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".project-visual-card");

  if (!cards.length) return;

  const modal = document.createElement("div");
  modal.className = "project-visual-modal";
  modal.hidden = true;
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", "Vista ampliada del proyecto");

  const image = document.createElement("img");
  image.alt = "";

  const closeButton = document.createElement("button");
  closeButton.className = "project-visual-modal-close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Cerrar imagen");
  closeButton.textContent = "×";

  modal.append(image, closeButton);
  document.body.append(modal);

  let lastTrigger = null;

  const closeModal = () => {
    modal.hidden = true;
    image.removeAttribute("src");
    document.body.classList.remove("project-modal-open");
    lastTrigger?.focus();
  };

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const preview = card.querySelector("img");
      if (!preview) return;

      lastTrigger = card;
      image.src = preview.currentSrc || preview.src;
      image.alt = preview.alt;
      modal.hidden = false;
      document.body.classList.add("project-modal-open");
      closeButton.focus();
    });
  });

  closeButton.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) closeModal();
  });
});
