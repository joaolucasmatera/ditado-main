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

**Última atualização:** 16 de Novembro de 2025
