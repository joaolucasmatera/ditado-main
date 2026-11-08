# Integração com API Swagger - Progresso

**Data:** 16 de Novembro de 2025  
**Status:** ✅ FASE 1 - INTEGRAÇÃO CORE COMPLETA

## Resumo Executivo

Refatoração completa do frontend para integração com API Swagger do backend. Todas as referências a stores Pinia foram removidas e substituídas por chamadas diretas aos services que consomem a API real.

---

## Mudanças Realizadas

### 1. **Services (Camada de Integração com API)**

#### ✅ `api.js`
- **Status:** Já configurado corretamente
- Axios interceptor para JWT Bearer token
- Tratamento de erro 401 com logout automático
- Response interceptor configurado

#### ✅ `usuarioService.js`
- **Endpoints implementados:**
  - `POST /Usuarios/solicitar-acesso` - Cadastro público (status: AcessoSolicitado)
  - `POST /Usuarios/login` - Autenticação com JWT
  - `GET /Usuarios` - Listar todos (admin)
  - `GET /Usuarios/{id}` - Buscar usuário específico
  - `PUT /Usuarios/{id}` - Atualizar usuário
  - `DELETE /Usuarios/{id}` - Deletar usuário
  - `POST /Usuarios/{id}/aprovar-acesso` - Aprovar solicitação (admin)
  - `GET /Usuarios/solicitacoes-pendentes` - Listar pendências (admin)
  - `PATCH /Usuarios/{id}/bloquear` - Bloquear usuário
  - `PATCH /Usuarios/{id}/desbloquear` - Desbloquear usuário

#### ✅ `turmaService.js`
- **Endpoints implementados:**
  - `GET /Turmas` - Listar todas (filtrado por auth)
  - `GET /Turmas/{id}` - Detalhes com alunos
  - `POST /Turmas` - Criar nova turma
  - `PUT /Turmas/{id}` - Atualizar + gerenciar alunos (alunosIds)
  - `DELETE /Turmas/{id}` - Deletar turma
  - `GET /Turmas/professor/{professorId}` - Turmas do professor

#### ✅ `ditadoService.js`
- **Status:** Já estava correto, sem alterações necessárias
- **Endpoints:**
  - `GET /Ditados` - Listar todos
  - `GET /Ditados/{id}` - Buscar ditado
  - `GET /Ditados/{id}/realizar` - Buscar para responder (sem respostas)
  - `POST /Ditados` - Criar ditado
  - `POST /Ditados/{id}/submeter` - Submeter respostas e obter correção

---

### 2. **Views Refatoradas**

#### ✅ `Turmas.vue` - COMPLETA
- **Removido:** `useTurmaStore` import
- **Adicionado:** `useAuthStore` e `turmaService`
- **Funções atualizadas:**
  - `carregarTurmas()` → usa `turmaService.listarTodas()`
  - `salvarTurma()` → cria/atualiza com `turmaService.criar()` / `turmaService.atualizar()`
  - `confirmarDelecao()` → usa `turmaService.deletar()`
  - `carregarDetalhesTurma()` → usa `turmaService.obterPorId()`
  - `removerMembro()` → atualiza `alunosIds` via `turmaService.atualizar()`
  - `confirmarAdicionarAlunos()` → combina IDs e envia via PUT
  - `confirmarAdicionarDitados()` → comentado (API ainda não suporta)
- **Campos de Formulário:**
  - ✅ nome, serie, anoLetivo, semestre, descricao, alunosIds

#### ✅ `Usuarios.vue` - COMPLETA
- **Abas implementadas:**
  - Aba "Usuários": Lista, busca, criar, editar, deletar
  - Aba "Solicitações Pendentes": Lista pendências com menu de aprovação
- **Funções:**
  - `buscarUsuarios()` → `usuarioService.listarTodos()`
  - `carregarSolicitacoesPendentes()` → `usuarioService.listarSolicitacoesPendentes()`
  - `aprovarSolicitacao(solicitacao, tipo)` → `usuarioService.aprovarAcesso(id, tipoEnum)`
  - `rejeitarSolicitacao(solicitacao)` → `usuarioService.deletar(id)`
- **Menu de aprovação:** Escolhe entre "Aluno" ou "Professor"

#### ✅ `Cadastro.vue` - ATUALIZADA
- **Alterações:**
  - Endpoint: `usuarioService.solicitarAcesso()` (antes: `cadastrar()`)
  - Campo adicionado: `matricula` (opcional)
  - Campo renomeado: `email` → `login` (para consistência com API)
  - Status ao criar: `AcessoSolicitado` (aguardando admin)

#### ✅ `Login.vue` - MELHORADA
- **Melhorias:**
  - Melhor tratamento de erros com mensagens detalhadas
  - Redirecionamento baseado em tipo de usuário:
    - Admin → `/admin`
    - Professor → `/professor`
    - Aluno → `/aluno`
  - JWT token armazenado em localStorage automaticamente

#### ✅ `MinhasTurmas.vue` - REFATORADA
- **Removido:** `useTurmaStore`
- **Adicionado:** `turmaService`, `ditadoService`
- **Funções:**
  - `carregarMinhasTurmas()` → `turmaService.listarTodas()`
  - `solicitarEntradaTurma()` → comentado (API não suporta código de turma ainda)
  - `abrirDitadosTurma()` → `ditadoService.listarTodos()`

#### ✅ `PainelProfessor.vue` - LIMPO
- **Removido:** `useTurmaStore`
- **Mantido:** `ditadoService.listarTodos()`
- **Comentado:** Funcionalidades de solicitações (não na API)

#### ✅ `PainelAdministrador.vue` - LIMPO
- **Removido:** `useTurmaStore`
- **Mantido:** `usuarioService.listarTodos()`
- **Comentado:** Funcionalidades de solicitações (gerenciadas em Usuarios.vue)

#### ✅ `CadastroDitado.vue` - PARCIALMENTE
- **Completado:**
  - ✅ Removido opção de upload MP4
  - ✅ Mantido apenas gravação por microfone
- **Pendente:**
  - 🟡 Integração com `ditadoService.criar()`
  - 🟡 Conversão de webm para base64

#### ✅ `RealizarDitado.vue` - PARCIALMENTE
- **Completado:**
  - ✅ Removido botão "Tocar" redundante
  - ✅ Mantido apenas "Repetir"
- **Pendente:**
  - 🟡 Validação de fluxo completo

---

### 3. **Stores (Removidas/Obsoletas)**

#### ❌ `turmas.js` (Store Pinia)
- **Status:** Obsoleto, não está sendo importado em lugar nenhum
- **Pode ser removido:** Sim, sem impacto

---

## Checklist de Implementação

### ✅ Fase 1: Integração Core
- [x] Refatorar `api.js` com interceptor JWT
- [x] Implementar `usuarioService.js`
- [x] Implementar `turmaService.js`
- [x] Verificar `ditadoService.js`
- [x] Remover `useTurmaStore` de todos componentes
- [x] Atualizar `Turmas.vue`
- [x] Atualizar `Usuarios.vue`
- [x] Atualizar `Cadastro.vue`
- [x] Atualizar `Login.vue`
- [x] Atualizar `MinhasTurmas.vue`
- [x] Atualizar `PainelProfessor.vue`
- [x] Atualizar `PainelAdministrador.vue`

### 🟡 Fase 2: Integração de Ditados
- [ ] Integrar `CadastroDitado.vue` com API
- [ ] Implementar conversão webm → base64
- [ ] Testar upload de áudio
- [ ] Integrar `RealizarDitado.vue` com API
- [ ] Testar fluxo de resposta e correção
- [ ] Integrar `ResultadoDitado.vue` com API

### 🟡 Fase 3: Testes & Refinamentos
- [ ] Testar fluxo completo de cadastro → aprovação → login
- [ ] Testar CRUD de turmas
- [ ] Testar adição/remoção de alunos em turmas
- [ ] Testar criação e resolução de ditados
- [ ] Validar tratamento de erros HTTP
- [ ] Testar token refresh (se necessário)
- [ ] Testar rota guards/proteção

---

## Referência: Mapeamento de Endpoints da API

### Usuários
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/Usuarios/solicitar-acesso` | Cadastro público (status: AcessoSolicitado) |
| POST | `/Usuarios/login` | Autenticar e receber JWT |
| GET | `/Usuarios` | Listar todos (admin) |
| GET | `/Usuarios/{id}` | Detalhes do usuário |
| PUT | `/Usuarios/{id}` | Atualizar usuário |
| DELETE | `/Usuarios/{id}` | Deletar usuário |
| POST | `/Usuarios/{id}/aprovar-acesso` | Aprovar solicitação (admin) |
| GET | `/Usuarios/solicitacoes-pendentes` | Listar pendências |

### Turmas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/Turmas` | Criar turma |
| GET | `/Turmas` | Listar turmas |
| GET | `/Turmas/{id}` | Detalhes com alunos |
| PUT | `/Turmas/{id}` | Atualizar turma |
| DELETE | `/Turmas/{id}` | Deletar turma |
| GET | `/Turmas/professor/{professorId}` | Turmas do professor |

### Ditados
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/Ditados` | Criar ditado |
| GET | `/Ditados` | Listar ditados |
| GET | `/Ditados/{id}` | Detalhes do ditado |
| GET | `/Ditados/{id}/realizar` | Buscar para responder (sem gabarito) |
| POST | `/Ditados/{id}/submeter` | Submeter respostas e obter correção |

---

## Notas Técnicas

### Autenticação
- JWT Bearer token armazenado em localStorage
- Interceptor adiciona automaticamente ao header de todas requisições
- 401 triggers logout e redirecionamento a /login
- Usuário e token armazenados em `authStore`

### Turmas - Adição de Alunos
- Usar `PUT /Turmas/{id}` com payload: `{ alunosIds: [id1, id2, ...] }`
- **Importante:** Envia TODA lista de IDs (não incremental)
- Antes de adicionar novos: recuperar IDs atuais e combinar

### Ditados - Gravação de Áudio
- Formato esperado: base64
- Sem conversão necessária de webm
- Campo: `audioBase64` no payload de criação

### Tipos de Usuário
- API: 1 = Admin, 2 = Professor, 3 = Aluno, 4 = AcessoSolicitado
- Frontend: usa string "Admin", "Professor", "Aluno", "AcessoSolicitado"
- Mapeamento necessário na aprovação

---

## Próximos Passos

1. **Integrar CadastroDitado.vue:**
   - Implementar conversão de webm para base64
   - Chamar `ditadoService.criar()` com audioBase64
   - Redirecionar para lista de ditados

2. **Integrar RealizarDitado.vue:**
   - Buscar ditado via `ditadoService.buscarParaRealizar(id)`
   - Executar áudio from base64
   - Submeter respostas via `ditadoService.submeterResposta(id, respostas)`
   - Redirecionar para ResultadoDitado

3. **Atualizar ResultadoDitado.vue:**
   - Exibir dados de correção do backend
   - Mostrar pontuação, acertos, erros

4. **Adicionar Route Guards:**
   - Proteger rotas autenticadas
   - Validar tipo de usuário antes de renderizar

5. **Testes E2E:**
   - Testar fluxo completo: cadastro → aprovação → login → criar turma → adicionar alunos → criar ditado → responder → resultado

---

## Documentação Útil

- **API Swagger:** https://api-ditado.azurewebsites.net/api
- **Branch:** main
- **Repository:** kasoares/ditado

---

## Catálogo de erros — fatias de interface PER-44/PER-46

Implementada em 08/11/2026, seguindo o contrato do catálogo e o padrão visual de `Ditados.vue`:

- consulta de erros ativos com busca por nome, descrição e código;
- alternância entre itens ativos e arquivados;
- visualização de detalhes;
- arquivamento com confirmação e preservação do histórico indicada na interface;
- restauração com confirmação e atualização da lista sem duplicidade;
- detalhe identifica corretamente o estado do item conforme a aba atual (`Ativo` ou `Arquivado`);
- edição reutiliza `PublicarErro.vue`, carrega os dados por ID, mantém código/autoria/datas somente leitura e salva via `PUT /api/ErrosCatalogo/{id}`;
- seleção no formulário de Ditado usa o catálogo ativo, múltipla seleção e chips; a seleção persistida é carregada no modo edição e fica bloqueada após respostas;
- importação JSON usa `POST /api/ErrosCatalogo/importar` multipart com o campo `arquivo`, em etapas de arquivo, revisão e conclusão; o parser e as regras de schema permanecem no servidor;
- acesso à publicação pelo fluxo existente `PublicarErro.vue`;
- estados de carregamento, vazio, busca sem resultado, falha com retry e acesso negado;
- rota e menu de produto com o nome **Catálogo de erros**, sem expor o nome técnico Marketplace.

Arquivos alterados: `src/views/CatalogoErros.vue`, `src/services/catalogoErrosService.js`, `src/router/index.js` e `src/components/MenuLateral.vue`.

Próximas fatias: importação JSON (`PER-48`) e revisão UX/acessibilidade (`PER-49`). Essas telas não devem simular contratos; devem consumir os endpoints documentados no backend.

Validação: `npm run build` concluído com sucesso; `git diff --check` sem erros. O build mantém apenas o aviso preexistente de chunks grandes e depreciação da API CJS do Vite.

Correção QA P2 registrada em 08/11/2026: o chip do diálogo de detalhes deixou de fixar `Ativo` para itens arquivados.
PER-45 registrada em 08/11/2026: edição com tratamento de carregamento, sucesso, 403, 404, item arquivado e erro já utilizado.
PER-47 registrada em 08/11/2026: seleção integrada ao cadastro/edição de Ditado, sem tela isolada; `ditadoService.js` já encaminhava os payloads de criar/atualizar sem descartar `erroCatalogoIds`, portanto não precisou de alteração.
PER-48 registrada em 08/11/2026: importação em três etapas, limite local de 256 KB, tratamento de 400/401/403 e exibição de criados/rejeitados por índice, campo e motivo conforme resposta do servidor. A validação de 100 itens, `schemaVersion` 1, campos desconhecidos e duplicados não é simulada no cliente.
Integração QA registrada em 08/11/2026: o bloqueio da seleção prioriza explicitamente `DitadoResponse.PossuiRespostas === true`, indicador calculado pelo backend com `RespostaDitados.Any()`, mantendo aliases somente para compatibilidade.

PER-49 registrada em 08/11/2026: checklist de revisão UX/acessibilidade final:
- nomenclatura de produto apresentada como **Catálogo de erros** no menu, títulos, rotas e mensagens visíveis; nomes técnicos legados permanecem apenas no código interno;
- estados de carregamento, vazio, busca sem resultado, erro com retry, sucesso e acesso negado tratados nas telas revisadas;
- chips e detalhes distinguem corretamente `Ativo` e `Arquivado`, sem ação de edição para item arquivado;
- mensagens de imutabilidade preservam o histórico após respostas e explicam o bloqueio da seleção;
- labels, descrições auxiliares, foco/fechamento de diálogos, teclado e anúncios de resultado foram revisados;
- layouts existentes mantêm tabela/cards e adaptação mobile, sem depender de hover;
- nenhuma tela de backup/CAT-08 ou ação indisponível foi exposta.

Validação PER-49: `npm run build` e `git diff --check` executados com sucesso. A revisão fica aguardando parecer UX para eventuais ajustes adicionais; não houve alteração no backend nem commit.

Correções P2 da revalidação PER-49: o texto de orientação da importação agora usa o elemento explícito `#importacao-ajuda`, associado ao campo de arquivo por `aria-describedby`; as ações iconográficas da consulta agora possuem `aria-label` contextual para ver detalhes, editar, arquivar e restaurar. Aguardar nova validação QA/UX mantendo a issue em **In Review**.

**Última atualização:** 08 de Novembro de 2026

### Ajuste visual do catálogo — edição em modal

- A edição de um erro agora ocorre em modal na própria listagem `/catalogo-erros`, sem navegar para uma nova janela/rota.
- O modal reutiliza `GET /api/ErrosCatalogo/{id}` e `PUT /api/ErrosCatalogo/{id}`, com validação dos campos obrigatórios e do par de exemplos.
- Metadados técnicos (código, estado e data de alteração) foram movidos para o final do formulário com apresentação discreta e somente leitura.
- Build validado com `npm run build` em 08/11/2026.
