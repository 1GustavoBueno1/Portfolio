/* =========================================================
   Gustavo Bueno — Portfólio · interações
   Vanilla JS · sem dependências · transform/opacity apenas
   ========================================================= */
(() => {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Reveal on scroll (com stagger) ---------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  revealEls.forEach((el) => {
    const delay = el.getAttribute("data-reveal-delay");
    if (delay) el.style.setProperty("--reveal-delay", delay);
  });

  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ---------- Navbar: sombra ao rolar ---------- */
  const nav = document.getElementById("nav");
  const onScroll = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Menu mobile ---------- */
  const toggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");

  const closeMenu = () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menu");
  };
  const openMenu = () => {
    nav.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Fechar menu");
  };

  toggle.addEventListener("click", () => {
    nav.classList.contains("is-open") ? closeMenu() : openMenu();
  });
  navLinks.addEventListener("click", (e) => {
    if (e.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      closeMenu();
      toggle.focus();
    }
  });

  /* ---------- Indicador de seção ativa ---------- */
  const sections = document.querySelectorAll("main section[id]");
  const linkFor = (id) => document.querySelector(`.nav__link[href="#${id}"]`);

  if ("IntersectionObserver" in window) {
    const spyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = linkFor(entry.target.id);
          if (!link) return;
          if (entry.isIntersecting) {
            document
              .querySelectorAll(".nav__link.is-active")
              .forEach((l) => l.classList.remove("is-active"));
            link.classList.add("is-active");
          }
        });
      },
      { threshold: 0.1, rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => spyObserver.observe(s));
  }

  /* ---------- Formulário de contato (mailto + feedback) ---------- */
  const form = document.getElementById("contact-form");
  const feedback = document.getElementById("form-feedback");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      feedback.className = "form__feedback";

      if (!form.checkValidity()) {
        feedback.textContent = "Preencha todos os campos corretamente.";
        feedback.classList.add("is-error");
        form.reportValidity();
        return;
      }

      const name = form.elements.name.value.trim();
      const email = form.elements.email.value.trim();
      const message = form.elements.message.value.trim();

      const subject = encodeURIComponent(`Contato pelo portfólio — ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
      window.location.href = `mailto:gustavo.silva123913@gmail.com?subject=${subject}&body=${body}`;

      feedback.textContent = "Abrindo seu app de e-mail... Obrigado pelo contato!";
      feedback.classList.add("is-success");
      form.reset();
    });
  }

  /* ---------- Ano no rodapé ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
