// Verificador do portfólio. Abre o index.html local no Chromium (Playwright)
// e confere conteúdo, visual e comportamento do script.
//
//   node tests/verificar.mjs            roda todos os grupos
//   node tests/verificar.mjs conteudo   roda um grupo (conteudo | visual | script)
//
// Sai com código 1 se algum teste falhar. No fim, lista as pendências.

import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PAGINA = pathToFileURL(path.join(RAIZ, "index.html")).href;

const FRASES_PROIBIDAS = [
  "Sistemas que fazem o trabalho acontecer",
  "Tecnologia com propósito",
  "Python no coração",
  "Disponível para novos projetos",
  "dezenas de unidades",
  "desde 2025",
  "publicado em produção",
  "publicada em produção",
  "10 endpoints",
];

const TRECHOS_PROIBIDOS_EM_LINKS = [
  "railway.app",
  "dudu-checklist.web.app",
  "dudusistemas.web.app",
  "Automacao-para-contas-de-luz",
  "TaskFlow-API-FrontEnd",
  "gustavo-silva",
];

const NOMES_DOS_PROJETOS = [
  "TaskFlow",
  "Custos da Cozinha",
  "CheckListsDudu",
  "Autocelesc",
  "Sistema de Automação Empresarial",
];

// ---------------------------------------------------------------- estrutura

const testes = [];
const pendencias = [];

function teste(grupo, nome, fn) {
  testes.push({ grupo, nome, fn });
}

function exigir(condicao, mensagem) {
  if (!condicao) throw new Error(mensagem);
}

let navegador;

// Abre a página num contexto novo. Pedidos para fora (a fonte do Google) são
// cortados para o teste não depender de rede.
async function abrir({ largura = 1280, altura = 900, js = true, movimentoReduzido = false, antes } = {}) {
  const contexto = await navegador.newContext({
    viewport: { width: largura, height: altura },
    javaScriptEnabled: js,
    reducedMotion: movimentoReduzido ? "reduce" : "no-preference",
  });
  await contexto.route("**/*", (rota) =>
    rota.request().url().startsWith("file:") ? rota.continue() : rota.abort()
  );
  const pagina = await contexto.newPage();
  // Elemento que falta deve reprovar rápido, não esperar 30 s.
  pagina.setDefaultTimeout(1500);
  const erros = [];
  pagina.on("pageerror", (e) => erros.push(String(e)));
  pagina.on("console", (m) => {
    if (m.type() === "error" && !m.text().includes("net::ERR")) erros.push(m.text());
  });
  if (antes) await antes(pagina);
  await pagina.goto(PAGINA);
  return { pagina, contexto, erros };
}

async function comPagina(opcoes, fn) {
  const aberto = await abrir(opcoes);
  try {
    return await fn(aberto.pagina, aberto);
  } finally {
    await aberto.contexto.close();
  }
}

// ----------------------------------------------------------------- conteudo

teste("conteudo", "idioma, título e descrição", () =>
  comPagina({}, async (p) => {
    exigir((await p.getAttribute("html", "lang")) === "pt-BR", 'html lang deve ser "pt-BR"');
    exigir((await p.title()).trim().length > 10, "title vazio ou curto demais");
    const desc = await p.getAttribute('meta[name="description"]', "content");
    exigir(desc && desc.length >= 50 && desc.length <= 160, `meta description com ${desc?.length} caracteres (50 a 160)`);
  })
);

teste("conteudo", "Open Graph, theme-color e favicon", () =>
  comPagina({}, async (p) => {
    for (const prop of ["og:title", "og:description", "og:type", "og:image", "og:url"]) {
      const v = await p.getAttribute(`meta[property="${prop}"]`, "content").catch(() => null);
      exigir(v, `falta meta ${prop}`);
    }
    exigir((await p.getAttribute('meta[property="og:locale"]', "content")) === "pt_BR", "og:locale deve ser pt_BR");
    exigir((await p.getAttribute('meta[name="theme-color"]', "content")) === "#100b18", "theme-color deve ser #100b18");
    exigir((await p.getAttribute('link[rel="icon"]', "href")) === "assets/favicon.svg", "favicon deve apontar para assets/favicon.svg");
  })
);

teste("conteudo", "um único h1, com o nome", () =>
  comPagina({}, async (p) => {
    exigir((await p.locator("h1").count()) === 1, "deve haver exatamente 1 h1");
    exigir((await p.locator("h1").innerText()).includes("Gustavo Bueno"), "h1 deve conter o nome");
  })
);

teste("conteudo", "frases obrigatórias e frases proibidas", () =>
  comPagina({}, async (p) => {
    const texto = (await p.locator("body").innerText()).toLowerCase();
    for (const frase of ["Buscando vaga júnior backend remota", "fim de 2024", "cerca de 42 unidades", "8 endpoints", "© 2026"]) {
      exigir(texto.includes(frase.toLowerCase()), `falta o texto "${frase}"`);
    }
    const html = (await p.content()).toLowerCase();
    for (const frase of FRASES_PROIBIDAS) {
      exigir(!html.includes(frase.toLowerCase()), `frase proibida presente: "${frase}"`);
    }
  })
);

teste("conteudo", "nenhum link proibido e nenhum formulário", () =>
  comPagina({}, async (p) => {
    const hrefs = await p.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")));
    for (const href of hrefs) {
      for (const trecho of TRECHOS_PROIBIDOS_EM_LINKS) {
        exigir(!href.toLowerCase().includes(trecho.toLowerCase()), `link proibido: ${href}`);
      }
    }
    exigir((await p.locator("form").count()) === 0, "não pode haver <form>");
  })
);

teste("conteudo", "cinco cards de projeto, na ordem combinada", () =>
  comPagina({}, async (p) => {
    const nomes = await p.$$eval("article.projeto h3", (hs) => hs.map((h) => h.textContent.trim()));
    exigir(nomes.length === 5, `esperava 5 cards, achei ${nomes.length}`);
    NOMES_DOS_PROJETOS.forEach((nome, i) =>
      exigir(nomes[i].startsWith(nome), `card ${i + 1} deveria ser "${nome}", é "${nomes[i]}"`)
    );
    exigir((await p.locator("article.projeto--principal").count()) === 1, "só o TaskFlow é o card principal");
    exigir(
      (await p.locator("article.projeto--principal h3").innerText()).startsWith("TaskFlow"),
      "o card principal deve ser o TaskFlow"
    );
  })
);

teste("conteudo", "cada card tem 3 a 5 destaques e pelo menos 3 tags", () =>
  comPagina({}, async (p) => {
    const cards = await p.$$eval("article.projeto", (as) =>
      as.map((a) => ({
        nome: a.querySelector("h3").textContent.trim(),
        destaques: a.querySelectorAll("ul.destaques > li").length,
        tags: a.querySelectorAll("ul.tags > li").length,
        problema: (a.querySelector("p.projeto__problema")?.textContent || "").trim().length,
      }))
    );
    for (const c of cards) {
      exigir(c.destaques >= 3 && c.destaques <= 5, `${c.nome}: ${c.destaques} destaques (3 a 5)`);
      exigir(c.tags >= 3, `${c.nome}: ${c.tags} tags (mínimo 3)`);
      exigir(c.problema > 20, `${c.nome}: falta a frase do problema`);
    }
  })
);

teste("conteudo", "autoria declarada nos sistemas feitos com apoio de IA", () =>
  comPagina({}, async (p) => {
    for (const nome of ["Custos da Cozinha", "CheckListsDudu"]) {
      const card = p.locator("article.projeto", { has: p.locator("h3", { hasText: nome }) });
      const autoria = await card.locator("p.autoria").innerText();
      exigir(/apoio de IA/i.test(autoria), `${nome}: a autoria deve citar o apoio de IA`);
    }
    exigir((await p.locator("ul.outros > li").count()) === 2, "Outros sistemas deve ter 2 linhas");
    const outros = await p.locator("ul.outros").innerText();
    exigir((outros.match(/apoio de IA/gi) || []).length === 2, "as 2 linhas de Outros sistemas citam o apoio de IA");
  })
);

teste("conteudo", "trecho de código do TaskFlow presente e focável", () =>
  comPagina({}, async (p) => {
    const pre = p.locator("article.projeto--principal pre.codigo");
    exigir((await pre.count()) === 1, "falta o pre.codigo no card do TaskFlow");
    exigir((await pre.getAttribute("tabindex")) === "0", "pre.codigo precisa de tabindex=0");
    exigir(await pre.getAttribute("aria-label"), "pre.codigo precisa de aria-label");
    exigir((await pre.innerText()).includes("Tasks.user_id == usuario.id"), "o trecho deve mostrar a checagem de dono");
  })
);

teste("conteudo", "links externos seguros e com texto descritivo", () =>
  comPagina({}, async (p) => {
    const links = await p.$$eval('a[href^="http"]', (as) =>
      as.map((a) => ({
        href: a.getAttribute("href"),
        alvo: a.getAttribute("target"),
        rel: a.getAttribute("rel") || "",
        texto: a.textContent.replace(/\s+/g, " ").trim(),
      }))
    );
    exigir(links.length >= 8, `poucos links externos (${links.length})`);
    for (const l of links) {
      exigir(l.alvo === "_blank", `${l.href}: falta target=_blank`);
      exigir(l.rel.includes("noopener") && l.rel.includes("noreferrer"), `${l.href}: falta rel noopener noreferrer`);
      exigir((l.texto.match(/\p{L}/gu) || []).length >= 4, `${l.href}: texto do link não é descritivo ("${l.texto}")`);
    }
  })
);

teste("conteudo", "contatos corretos", () =>
  comPagina({}, async (p) => {
    for (const href of [
      "mailto:gustavo.silva123913@gmail.com",
      "https://www.linkedin.com/in/gustavo-bueno-da-silva-a351a33bb",
      "https://github.com/1GustavoBueno1",
      "https://wa.me/5549999615535",
    ]) {
      exigir((await p.locator(`#contato a[href="${href}"]`).count()) === 1, `falta o contato ${href}`);
    }
    exigir(
      (await p.locator('a[href="assets/curriculo-gustavo-bueno.pdf"][download]').count()) === 2,
      "o currículo deve ter 2 links com download (abertura e contato)"
    );
  })
);

teste("conteudo", "imagens com alt, marcos e seções rotuladas", () =>
  comPagina({}, async (p) => {
    const semAlt = await p.$$eval("img", (is) => is.filter((i) => !i.hasAttribute("alt")).length);
    exigir(semAlt === 0, `${semAlt} imagem(ns) sem alt`);
    for (const marco of ["header", "main", "footer", "nav"]) {
      exigir((await p.locator(marco).count()) >= 1, `falta <${marco}>`);
    }
    exigir((await p.getAttribute("a.pular", "href")) === "#conteudo", "link de pular deve apontar para #conteudo");
    exigir((await p.locator("main#conteudo").count()) === 1, "falta main#conteudo");
    const secoes = await p.$$eval("section", (ss) =>
      ss.map((s) => {
        const id = s.getAttribute("aria-labelledby");
        return { id: s.id, rotulo: id, existe: !!(id && document.getElementById(id)) };
      })
    );
    for (const id of ["inicio", "projetos", "sobre", "contato"]) {
      exigir(secoes.some((s) => s.id === id), `falta a seção #${id}`);
    }
    for (const s of secoes) exigir(s.existe, `seção #${s.id} sem aria-labelledby válido`);
  })
);

teste("conteudo", "listas de tecnologias separadas", () =>
  comPagina({}, async (p) => {
    const sobre = await p.locator("#sobre").innerText();
    exigir(/uso no dia a dia/i.test(sobre), 'falta a lista "Uso no dia a dia"');
    exigir(/estou aprendendo/i.test(sobre), 'falta a lista "Estou aprendendo"');
    const diaADia = await p.$$eval("#tec-dia li", (ls) => ls.map((l) => l.textContent.trim()));
    const aprendendo = await p.$$eval("#tec-aprendendo li", (ls) => ls.map((l) => l.textContent.trim()));
    for (const t of ["PostgreSQL", "Docker", "Alembic", "Node.js", "TypeScript", "Firebase", "GitHub Actions"]) {
      exigir(diaADia.includes(t), `"${t}" deve estar em Uso no dia a dia`);
    }
    exigir(aprendendo.includes("React"), "React deve estar em Estou aprendendo");
    exigir(!diaADia.includes("SQL"), 'não listar só "SQL"');
  })
);

teste("conteudo", "pendências (não reprova): arquivos que faltam e TODOs", () =>
  comPagina({}, async (p) => {
    const locais = await p.$$eval("[href], [src]", (es) =>
      es
        .map((e) => e.getAttribute("href") || e.getAttribute("src"))
        .filter((v) => v && !/^(https?:|mailto:|#|data:)/.test(v))
    );
    for (const rel of new Set(locais)) {
      if (!fs.existsSync(path.join(RAIZ, rel))) pendencias.push(`arquivo referenciado não existe: ${rel}`);
    }
    const ogImagem = await p.getAttribute('meta[property="og:image"]', "content").catch(() => null);
    const nomeOg = ogImagem && ogImagem.split("/Portfolio/")[1];
    if (nomeOg && !fs.existsSync(path.join(RAIZ, nomeOg))) pendencias.push(`arquivo referenciado não existe: ${nomeOg}`);
    for (const t of await p.$$eval("span.todo", (ss) => ss.map((s) => s.textContent.trim()))) {
      pendencias.push(`TODO visível na página: ${t}`);
    }
    const html = fs.readFileSync(path.join(RAIZ, "index.html"), "utf8");
    for (const m of html.matchAll(/<!--\s*TODO:\s*([\s\S]*?)-->/g)) {
      pendencias.push(`TODO em comentário: ${m[1].replace(/\s+/g, " ").trim()}`);
    }
  })
);

// ------------------------------------------------------------------- visual

// Luminância relativa e contraste, como define a WCAG 2.
function paraRgb(cor) {
  const c = cor.trim();
  let m = c.match(/^#([0-9a-f]{6})$/i);
  if (m) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
  m = c.match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
  throw new Error(`cor não reconhecida: "${cor}"`);
}

function luminancia(cor) {
  const [r, g, b] = paraRgb(cor).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contraste(a, b) {
  const [claro, escuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (escuro + 0.05);
}

const semRolagemHorizontal = (p) =>
  p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

teste("visual", "contraste AA dos tokens de cor", () =>
  comPagina({}, async (p) => {
    const t = await p.evaluate(() => {
      const estilo = getComputedStyle(document.documentElement);
      const ler = (n) => estilo.getPropertyValue(n).trim();
      return Object.fromEntries(
        ["--fundo", "--superficie", "--texto", "--texto-suave", "--acento", "--sobre-acento"].map((n) => [n, ler(n)])
      );
    });
    exigir(t["--fundo"].toLowerCase() === "#100b18", `--fundo deve ser #100b18, é "${t["--fundo"]}"`);
    const pares = [
      ["--fundo", "--texto"], ["--fundo", "--texto-suave"], ["--fundo", "--acento"],
      ["--superficie", "--texto"], ["--superficie", "--texto-suave"], ["--superficie", "--acento"],
      ["--acento", "--sobre-acento"],
    ];
    for (const [fundo, texto] of pares) {
      const razao = contraste(t[fundo], t[texto]);
      exigir(razao >= 4.5, `contraste ${texto} sobre ${fundo} = ${razao.toFixed(2)} (mínimo 4,5)`);
    }
  })
);

teste("visual", "contraste do aviso de TODO e do bloco de código", () =>
  comPagina({}, async (p) => {
    const cores = await p.evaluate(() =>
      ["span.todo", "pre.codigo"].map((sel) => {
        const e = getComputedStyle(document.querySelector(sel));
        return { sel, cor: e.color, fundo: e.backgroundColor };
      })
    );
    for (const c of cores) {
      exigir(!/rgba\(0, 0, 0, 0\)/.test(c.fundo), `${c.sel} precisa de cor de fundo própria`);
      const razao = contraste(c.cor, c.fundo);
      exigir(razao >= 4.5, `${c.sel}: contraste ${razao.toFixed(2)} (mínimo 4,5)`);
    }
  })
);

for (const largura of [320, 360, 768, 1280]) {
  teste("visual", `sem rolagem horizontal em ${largura} px`, () =>
    comPagina({ largura }, async (p) => {
      exigir(await semRolagemHorizontal(p), `a página rola na horizontal em ${largura} px`);
    })
  );
}

teste("visual", "em 320 px o trecho de código rola dentro do próprio bloco", () =>
  comPagina({ largura: 320 }, async (p) => {
    const pre = await p.$eval("pre.codigo", (e) => ({
      rola: e.scrollWidth > e.clientWidth,
      overflow: getComputedStyle(e).overflowX,
    }));
    exigir(pre.overflow === "auto", `pre.codigo com overflow-x "${pre.overflow}" (esperado "auto")`);
    exigir(pre.rola, "pre.codigo deveria ter conteúdo mais largo que o bloco em 320 px");
  })
);

const caixasDosCards = (p) =>
  p.$$eval("article.projeto", (as) =>
    as.map((a) => {
      const r = a.getBoundingClientRect();
      return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width) };
    })
  );

teste("visual", "em 1280 px: TaskFlow na largura toda, os outros em duas colunas", () =>
  comPagina({ largura: 1280 }, async (p) => {
    const grade = await p.$eval(".projetos", (e) => Math.round(e.getBoundingClientRect().width));
    const [principal, c2, c3, c4, c5] = await caixasDosCards(p);
    exigir(Math.abs(principal.w - grade) <= 2, `TaskFlow com ${principal.w}px, grade com ${grade}px`);
    exigir(c2.y === c3.y && c2.x < c3.x, "cards 2 e 3 deveriam ficar lado a lado");
    exigir(c4.y === c5.y && c4.x < c5.x, "cards 4 e 5 deveriam ficar lado a lado");
    exigir(c2.w < grade / 2 + 2, "cards da grade deveriam ocupar meia largura");
  })
);

teste("visual", "em 360 px: os cinco cards em uma coluna", () =>
  comPagina({ largura: 360 }, async (p) => {
    const cards = await caixasDosCards(p);
    exigir(new Set(cards.map((c) => c.x)).size === 1, "os cards deveriam ter a mesma margem esquerda");
    for (let i = 1; i < cards.length; i++) exigir(cards[i].y > cards[i - 1].y, "os cards deveriam ficar empilhados");
  })
);

teste("visual", "primeiro Tab foca o link de pular, visível na tela", () =>
  comPagina({}, async (p) => {
    const antes = await p.$eval("a.pular", (e) => e.getBoundingClientRect().bottom);
    exigir(antes <= 0, "o link de pular deve ficar fora da tela até receber foco");
    await p.keyboard.press("Tab");
    await p.waitForTimeout(300); // o link desliza para dentro da tela em 0,15 s
    const foco = await p.evaluate(() => {
      const e = document.activeElement;
      const r = e.getBoundingClientRect();
      return { pular: e.matches("a.pular"), topo: r.top, base: r.bottom, esquerda: r.left };
    });
    exigir(foco.pular, "o primeiro foco deve ser o link de pular");
    exigir(foco.topo >= 0 && foco.esquerda >= 0 && foco.base > foco.topo, "o link de pular deve aparecer na tela ao receber foco");
  })
);

teste("visual", "foco visível em links e botões", () =>
  comPagina({}, async (p) => {
    for (let i = 0; i < 8; i++) {
      await p.keyboard.press("Tab");
      const f = await p.evaluate(() => {
        const e = document.activeElement;
        const s = getComputedStyle(e);
        return { quem: e.textContent.trim().slice(0, 30), largura: parseFloat(s.outlineWidth), estilo: s.outlineStyle };
      });
      exigir(f.estilo !== "none" && f.largura >= 2, `"${f.quem}": outline ${f.estilo} ${f.largura}px (mínimo 2px)`);
    }
  })
);

const movimentoDosRevelados = (p) =>
  p.evaluate(() => {
    document.documentElement.classList.add("revelar-pronto");
    const duracoes = [...document.querySelectorAll("[data-revelar]")].map((e) => {
      e.classList.add("visivel");
      const s = getComputedStyle(e);
      return Math.max(...s.transitionDuration.split(",").map(parseFloat), ...s.animationDuration.split(",").map(parseFloat));
    });
    return { maior: Math.max(...duracoes), rolagem: getComputedStyle(document.documentElement).scrollBehavior };
  });

teste("visual", "movimento reduzido desliga transições e rolagem suave", async () => {
  const normal = await comPagina({}, movimentoDosRevelados);
  exigir(normal.maior > 0, "sem preferência, os blocos deveriam ter transição de entrada");
  exigir(normal.rolagem === "smooth", "sem preferência, a rolagem deveria ser suave");
  const reduzido = await comPagina({ movimentoReduzido: true }, movimentoDosRevelados);
  exigir(reduzido.maior === 0, `com movimento reduzido ainda há transição de ${reduzido.maior}s`);
  exigir(reduzido.rolagem === "auto", "com movimento reduzido a rolagem deve ser imediata");
});

teste("visual", "fonte dobrada em 640 px não corta nem estoura texto", () =>
  comPagina({ largura: 640 }, async (p) => {
    await p.evaluate(() => (document.documentElement.style.fontSize = "200%"));
    exigir(await semRolagemHorizontal(p), "a página rola na horizontal com a fonte dobrada");
    const estourados = await p.$$eval("h1, h2, h3, p, li, a, span, figcaption", (es) =>
      es
        .filter((e) => !e.closest("pre") && e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).display !== "inline")
        .map((e) => e.textContent.trim().slice(0, 40))
    );
    exigir(estourados.length === 0, `texto estourando: ${estourados.join(" | ")}`);
  })
);

teste("visual", "fonte Manrope aplicada ao corpo", () =>
  comPagina({}, async (p) => {
    const familia = await p.evaluate(() => getComputedStyle(document.body).fontFamily);
    exigir(/^"?Manrope"?/.test(familia), `font-family do body começa com ${familia.split(",")[0]}`);
  })
);

// ------------------------------------------------------------------- script

const visivel = (p, seletor) => p.locator(seletor).first().isVisible();

for (const largura of [360, 1280]) {
  teste("script", `sem JavaScript em ${largura} px: nada escondido e menu aberto`, () =>
    comPagina({ largura, js: false }, async (p) => {
      const opacidades = await p.$$eval("[data-revelar]", (es) => es.map((e) => getComputedStyle(e).opacity));
      exigir(opacidades.length >= 8, `esperava 8 ou mais blocos com data-revelar, achei ${opacidades.length}`);
      exigir(opacidades.every((o) => o === "1"), "sem JavaScript todo bloco deve ter opacidade 1");
      for (const alvo of ["#projetos", "#sobre", "#contato"]) {
        exigir(await visivel(p, `nav#menu a[href="${alvo}"]`), `sem JavaScript o link ${alvo} deve estar visível`);
      }
      exigir(!(await visivel(p, "#menu-botao")), "sem JavaScript o botão de menu não deve aparecer");
    })
  );
}

teste("script", "menu no celular: abre, fecha com Esc e fecha ao escolher um link", () =>
  comPagina({ largura: 360 }, async (p, { erros }) => {
    const expandido = () => p.getAttribute("#menu-botao", "aria-expanded");
    exigir(await visivel(p, "#menu-botao"), "com JavaScript o botão de menu deve aparecer no celular");
    exigir(!(await visivel(p, 'nav#menu a[href="#sobre"]')), "o menu deve começar fechado");
    exigir((await expandido()) === "false", "aria-expanded deve começar em false");

    await p.click("#menu-botao");
    exigir((await expandido()) === "true", "depois do clique, aria-expanded deve ser true");
    exigir(await visivel(p, 'nav#menu a[href="#sobre"]'), "depois do clique o menu deve aparecer");

    await p.keyboard.press("Escape");
    exigir((await expandido()) === "false", "Esc deve fechar o menu");
    exigir(await p.evaluate(() => document.activeElement.id === "menu-botao"), "Esc deve devolver o foco ao botão");

    await p.focus("#menu-botao");
    await p.keyboard.press("Enter");
    exigir((await expandido()) === "true", "Enter no botão deve abrir o menu");
    await p.click('nav#menu a[href="#sobre"]');
    exigir((await expandido()) === "false", "escolher um link deve fechar o menu");
    exigir(erros.length === 0, `erros no console: ${erros.join(" | ")}`);
  })
);

teste("script", "em 1280 px o menu fica aberto e sem botão", () =>
  comPagina({ largura: 1280 }, async (p) => {
    exigir(!(await visivel(p, "#menu-botao")), "no desktop o botão de menu não deve aparecer");
    for (const alvo of ["#projetos", "#sobre", "#contato"]) {
      exigir(await visivel(p, `nav#menu a[href="${alvo}"]`), `no desktop o link ${alvo} deve estar visível`);
    }
  })
);

teste("script", "ano do rodapé acompanha o relógio", () =>
  // Relógio adiantado para 2031: o "2026" escrito no HTML não basta para passar.
  comPagina({ antes: (p) => p.clock.setFixedTime(new Date("2031-03-01T12:00:00")) }, async (p) => {
    const ano = await p.innerText("#ano");
    exigir(ano === "2031", `com o relógio em 2031, #ano mostra "${ano}"`);
  })
);

teste("script", "seção ativa marcada na navegação", () =>
  comPagina({ largura: 1280 }, async (p, { erros }) => {
    const ativos = () =>
      p.$$eval('nav#menu a[aria-current="true"]', (as) => as.map((a) => a.getAttribute("href")));
    exigir((await ativos()).length === 0, "no topo da página nenhum link deve estar ativo");
    for (const id of ["sobre", "contato", "projetos"]) {
      await p.evaluate((alvo) => document.getElementById(alvo).scrollIntoView({ behavior: "instant" }), id);
      await p.waitForTimeout(400);
      const agora = await ativos();
      exigir(agora.length === 1 && agora[0] === `#${id}`, `em #${id} o link ativo deveria ser só #${id}, é [${agora}]`);
    }
    exigir(erros.length === 0, `erros no console: ${erros.join(" | ")}`);
  })
);

teste("script", "blocos entram na tela ao rolar e nenhum fica escondido", () =>
  comPagina({ largura: 360 }, async (p, { erros }) => {
    exigir(await p.evaluate(() => document.documentElement.classList.contains("revelar-pronto")), "o script deve marcar html.revelar-pronto");
    const total = await p.locator("[data-revelar]").count();
    const escondidosNoInicio = await p.$$eval("[data-revelar]", (es) => es.filter((e) => getComputedStyle(e).opacity === "0").length);
    exigir(escondidosNoInicio > 0, "blocos fora da tela deveriam começar escondidos");
    for (let i = 0; i < total; i++) {
      await p.locator("[data-revelar]").nth(i).evaluate((e) => e.scrollIntoView({ behavior: "instant", block: "start" }));
      await p.waitForTimeout(900);
      const opacidade = await p.locator("[data-revelar]").nth(i).evaluate((e) => getComputedStyle(e).opacity);
      exigir(opacidade === "1", `bloco ${i + 1} de ${total} ficou com opacidade ${opacidade} depois de entrar na tela`);
    }
    exigir(erros.length === 0, `erros no console: ${erros.join(" | ")}`);
  })
);

teste("script", "com movimento reduzido o script não esconde nada", () =>
  comPagina({ largura: 360, movimentoReduzido: true }, async (p) => {
    const opacidades = await p.$$eval("[data-revelar]", (es) => es.map((e) => getComputedStyle(e).opacity));
    exigir(opacidades.every((o) => o === "1"), "com movimento reduzido todo bloco deve ter opacidade 1");
  })
);

// ----------------------------------------------------------------- execução

const grupoPedido = process.argv[2];
const aRodar = testes.filter((t) => !grupoPedido || t.grupo === grupoPedido);
if (aRodar.length === 0) {
  console.error(`Nenhum teste no grupo "${grupoPedido}".`);
  process.exit(1);
}

navegador = await chromium.launch();
let falhas = 0;
for (const t of aRodar) {
  try {
    await t.fn();
    console.log(`  ok    [${t.grupo}] ${t.nome}`);
  } catch (e) {
    falhas++;
    console.log(`  FALHA [${t.grupo}] ${t.nome}\n          ${String(e.message).split("\n")[0]}`);
  }
}
await navegador.close();

console.log(`\n${aRodar.length - falhas} de ${aRodar.length} testes passaram.`);
if (pendencias.length) {
  console.log("\nPendências:");
  for (const item of pendencias) console.log(`  - ${item}`);
}
process.exit(falhas ? 1 : 0);
