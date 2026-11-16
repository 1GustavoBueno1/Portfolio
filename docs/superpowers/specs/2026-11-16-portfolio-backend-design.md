# Portfólio refeito do zero: backend júnior, tema roxo

**Data:** 2026-11-16
**Status:** aprovado pelo Gustavo na conversa (estrutura, conteúdo dos cards e direção visual)

## Para que serve

Site estático em pt-BR que um recrutador técnico entenda em 30 segundos: quem é o
Gustavo, o que ele sabe fazer e as provas (projetos). Ele busca a primeira vaga júnior
backend 100% remota e também estágio remoto.

## Objetivos

- Só afirmações concretas e conferidas no código dos repositórios ou dadas pelo Gustavo.
- Autoria honesta: dizer o que ele escreveu e o que foi feito com apoio de IA.
- Publicar direto no GitHub Pages, sem build.
- Contraste WCAG AA, navegação por teclado, mobile primeiro, Lighthouse alto.

## Fora do escopo

- Formulário de contato, blog, várias páginas, modo claro, analytics.
- Consertar os repositórios dos projetos (o Gustavo faz depois).

## O que seria um fracasso

- Link morto ou para deploy fora do ar (Railway do TaskFlow).
- Texto genérico ("Sistemas que fazem o trabalho acontecer", "Tecnologia com propósito",
  "Python no coração") ou métrica inventada.
- Afirmar algo que o histórico do git desmente.
- Mostrar dado real de empresa ou da prefeitura (nomes de unidades, contratos, valores).
- Linkar o repositório do Autocelesc enquanto `perfil_celesc/` (cookies, login salvo e
  tokens) estiver no histórico.

## Restrições

- HTML, CSS e JavaScript puros. `index.html` + `style.css` + `script.js`.
- Sem bibliotecas. Uma única fonte do Google Fonts.
- O site funciona inteiro sem JavaScript.
- Mesmo repositório (`Portfolio`), mesma URL.

## Abordagens consideradas

1. **Página única estática em HTML/CSS/JS puros (escolhida).** É o que o briefing pede,
   publica sem build e carrega rápido.
2. Gerador estático ou framework (Astro, React). Descartado: o briefing proíbe build e
   framework, e uma página não justifica.
3. Várias páginas, uma por projeto. Descartado: o recrutador precisa ver tudo em 30
   segundos, e os detalhes já estão nos READMEs.

## Arquivos

```
index.html
style.css
script.js
assets/favicon.svg
assets/og-image.png                 1200x630, gerada
assets/curriculo-gustavo-bueno.pdf  o Gustavo coloca
README.md                           como rodar e publicar
```

Saem `css.css` e `assets/automation-flow.jpg`.

## Página

1. Link "Pular para o conteúdo".
2. Cabeçalho: nome e navegação (Projetos, Sobre, Contato).
3. Abertura: selo "Buscando vaga júnior backend remota", `h1` "Gustavo Bueno,
   desenvolvedor backend júnior", uma frase com a stack e "desde o fim de 2024", botões
   "Ver projetos" e "Baixar currículo (PDF)". Sem imagem.
4. **01 / Projetos:** 5 cards e, abaixo, "Outros sistemas" com 2 linhas.
5. **02 / Sobre:** até 4 frases e duas listas, "Uso no dia a dia" e "Estou aprendendo".
6. **03 / Contato:** e-mail (mailto), WhatsApp, GitHub, LinkedIn, currículo.
7. Rodapé: "© 2026 Gustavo Bueno" (o ano está no HTML; o script só atualiza).

## Conteúdo dos cards (fatos conferidos)

Cada card: nome, uma frase do problema, 3 a 5 destaques, tags, autoria quando houver
apoio de IA, links só se existirem.

1. **TaskFlow** (projeto principal, largura toda, com trecho de código real)
   - API em FastAPI com 8 endpoints, login com JWT (expira em 60 min) e senha com bcrypt.
   - Toda consulta de tarefa filtra pelo dono; tarefa de outro usuário devolve 404, e
     há teste para isso.
   - SQLAlchemy, PostgreSQL 16, migrations com Alembic, Docker Compose (API + banco).
   - 8 testes com pytest, SQLite em memória e `dependency_overrides`.
   - Versão anterior em Flask + MySQL: 3 camadas, CSRF, rate limiting, sessão.
   - Front em React + TypeScript (Vite): "em desenvolvimento", sem link.
   - Links: `TaskFlow-FastAPI` e `TaskFlow` (versão Flask). Nenhum link de deploy.
   - Trecho: `editar_tarefas`, de `app/models/routes/task_routes.py`.
2. **Custos da Cozinha, app de pesagem** (em uso na Dudu Bebidas)
   - Registra saída e sobra de cada alimento e calcula custo de produção e % de sobra.
   - Contas com decimal exato; cada saída guarda cópia da tara, do preço/kg e da taxa.
   - Relatório do dia em PDF gerado no navegador.
   - Regras do Firestore testadas no emulador; GitHub Actions publica só se os testes
     passarem.
   - Autoria: regras de cálculo e 32 testes escritos pelo Gustavo em Python; app web
     desenvolvido com apoio de IA (Claude Code).
   - Link: repositório. Sem link para o app.
3. **CheckListsDudu** (em uso na Dudu Bebidas)
   - Cinco setores com conta própria, turnos, "Sim" em item com foto só com a foto
     gravada junto (reduzida no celular), nome de quem preencheu, painel do chefe,
     limpeza automática (fotos 7 dias, respostas 30 dias).
   - Regras do Firestore testadas com Vitest e emuladores; deploy pelo GitHub Actions
     só com os testes passando.
   - Autoria: especificado, revisado e publicado pelo Gustavo; código desenvolvido com
     apoio de IA (Claude Code).
   - Link: repositório. Sem link para o site.
4. **Autocelesc**
   - Bot em Python com Playwright que baixa a 2ª via das faturas da CELESC de cerca de
     42 unidades de uma prefeitura.
   - Espera o carregamento e fecha o popup antes de clicar; unidade sem fatura é pulada
     sem parar a execução; se o download não vem, salva uma captura para depuração;
     PDFs com nome único por unidade; pausa entre ações e navegação dentro do site para
     reduzir bloqueio; retomada manual a partir do índice em que parou.
   - Sem link (ver "O que seria um fracasso"). Nenhum dado real.
5. **Sistema de Automação Empresarial** (projeto de aprendizado, sem usuários reais)
   - Node.js, TypeScript, Express 5, PostgreSQL 16 (Docker Compose).
   - Camadas Routes → Controllers → Services → Repositories; JWT com perfis ADMIN e
     FUNCIONARIO; 16 endpoints; jobs com status PENDENTE, PROCESSANDO, CONCLUIDO, ERRO;
     migrations em SQL; queries parametrizadas.
   - Ressalvas ditas no card: o status do job é atualizado pela API (não há worker) e o
     front foi feito com apoio de IA.
   - Link: repositório `webapp-de-automa-o`.

**Outros sistemas** (uma linha cada, com link do repositório)

- Controle de proteínas: saída e retorno diário de carnes, custo do dia e relatório.
  TypeScript, React, Vite, Firestore, regras testadas com Vitest. Backend (regras,
  serviços e cálculos) escrito pelo Gustavo; interface com apoio de IA.
- Cadastro de refeições por empresa: lançamento diário, fotos das notas em PDF, PDF
  mensal e fechamento do mês. React, TypeScript, Firebase. Auth, empresas e regras do
  Firestore escritos pelo Gustavo; o restante com apoio de IA.

## Sobre e contato

- Sobre: quem é, o que busca, Lebon Régis (SC), aberto a mudança de cidade e viagens,
  ensino médio até dez/2026 e trilha de Desenvolvimento de Software no SC Tec/Senai.
- Uso no dia a dia: Python, FastAPI, Flask, Node.js, TypeScript, Express, PostgreSQL,
  SQLAlchemy, Alembic, Docker, Playwright, Firebase, GitHub Actions, pytest, Git.
- Estou aprendendo: React.
- E-mail: gustavo.silva123913@gmail.com. GitHub: 1GustavoBueno1. LinkedIn:
  gustavo-bueno-da-silva-a351a33bb.

## Direção visual

- Fundo `#100b18`, cards um tom acima, texto quase branco, um único acento roxo claro.
  Sem dourado.
- Fonte Manrope (dois pesos); tags e código na monoespaçada do sistema.
- Uma coluna no celular; no desktop, TaskFlow em largura total e os outros quatro em
  grade de duas colunas.
- Sem imagem de topo, brilhos ou órbitas. Entrada suave dos blocos, desligada com
  `prefers-reduced-motion`.
- JavaScript: menu no celular, seção ativa na navegação, ano do rodapé.

## Pendências (TODO visível no site e listado na entrega)

- Currículo em PDF em `assets/`.
- WhatsApp: o número informado tem 10 dígitos; falta confirmar antes de linkar.
- Link do Autocelesc: depois de remover `perfil_celesc/` do histórico.
- Front do TaskFlow: linkar depois do conserto do token fixo.
- Prints e foto: não fornecidos; site sem imagens de projeto e sem foto.

## Fica a cargo de quem implementa

Valores exatos das cores (com contraste medido), espaçamentos, redação final das frases
dentro dos fatos acima e a imagem Open Graph.
