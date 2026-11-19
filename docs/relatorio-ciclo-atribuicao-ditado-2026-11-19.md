# Atribuição de ditado a uma turma

O ditado recém-criado aparecia como “Instituição” mesmo quando a API devolvia visibilidade nula. O diálogo tentava atribuí-lo diretamente e exibia um erro genérico ao receber a recusa por falta de publicação vigente.

`src/views/Ditados.vue` exibe “Não publicado” e oferece ao autor a ação “Publicar para esta turma e atribuir”. `src/services/ditadoService.js` usa a rota existente de visibilidade com a escola do vínculo e apenas a turma selecionada. O diálogo consulta a biblioteca antes de publicar para preservar a publicação vigente que já consegue observar. Se a publicação for concluída e a atribuição falhar, a tela informa os dois resultados. O servidor mantém a validação de escola, turma e publicação. O fluxo não oferece alteração automática do alcance de publicações existentes.

O teste `tests/e2e/atribuir-ditado-turma.e2e.js` reproduziu HTTP 400 antes da publicação, verificou o rótulo e a atribuição pela tela para a turma escolhida e confirmou a recusa legível para outra turma, com uma única publicação. Execute com `E2E_API_URL` e `E2E_BASE_URL` de um ambiente sintético. A validação local usou API 5067, frontend 5197 e MySQL de teste. Evidência em `work/logs/atribuir-ditado-playwright.log` no backend.
