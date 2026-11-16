// Melhorias progressivas do portfólio. A página funciona inteira sem este
// arquivo: ele só cuida do menu no celular, da seção ativa na navegação,
// do ano do rodapé e da entrada suave dos blocos.
(function () {
  "use strict";

  var raiz = document.documentElement;
  raiz.classList.add("com-js");

  // ---- Ano do rodapé -------------------------------------------------------
  var ano = document.getElementById("ano");
  if (ano) ano.textContent = String(new Date().getFullYear());

  // ---- Menu no celular -----------------------------------------------------
  var botao = document.getElementById("menu-botao");
  var menu = document.getElementById("menu");

  if (botao && menu) {
    var aberto = function () {
      return botao.getAttribute("aria-expanded") === "true";
    };
    var definir = function (valor) {
      botao.setAttribute("aria-expanded", valor ? "true" : "false");
    };

    botao.hidden = false;

    botao.addEventListener("click", function () {
      definir(!aberto());
    });

    menu.addEventListener("click", function (evento) {
      if (evento.target.closest("a")) definir(false);
    });

    document.addEventListener("keydown", function (evento) {
      if (evento.key === "Escape" && aberto()) {
        definir(false);
        botao.focus();
      }
    });
  }

  if (!("IntersectionObserver" in window)) return;

  // ---- Seção ativa na navegação --------------------------------------------
  // Vale a seção que cruza uma linha a 45% da altura da tela.
  var links = {};
  document.querySelectorAll('#menu a[href^="#"]').forEach(function (link) {
    links[link.getAttribute("href").slice(1)] = link;
  });

  var observadorDeSecoes = new IntersectionObserver(
    function (entradas) {
      entradas.forEach(function (entrada) {
        var link = links[entrada.target.id];
        if (!link) return;
        if (entrada.isIntersecting) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    },
    { rootMargin: "-45% 0px -55% 0px" }
  );

  Object.keys(links).forEach(function (id) {
    var secao = document.getElementById(id);
    if (secao) observadorDeSecoes.observe(secao);
  });

  // ---- Entrada suave dos blocos --------------------------------------------
  // Pulada para quem pediu movimento reduzido. O CSS só esconde os blocos
  // depois que html.revelar-pronto existe, então a classe entra por último.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var blocos = document.querySelectorAll("[data-revelar]");
  var observadorDeBlocos = new IntersectionObserver(
    function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add("visivel");
        observadorDeBlocos.unobserve(entrada.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px" }
  );

  blocos.forEach(function (bloco) {
    observadorDeBlocos.observe(bloco);
  });
  raiz.classList.add("revelar-pronto");
})();
