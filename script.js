(() => {
  "use strict";

  document.documentElement.classList.add("reveal-ready");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");

  /* Entrance and scroll reveals */
  const revealElements = [...document.querySelectorAll("[data-reveal]")];
  revealElements.forEach((element) => {
    const delay = element.dataset.delay;
    if (delay) element.style.setProperty("--delay", delay);
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8%" }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  }

  /* Navigation */
  const updateNav = () => nav?.classList.toggle("is-scrolled", window.scrollY > 16);
  updateNav();
  window.addEventListener("scroll", updateNav, { passive: true });

  const setMenu = (open) => {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  };

  toggle?.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  navLinks?.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav?.classList.contains("is-open")) {
      setMenu(false);
      toggle?.focus();
    }
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) setMenu(false);
  });

  /* Active section marker */
  const sections = [...document.querySelectorAll("main section[id]")];
  const links = [...document.querySelectorAll(".nav__link[href^='#']")];

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;

        links.forEach((link) => {
          const isCurrent = link.getAttribute("href") === `#${visible.target.id}`;
          link.classList.toggle("is-active", isCurrent);
          if (isCurrent) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      },
      { rootMargin: "-32% 0px -56%", threshold: [0, 0.15, 0.5] }
    );
    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* Subtle artwork depth */
  const visual = document.querySelector(".hero__visual");
  const artwork = document.querySelector(".hero__frame");
  if (!reduceMotion && visual && artwork && window.matchMedia("(pointer: fine)").matches) {
    visual.addEventListener("pointermove", (event) => {
      const bounds = visual.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      artwork.style.transform = `perspective(1000px) rotateY(${x * 3}deg) rotateX(${y * -3}deg)`;
    });
    visual.addEventListener("pointerleave", () => {
      artwork.style.transform = "perspective(1000px) rotateY(0) rotateX(0)";
    });
  }

  /* Gmail compose form */
  const form = document.getElementById("contact-form");
  const feedback = document.getElementById("form-feedback");

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    feedback.className = "form__feedback";

    const fields = [...form.querySelectorAll("input, textarea")];
    fields.forEach((field) => field.setAttribute("aria-invalid", String(!field.validity.valid)));

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
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=gustavo.silva123913@gmail.com&su=${subject}&body=${body}`;

    const composeWindow = window.open(gmailUrl, "_blank", "noopener,noreferrer");
    if (!composeWindow) window.location.href = gmailUrl;

    feedback.textContent = "Abrindo o Gmail para concluir o envio.";
    feedback.classList.add("is-success");
    form.reset();
    fields.forEach((field) => field.removeAttribute("aria-invalid"));
  });

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
