# Portfólio Backend (refeito do zero) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o portfólio atual por uma página única estática, em pt-BR, com textos conferidos nos repositórios e tema escuro roxo.

**Architecture:** Um `index.html` com todo o conteúdo, um `style.css` mobile primeiro com tokens de cor em `:root`, e um `script.js` só de melhoria progressiva (a página funciona sem ele). Um verificador em Node + Playwright (`tests/verificar.mjs`) serve de teste: abre o `index.html` local e confere conteúdo, acessibilidade básica e responsividade.

**Tech Stack:** HTML, CSS, JavaScript puros. Fonte Manrope (Google Fonts). Verificação com Node, Playwright (já instalado no ambiente) e Lighthouse via `npx`.

**Spec:** `docs/superpowers/specs/2026-11-16-portfolio-backend-design.md`

## Global Constraints

- Sem framework, sem build, sem biblioteca no site. Uma única fonte do Google Fonts (Manrope).
- Arquivos do site: `index.html`, `style.css`, `script.js`, `assets/favicon.svg`, `assets/og-image.png`, `assets/curriculo-gustavo-bueno.pdf` (o Gustavo coloca), `README.md`.
- `lang="pt-BR"`, `theme-color` `#100b18`.
- Frases proibidas: "Sistemas que fazem o trabalho acontecer", "Tecnologia com propósito", "Python no coração", "Disponível para novos projetos", "dezenas de unidades", "desde 2025", "publicado em produção", "publicada em produção".
- Nenhum link para `railway.app`, para `dudu-checklist.web.app`, para `dudusistemas.web.app`, para `Automacao-para-contas-de-luz` nem para `TaskFlow-API-FrontEnd`. Nenhum `gustavo-silva` em URL do LinkedIn.
- Sem `<form>`. Contato por `mailto:gustavo.silva123913@gmail.com` e links diretos.
- LinkedIn: `https://www.linkedin.com/in/gustavo-bueno-da-silva-a351a33bb`. GitHub: `https://github.com/1GustavoBueno1`.
- Todo link externo tem texto descritivo (nunca só "↗"), `target="_blank"` e `rel="noopener noreferrer"`.
- Contraste de texto WCAG AA (4,5:1). Foco visível. `prefers-reduced-motion` respeitado.
- Só fatos da spec. Sem dado real de empresa ou da prefeitura.
- Commits pequenos, mensagens em português. Sem push.

## Review Focus

1. **JavaScript desligado ou com erro:** todo o conteúdo e a navegação continuam visíveis (a animação de entrada não pode esconder nada sem JS). Teste na Task 3.
2. **Tela de 320 px:** nada de rolagem horizontal na página; o trecho de código rola dentro do próprio bloco. Teste na Task 2.
3. **Só teclado:** o link "Pular para o conteúdo" é o primeiro foco; o menu do celular abre e fecha com Enter e Esc; o bloco de código recebe foco para rolar. Testes nas Tasks 2 e 3.
4. **Arquivo que ainda não existe:** `assets/curriculo-gustavo-bueno.pdf` ausente não pode passar despercebido; o verificador lista como pendência. Teste na Task 1.
5. **Zoom de 200% e movimento reduzido:** o texto não é cortado em 640 px de largura com fonte dobrada; com `prefers-reduced-motion: reduce` nenhuma transição roda. Teste na Task 2.

---

### Task 1: Verificador e `index.html` com todo o conteúdo

**Files:**
- Create: `tests/verificar.mjs`
- Rewrite: `index.html`
- Delete: `css.css`, `assets/automation-flow.jpg`

**Interfaces:**
- Produces (ids e classes usados pelas tasks seguintes): `a.pular` (href `#conteudo`), `header.topo`, `nav#menu`, `button#menu-botao` (`aria-controls="menu"`, `aria-expanded`), `main#conteudo`, seções `#inicio`, `#projetos`, `#sobre`, `#contato`, `article.projeto` (5), `article.projeto--principal` (TaskFlow), `ul.tags > li`, `p.autoria`, `pre.codigo[tabindex="0"]`, `ul.outros > li` (2), `span.todo`, `span#ano`, `[data-revelar]` nos blocos que entram com animação.
- `tests/verificar.mjs`: `node tests/verificar.mjs [grupo]`, grupos `conteudo`, `visual`, `script`, sem argumento roda todos. Sai com código 1 se algum teste falhar e imprime ao final a lista "Pendências".

- [ ] **Step 1: Escrever os testes do grupo `conteudo` em `tests/verificar.mjs`**

Abre `file://<repo>/index.html` com Playwright e confere:

```
html[lang] == "pt-BR"
title não vazio; meta description entre 50 e 160 caracteres
meta og:title, og:description, og:type, og:locale="pt_BR", og:image presentes
meta theme-color == "#100b18"; link rel="icon" aponta para assets/favicon.svg
exatamente 1 h1; h1 contém "Gustavo Bueno"
texto da página contém "Buscando vaga júnior backend remota"
texto contém "fim de 2024" e "cerca de 42 unidades"
nenhuma frase proibida de Global Constraints (comparação sem diferenciar maiúsculas)
nenhum href contém: railway.app, dudu-checklist.web.app, dudusistemas.web.app,
  Automacao-para-contas-de-luz, TaskFlow-API-FrontEnd, gustavo-silva
document.querySelectorAll("form").length == 0
article.projeto: 5, na ordem dos h3: TaskFlow, Custos da Cozinha, CheckListsDudu,
  Autocelesc, Sistema de Automação Empresarial
cada article.projeto tem 3 a 5 <li> de destaque e pelo menos 3 tags
ul.outros > li: 2
texto contém "8 endpoints" e não contém "10 endpoints"
cada a[target=_blank] tem rel com noopener e texto visível com 4+ letras
todo img tem atributo alt
existe a[href="mailto:gustavo.silva123913@gmail.com"]
existe a[href="https://www.linkedin.com/in/gustavo-bueno-da-silva-a351a33bb"]
header, main, footer e nav existem; cada section tem aria-labelledby válido
rodapé contém "© 2026"
Pendências: arquivos locais referenciados que não existem em disco; cada span.todo
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node tests/verificar.mjs conteudo`
Expected: FAIL (o `index.html` atual tem `<form>`, frases proibidas e link do Railway).

- [ ] **Step 3: Reescrever `index.html`**

Conteúdo conforme as seções "Página", "Conteúdo dos cards" e "Sobre e contato" da spec. Decisões que a spec não fixa:

- `<title>`: `Gustavo Bueno | Desenvolvedor backend júnior (Python, Node.js)`.
- Fonte: um `<link>` do Google Fonts para Manrope, pesos 500 e 700, `display=swap`, com `preconnect`.
- Trecho de código do TaskFlow: a função `editar_tarefas` copiada de `TaskFlow-FastAPI/app/models/routes/task_routes.py`, dentro de `<pre class="codigo" tabindex="0" aria-label="Trecho da API: edição de tarefa com checagem de dono"><code>`.
- Sem link de repositório no Autocelesc e sem link do front do TaskFlow: registrar cada um com comentário HTML `<!-- TODO: ... -->`.
- WhatsApp: `<span class="todo">TODO: confirmar número do WhatsApp</span>` no lugar do link.
- Currículo: `<a href="assets/curriculo-gustavo-bueno.pdf" download>` nos dois lugares (abertura e contato), seguido de `<span class="todo">TODO: adicionar o PDF em assets/</span>` no contato.
- `<script src="script.js" defer>` no fim do `head`.

- [ ] **Step 4: Apagar `css.css` e `assets/automation-flow.jpg`**

- [ ] **Step 5: Rodar e ver passar**

Run: `node tests/verificar.mjs conteudo`
Expected: PASS, com "Pendências" listando o PDF do currículo, `assets/favicon.svg`, `assets/og-image.png`, `style.css` e os `span.todo`.

- [ ] **Step 6: Commit**

`git commit -m "Reescreve o conteúdo do portfólio com textos conferidos nos repositórios"`

### Task 2: `style.css`

**Files:**
- Create: `style.css`
- Modify: `tests/verificar.mjs` (grupo `visual`)

**Interfaces:**
- Consumes: ids e classes da Task 1.
- Produces: tokens em `:root`: `--fundo: #100b18`, `--superficie`, `--borda`, `--texto`, `--texto-suave`, `--acento`, `--sobre-acento`. Classe `.revelar-pronto` em `<html>` (posta pelo script) é a única que liga a animação de `[data-revelar]`. Menu do celular: `nav#menu` escondido abaixo de 720 px só quando `html.com-js` e `button#menu-botao[aria-expanded="false"]`.

- [ ] **Step 1: Escrever os testes do grupo `visual`**

```
contraste >= 4.5 entre --fundo e cada um de: --texto, --texto-suave, --acento
contraste >= 4.5 entre --superficie e cada um de: --texto, --texto-suave, --acento
contraste >= 4.5 entre --acento e --sobre-acento
contraste >= 4.5 do texto de span.todo sobre o fundo dele
nas larguras 320, 360, 768 e 1280: document.documentElement.scrollWidth <= innerWidth
em 320: pre.codigo tem scrollWidth > clientWidth e overflow-x "auto"
em 1280: article.projeto--principal ocupa a largura da grade; os outros 4 em 2 colunas
em 360: os 5 article.projeto em 1 coluna
Tab uma vez: elemento focado é a.pular e fica visível (dentro da tela)
a:focus-visible e button:focus-visible têm outline com largura >= 2px
com emulateMedia reducedMotion "reduce": transition-duration e animation-duration
  de todo [data-revelar] valem 0s e scroll-behavior de html é "auto"
em 640 de largura com html font-size 200%: nenhum elemento de texto com
  scrollWidth > clientWidth além de pre.codigo
font-family calculada de body começa com "Manrope"
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node tests/verificar.mjs visual`
Expected: FAIL (não existe `style.css`).

- [ ] **Step 3: Escrever `style.css`**

Mobile primeiro, com pontos de quebra em 720 px e 1040 px. Sem brilhos, órbitas ou dourado. Ponto de partida dos tokens (ajustar até os testes de contraste passarem): `--superficie: #1a1326`, `--borda: #33273f`, `--texto: #f3eef8`, `--texto-suave: #b8adc4`, `--acento: #b794f6`, `--sobre-acento: #100b18`. Unidades em `rem`. Tags e código com `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`. `span.todo` com fundo âmbar e texto escuro, para ser impossível não ver.

- [ ] **Step 4: Rodar e ver passar**

Run: `node tests/verificar.mjs visual`
Expected: PASS.

- [ ] **Step 5: Conferir com os olhos**

Capturas em 360 e 1280 de largura salvas no scratchpad e lidas. Corrigir o que estiver desalinhado ou apertado.

- [ ] **Step 6: Commit**

`git commit -m "Adiciona o estilo: tema roxo, mobile primeiro, foco visível e movimento reduzido"`

### Task 3: `script.js`

**Files:**
- Create: `script.js` (substitui o atual)
- Modify: `tests/verificar.mjs` (grupo `script`)

**Interfaces:**
- Consumes: `button#menu-botao`, `nav#menu`, `span#ano`, `[data-revelar]`, classes `com-js` e `revelar-pronto` da Task 2.

- [ ] **Step 1: Escrever os testes do grupo `script`**

```
com JavaScript desligado, em 360 e 1280: todo [data-revelar] tem opacity 1;
  todos os links de nav#menu estão visíveis; button#menu-botao não está visível
com JavaScript ligado, em 360: nav#menu começa escondido;
  clique no botão -> aria-expanded "true" e menu visível;
  Esc -> aria-expanded "false" e foco de volta no botão;
  clique num link do menu -> menu fecha
com JavaScript ligado, em 1280: button#menu-botao não visível; links visíveis
span#ano contém o ano atual
depois de rolar até #sobre: o link do menu para #sobre tem aria-current="true"
  e só ele
nenhum erro no console durante os passos acima
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node tests/verificar.mjs script`
Expected: FAIL (o `script.js` atual procura o formulário e os ids antigos).

- [ ] **Step 3: Escrever `script.js`**

Um arquivo, sem dependências, em uma IIFE: marca `html.com-js`; menu (clique, Esc, clique em link); ano; seção ativa com `IntersectionObserver`; entrada dos `[data-revelar]` com `IntersectionObserver`, ligada por `html.revelar-pronto` e pulada quando `matchMedia("(prefers-reduced-motion: reduce)")` casa ou não há `IntersectionObserver`.

- [ ] **Step 4: Rodar tudo e ver passar**

Run: `node tests/verificar.mjs`
Expected: PASS nos três grupos.

- [ ] **Step 5: Commit**

`git commit -m "Adiciona o script: menu no celular, seção ativa e ano do rodapé"`

### Task 4: Favicon, imagem Open Graph e README

**Files:**
- Create: `assets/favicon.svg`, `assets/og-image.png`, `README.md`
- Modify: `index.html` (só se `og:image` precisar da URL absoluta)

- [ ] **Step 1: `assets/favicon.svg`**

Quadrado arredondado `#100b18` com "GB" em `--acento`. Menos de 1 KB.

- [ ] **Step 2: `assets/og-image.png`**

1200x630, fundo `#100b18`, nome, "Desenvolvedor backend júnior" e a linha da stack. Gerada com uma captura do Playwright de um HTML temporário no scratchpad. Menos de 100 KB. `og:image` com a URL absoluta `https://1gustavobueno1.github.io/Portfolio/assets/og-image.png`.

- [ ] **Step 3: `README.md`**

Seções: o que é, como abrir localmente, como rodar `node tests/verificar.mjs`, como publicar no GitHub Pages (Settings > Pages > Deploy from a branch > `main` / root), e a lista de pendências da spec.

- [ ] **Step 4: Rodar e ver passar**

Run: `node tests/verificar.mjs`
Expected: PASS; "Pendências" só com o PDF do currículo e os `span.todo`.

- [ ] **Step 5: Commit**

`git commit -m "Adiciona favicon, imagem de compartilhamento e README com deploy"`

### Task 5: Revisão de acessibilidade, responsividade e Lighthouse

**Files:**
- Modify: o que a revisão apontar em `index.html`, `style.css`, `script.js`

- [ ] **Step 1: Servir a pasta e rodar o Lighthouse (celular e desktop)**

Run: `python3 -m http.server 4173` em segundo plano e `npx lighthouse http://localhost:4173 --chrome-flags="--headless --no-sandbox" --output=json` com `CHROME_PATH=/opt/pw-browsers/chromium/...`.
Expected: Acessibilidade 100, Boas práticas 100, SEO 100, Desempenho >= 95. Os números reais vão para a entrega, inclusive se ficarem abaixo.

- [ ] **Step 2: Rodar o axe-core pela página (instalado só no scratchpad)**

Expected: 0 violações.

- [ ] **Step 3: Percorrer a página só com Tab em 360 e 1280**

Expected: ordem de foco igual à ordem visual; nenhum foco invisível.

- [ ] **Step 4: Corrigir o que apareceu, rodar `node tests/verificar.mjs`, commit**

`git commit -m "Ajustes da revisão de acessibilidade e desempenho"`

- [ ] **Step 5: Entrega**

Resumo com os números do Lighthouse, as pendências e as instruções de deploy.
