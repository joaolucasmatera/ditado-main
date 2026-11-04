# DitadoApp

Aplicação web para criação e realização de ditados (frontend) construída com Vite e Vue.js. Este repositório contém a interface do projeto: componentes, views e serviços que consomem APIs.

## Funcionalidades principais

- Autenticação de usuários
- Gerenciamento de categorias e ditados
- Criação e realização de ditados
- Visualização de resultados
- Administração de turmas e usuários

## Pré-requisitos

- Node.js (versão LTS recomendada)
- npm (ou yarn)

## Instalação e execução (desenvolvimento)

Abra um terminal na raiz do projeto e execute:

```powershell
npm install
npm run dev
```

O servidor de desenvolvimento padrão do Vite iniciará e informará a URL (normalmente `http://localhost:5173`).

Para gerar a build de produção:

```powershell
npm run build
npm run preview
```

## Estrutura do projeto (resumo)

- `index.html` — entrada HTML
- `package.json` — scripts e dependências
- `src/` — código-fonte da aplicação
  - `main.js` — ponto de bootstrap do Vue
  - `App.vue` — componente raiz
  - `router/` — definições de rotas (`src/router/index.js`)
  - `stores/` — stores (Pinia) como `auth.js` e `turmas.js`
  - `services/` — camadas que conversam com a API (ex.: `api.js`, `usuarioService.js`, `ditadoService.js`, `categoriaService.js`, `turmaService.js`, `alunoService.js`, `solicitacaoIngressoService.js`)
  - `components/` — componentes reutilizáveis (`BarraSuperior.vue`, `MenuLateral.vue`)
  - `layouts/` — layouts compartilhados (`LayoutPrincipal.vue`)
  - `views/` — páginas/rotas (ex.: `Login.vue`, `Home.vue`, `Cadastro.vue`, `RealizarDitado.vue`, `ResultadoDitado.vue`, `Turmas.vue`)

## Serviços / Integração com API

As chamadas à API estão centralizadas em `src/services/api.js`. Cada recurso possui seu próprio service, por exemplo:

- `src/services/usuarioService.js` — operações relacionadas a usuários
- `src/services/ditadoService.js` — criação e obtenção de ditados
- `src/services/categoriaService.js` — categorias de ditados
- `src/services/turmaService.js` — gestão de turmas
- `src/services/alunoService.js` — operações sobre alunos
- `src/services/solicitacaoIngressoService.js` — solicitações de ingresso em turma

Ajuste a URL base da API em `src/services/api.js` conforme o ambiente (desenvolvimento / produção).

## Rodando localmente - dicas

- Verifique a variável de ambiente ou constante onde a URL da API é definida (em `src/services/api.js`).
- Se a API exigir CORS, habilite para o domínio do frontend ou use um proxy durante o desenvolvimento.

## Como contribuir

1. Faça um fork deste repositório e crie uma branch com um nome descritivo.
2. Instale dependências e execute o projeto localmente.
3. Abra um Pull Request descrevendo as mudanças e o motivo.

## Testes

Atualmente não há uma suíte de testes automatizados adicionada ao repositório. Sugestão: adicionar testes unitários com Vitest e testes de integração com Cypress.

## Licença

Nenhuma licença especificada neste repositório. Se for um projeto público, adicione um arquivo `LICENSE` com a licença desejada (ex.: MIT).

## Contato

Para dúvidas, abra uma issue ou contate os mantenedores do projeto.
