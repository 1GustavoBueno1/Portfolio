# Redesign do Portfólio — Editorial Verde-Escuro

**Data:** 2026-07-13
**Status:** Aprovado pelo usuário

## Objetivo

Recriar o portfólio do zero com novo design, mantendo exatamente o mesmo conteúdo real
(textos, projetos, links e contatos já existentes no site atual). Nenhuma informação
pessoal nova pode ser inventada.

## Decisões aprovadas

- **Paleta:** fundo verde-escuro profundo (quase preto-esverdeado), texto branco/off-white,
  verde mais claro (sálvia/menta) apenas como cor de acento.
- **Estilo:** editorial elegante — tipografia grande como protagonista, muito respiro,
  ornamentação mínima. Sem vidro, brilhos ou gradientes chamativos.
- **Conteúdo:** mesmas seções e mesmos textos do site atual, apenas design novo.

## Arquitetura

Mesma estrutura de arquivos, sem frameworks nem build:

- `index.html` — página única com Hero, Sobre, Skills, Projetos, Contato.
- `css.css` — design system novo (tokens de cor/tipografia, layout, responsivo).
- `script.js` — interações: reveal on scroll, menu mobile, seção ativa na navbar,
  formulário mailto, ano no rodapé. Vanilla JS, sem dependências.

## Design

### Tipografia
- Display serifada (Fraunces ou Playfair Display) para títulos grandes.
- Sans limpa (ex.: Inter) para corpo.
- Rótulos/números de seção em caixa alta com letter-spacing largo, estilo revista.

### Seções (conteúdo real preservado)
1. **Hero** — nome enorme em serifa, subtítulo "desenvolvedor Python focado em automação
   de processos, APIs e sistemas backend", indicador "Disponível para novos projetos",
   CTA "Ver projetos →".
2. **Sobre** — dois parágrafos atuais + 3 destaques (Playwright ponta a ponta,
   APIs REST com FastAPI & Flask, JWT/pytest/deploy). Duas colunas no desktop.
3. **Skills** — 4 categorias atuais (Linguagens & Backend, Segurança & Qualidade,
   Automação, Dados & Infra) como lista editorial com réguas horizontais finas.
4. **Projetos** — AutoCelesc, Task-Flow Web, Task-Flow API como entradas numeradas
   (01/02/03), descrições atuais, tags e mesmos links (GitHub / app no Railway).
5. **Contato** — GitHub, LinkedIn, e-mail (link Gmail compose) + formulário com
   comportamento mailto atual.

### Acessibilidade / SEO
- Meta tags e Open Graph mantidos (atualizando theme-color para o novo verde).
- Skip-link, aria-labels, foco visível, `prefers-reduced-motion` respeitado.
- Contraste branco sobre verde-escuro ≥ WCAG AA.

## Fora de escopo

- Backend para o formulário (permanece mailto).
- Novas seções, textos ou informações pessoais.
- Frameworks, bundlers ou dependências.
