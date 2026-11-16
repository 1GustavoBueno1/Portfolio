// Melhorias progressivas do portfólio. A página funciona inteira sem este
// arquivo: ele cuida do ano do rodapé, da prévia do índice de projetos e
// da entrada suave dos blocos. A troca "quem pede" é feita só com CSS.
(function () {
  "use strict";

  var raiz = document.documentElement;
  raiz.classList.add("com-js");

  // ---- Ano do rodapé -------------------------------------------------------
  var ano = document.getElementById("ano");
  if (ano) ano.textContent = String(new Date().getFullYear());

  // ---- Índice de projetos: o nome ativo troca a prévia ---------------------
  var itens = Array.prototype.slice.call(document.querySelectorAll(".indice__nomes li"));
  var previas = Array.prototype.slice.call(document.querySelectorAll(".indice__moldura .previa"));

  function ativar(item) {
    var alvo = item.querySelector("a").getAttribute("data-previa");
    itens.forEach(function (outro) {
      outro.classList.toggle("ativo", outro === item);
    });
    previas.forEach(function (previa) {
      previa.classList.toggle("ativa", previa.getAttribute("data-previa") === alvo);
    });
  }

  itens.forEach(function (item) {
    var link = item.querySelector("a");
    link.addEventListener("mouseenter", function () { ativar(item); });
    link.addEventListener("focus", function () { ativar(item); });
  });

  // ---- Entrada suave dos blocos --------------------------------------------
  // Pulada para quem pediu movimento reduzido. O CSS só esconde os blocos
  // depois que html.revelar-pronto existe, então a classe entra por último.
  if (!("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(min-width: 45rem)").matches) return;

  var blocos = Array.prototype.slice.call(document.querySelectorAll("[data-revelar]"));

  // Irmãos entram em sequência: título, depois texto, depois imagem.
  blocos.forEach(function (bloco) {
    var irmaos = Array.prototype.filter.call(bloco.parentElement.children, function (el) {
      return el.hasAttribute("data-revelar");
    });
    bloco.style.setProperty("--ordem", String(Math.min(irmaos.indexOf(bloco), 5)));
  });

  var observador = new IntersectionObserver(
    function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add("visivel");
        observador.unobserve(entrada.target);
      });
    },
    { rootMargin: "0px 0px -6% 0px" }
  );

  blocos.forEach(function (bloco) {
    observador.observe(bloco);
  });
  raiz.classList.add("revelar-pronto");
})();
