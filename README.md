## Meu Portfolio

Site estático de uma página, em português, publicado no GitHub Pages:
https://1gustavobueno1.github.io/Portfolio/

Feito com HTML, CSS e JavaScript puros, sem framework e sem etapa de build.

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `index.html` | Todo o conteúdo da página |
| `style.css` | Visual: fundo branco, roxo nos títulos e faixas, dourado nos detalhes, mobile primeiro |
| `script.js` | Ano do rodapé, prévia do índice de projetos e entrada suave dos blocos. A página funciona sem ele |
| `assets/retrato-gustavo.webp` | Retrato antigo (não aparece mais na página) |
| `assets/tela-*.webp` | Telas reais dos sistemas, capturadas rodando localmente com dados de exemplo |
| `assets/mapa-lebon-regis.webp` | Mapa de Santa Catarina com Lebon Régis em destaque (CC BY 2.5, crédito no rodapé) |
| `assets/credits.json` | Origem e licença das imagens de terceiros |
| `assets/favicon.svg` | Ícone da aba |
| `assets/og-image.png` | Imagem que aparece ao compartilhar o link (1200×630) |
| `tests/verificar.mjs` | Verificador automático (não faz parte do site) |
| `docs/` | Especificação e plano do site |

As fontes são Bricolage Grotesque (títulos) e Figtree (texto), carregadas do Google Fonts.

## Ver o site no computador

Abra o `index.html` no navegador. Se preferir um servidor local:

```bash
python3 -m http.server 4173
```

Depois acesse `http://localhost:4173`.

## Verificador

`tests/verificar.mjs` abre a página no Chromium e confere conteúdo (frases e links
proibidos, contatos, autoria), visual (contraste, larguras de 320 a 1280 px, foco,
movimento reduzido) e o comportamento do script, inclusive com JavaScript desligado.

Precisa de Node.js e do Playwright com o Chromium instalados.

```bash
node tests/verificar.mjs
```

Para rodar só um grupo, passe `conteudo`, `visual` ou `script`:

```bash
node tests/verificar.mjs conteudo
```

No fim ele lista as pendências: arquivos referenciados que não existem e os TODOs.

## Publicar no GitHub Pages

1. Junte as mudanças na branch `main` (por pull request ou merge).
2. No repositório, abra **Settings > Pages**.
3. Em **Build and deployment > Source**, escolha **Deploy from a branch**.
4. Em **Branch**, escolha `main` e a pasta `/ (root)`, e clique em **Save**.
5. Aguarde um ou dois minutos e abra https://1gustavobueno1.github.io/Portfolio/

Se o Pages já estava configurado assim, basta o passo 1: cada mudança na `main` é
publicada sozinha.

## Pendências

- [ ] Autocelesc: revisar o repositório antes de linkar no card.
- [ ] TaskFlow: no front em React, trocar o token fixo pelo token do login. Depois
      linkar o repositório `TaskFlow-API-FrontEnd` no card.
- [ ] TaskFlow: criar um README no repositório `TaskFlow-FastAPI`.
- [ ] Prints ou GIFs dos projetos e foto para a seção Sobre (opcionais).
