# Ficha de Investigador — Chamado de Cthulhu 7ª Edição (1920s)

Ficha interativa em **HTML/CSS/JS** (client-side, sem build) para *Call of Cthulhu 7e* (anos 1920), com interface em **PT-BR**.

## Uso

- Abra `index.html` diretamente no navegador, ou acesse via **GitHub Pages**.
- Os dados ficam salvos automaticamente no `localStorage` do navegador.
- Use **Exportar/Importar JSON** para backup/transferência da ficha.
- Use **Exportar PDF** para gerar/imprimir uma versão em PDF.

## GitHub Pages

1. Envie `index.html`, `styles.css` e `app.js` para o repositório (mesma pasta).
2. Em **Settings → Pages**, selecione a branch/pasta de publicação (ex.: raiz da `main`).
3. Acesse a URL publicada.

> As fontes são carregadas via CDN (requer internet para tipografia exata). Os dados de cada usuário ficam apenas no navegador/JSON exportado.

## Arquivos do app

- `index.html` — estrutura da ficha
- `styles.css` — temas (claro/escuro) e estilos/impressão
- `app.js` — regras, cálculos, persistência e exportação
