---
name: verify
description: Como rodar e verificar este portfólio estático (HTML/CSS/JS puro, sem build)
---

# Verificação do portfólio

Site estático sem build: `index.html` + `css.css` + `script.js`.

## Servir

```powershell
python -m http.server 8377 --directory "C:\Users\Usuario\Documents\vscode\Portfolio"
```

## Dirigir com Playwright

Instalar em um diretório temporário (não no repo): `npm i playwright && npx playwright install chromium`,
depois um script Node com `chromium.launch()` apontando para `http://localhost:8377/`.

Fluxos que valem verificar:
- Hero renderiza (fontes Google: Fraunces / Instrument Sans / Fragment Mono — exigem rede).
- Scrollspy: clicar cada link da navbar → `.nav__link.is-active` correspondente; voltar ao topo limpa o ativo.
- Menu mobile (viewport 390px): toggle abre/fecha, Escape fecha, clicar link fecha.
- Formulário: submit vazio → feedback de erro; preenchido → feedback de sucesso + `mailto:` (não navega em headless, só o feedback muda).
- `document.documentElement.scrollWidth > innerWidth` deve ser `false` (sem overflow horizontal) em 1440px e 390px.
- `reducedMotion: "reduce"` no contexto → todos os `.reveal` visíveis imediatamente.

## Pegadinhas

- Os reveals têm transição de 700ms — esperar ~900ms após o load antes de screenshot, ou forçar
  `classList.add("is-visible")` em todos os `[data-reveal]` para fullPage screenshot.
- Scroll suave (`scroll-behavior: smooth`) leva ~1s — esperar ≥1200ms após clicar link de âncora.
