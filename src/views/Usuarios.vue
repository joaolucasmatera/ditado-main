<template>
  <div>
    <!-- Cabeçalho -->
    <v-card class="mb-4 mb-md-6" elevation="1">
      <v-card-text class="pa-4 pa-md-6">
        <div class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center gap-3">
          <div>
            <h1 class="text-h5 text-md-h4 font-weight-bold mb-2">
              Gerenciar Usuários
            </h1>
            <p class="text-body-2 text-md-body-1 text-grey-darken-1">
              Visualize, crie e gerencie os usuários do sistema
            </p>
          </div>
          <v-btn
            v-if="authStore.ehAdministrador"
            color="primary"
            prepend-icon="mdi-account-plus"
            class="text-none"
            @click="abrirDialogCriar"
          >
            Novo Usuário
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Abas: Usuários e Solicitações Pendentes -->
    <v-card class="mb-4 mb-md-6" elevation="1">
      <v-tabs v-model="abaSelecionada" color="primary">
        <v-tab value="usuarios">
          <v-icon start>mdi-account-multiple</v-icon>
          Usuários
        </v-tab>
        <v-tab value="solicitacoes">
          <v-icon start>mdi-bell-ring</v-icon>
          Solicitações Pendentes
          <v-chip v-if="solicitacoesPendentes.length > 0" color="error" size="small" class="ml-2">
            {{ solicitacoesPendentes.length }}
          </v-chip>
        </v-tab>
      </v-tabs>

      <v-divider></v-divider>

      <!-- Conteúdo das abas -->
      <v-window v-model="abaSelecionada">
        <!-- Aba Usuários -->
        <v-window-item value="usuarios">
          <!-- Filtros e busca -->
          <v-card elevation="0" class="mb-4">
            <v-card-text class="pa-4 pa-md-6">
              <v-row>
                <v-col cols="12" sm="6" md="6">
                  <v-text-field
                    v-model="filtros.busca"
                    label="Filtrar usuários"
                    placeholder="Nome, email ou ID"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-magnify"
                    clearable
                    hide-details
                  />
                </v-col>
                <v-col cols="12" sm="6" md="6">
                  <v-select
                    v-model="filtros.tipo"
                    label="Tipo de usuário"
                    :items="tiposUsuario"
                    item-title="title"
                    item-value="value"
                    variant="outlined"
                    density="comfortable"
                    clearable
                    hide-details
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Tabela de usuários -->
          <v-card elevation="0">
            <v-card-title class="pa-4 pa-md-6 d-flex align-center border-b">
              <v-icon class="mr-2 mr-md-3" color="grey-darken-2">mdi-account-multiple</v-icon>
              <span class="text-body-1 text-md-h6 font-weight-bold">Lista de Usuários</span>
              <v-spacer></v-spacer>
              <v-chip color="primary" variant="flat">
                {{ usuariosFiltrados.length }} usuários
              </v-chip>
            </v-card-title>

            <v-divider></v-divider>

            <!-- Loading -->
            <div v-if="carregando" class="text-center pa-12">
              <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
              <p class="text-grey mt-4">Carregando usuários...</p>
            </div>

            <!-- Lista vazia -->
            <div v-else-if="usuariosFiltrados.length === 0" class="text-center pa-12">
              <v-icon size="64" color="grey-lighten-1">mdi-account-off-outline</v-icon>
              <p class="text-body-1 text-grey mt-4">Nenhum usuário encontrado</p>
            </div>

            <!-- Tabela -->
            <v-table v-else>
              <thead>
                <tr>
                  <th class="text-left font-weight-bold">ID</th>
                  <th class="text-left font-weight-bold">Nome</th>
                  <th class="text-left font-weight-bold d-none d-sm-table-cell">Login</th>
                  <th class="text-left font-weight-bold d-none d-md-table-cell">Tipo</th>
                  <th class="text-center font-weight-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="usuario in usuariosFiltrados" :key="usuario.id">
                  <td>{{ usuario.id }}</td>
                  <td>
                    <div class="d-flex align-center">
                      <v-avatar color="primary" size="32" class="mr-2">
                        <span class="text-caption">{{ obterIniciais(usuario.nome) }}</span>
                      </v-avatar>
                      <span>{{ usuario.nome }}</span>
                    </div>
                  </td>
                  <td class="d-none d-sm-table-cell">{{ usuario.login }}</td>
                  <td class="d-none d-md-table-cell">
                    <v-chip :color="obterCorTipo(usuario.tipo)" size="small" variant="flat">
                      {{ usuario.tipo }}
                    </v-chip>
                  </td>
                  <td>
                    <div class="d-flex justify-center gap-1" style="min-width: 120px;">
                      <!-- Adicionar à turma - apenas para Alunos (visível para Admin e Professor) -->
                      <v-btn
                        v-if="usuario.tipo === 'Aluno'"
                        icon="mdi-account-plus"
                        size="small"
                        variant="text"
                        color="success"
                        title="Adicionar à turma"
                        @click="abrirDialogAdicionarTurma(usuario)"
                      />
                      <!-- Espaçador invisível para manter alinhamento quando não é Aluno -->
                      <div v-else style="width: 36px;"></div>
                      <!-- Editar - Admin pode editar qualquer um, Professor só pode editar Alunos -->
                      <v-btn
                        v-if="authStore.ehAdministrador || (authStore.ehProfessor && usuario.tipo === 'Aluno')"
                        icon="mdi-pencil"
                        size="small"
                        variant="text"
                        color="primary"
                        @click="abrirDialogEditar(usuario)"
                      />
                      <!-- Excluir - apenas Admin -->
                      <v-btn
                        v-if="authStore.ehAdministrador"
                        icon="mdi-delete"
                        size="small"
                        variant="text"
                        color="error"
                        @click="confirmarExclusao(usuario)"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-window-item>

        <!-- Aba Solicitações Pendentes -->
        <v-window-item value="solicitacoes">
          <!-- Loading -->
          <div v-if="carregandoSolicitacoes" class="text-center pa-12">
            <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
            <p class="text-grey mt-4">Carregando solicitações...</p>
          </div>

          <!-- Nenhuma solicitação -->
          <div v-else-if="solicitacoesPendentes.length === 0" class="text-center pa-12">
            <v-icon size="64" color="grey-lighten-1">mdi-bell-outline</v-icon>
            <p class="text-body-1 text-grey mt-4">Nenhuma solicitação pendente</p>
          </div>

          <!-- Lista de solicitações -->
          <div v-else class="pa-4">
            <v-row>
              <v-col v-for="solicitacao in solicitacoesPendentes" :key="solicitacao.id" cols="12">
                <v-card class="mb-2">
                  <v-card-text class="pa-4">
                    <div class="d-flex justify-space-between align-center">
                      <div>
                        <div class="d-flex align-center mb-2">
                          <v-avatar color="warning" size="40" class="mr-3">
                            <span class="text-caption">{{ obterIniciais(solicitacao.nome) }}</span>
                          </v-avatar>
                          <div>
                            <p class="text-body-2 font-weight-bold mb-1">{{ solicitacao.nome }}</p>
                            <p class="text-caption text-grey">{{ solicitacao.login }}</p>
                          </div>
                        </div>
                        <p v-if="solicitacao.matricula" class="text-caption text-grey mt-2">
                          <strong>Matrícula:</strong> {{ solicitacao.matricula }}
                        </p>
                        <p class="text-caption text-grey mt-1">
                          <strong>Solicitado em:</strong> {{ formatarData(solicitacao.dataCriacao) }}
                        </p>
                      </div>
                      <div class="d-flex gap-2">
                        <v-menu>
                          <template v-slot:activator="{ props }">
                            <v-btn
                              color="success"
                              variant="flat"
                              size="small"
                              prepend-icon="mdi-check"
                              v-bind="props"
                              class="text-none"
                            >
                              Aprovar
                            </v-btn>
                          </template>
                          <v-list density="compact">
                            <v-list-item
                              v-for="tipo in tiposAprovacao"
                              :key="tipo"
                              @click="aprovarSolicitacao(solicitacao, tipo)"
                            >
                              <v-list-item-title>Como {{ tipo }}</v-list-item-title>
                            </v-list-item>
                          </v-list>
                        </v-menu>
                        <v-btn
                          color="error"
                          variant="outlined"
                          size="small"
                          prepend-icon="mdi-close"
                          @click="rejeitarSolicitacao(solicitacao)"
                          class="text-none"
                        >
                          Rejeitar
                        </v-btn>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </v-window-item>
      </v-window>
    </v-card>

    <!-- Dialog Criar/Editar Usuário -->
    <v-dialog v-model="dialogUsuario" max-width="600" persistent>
      <v-card>
        <v-card-title class="pa-4 pa-md-6 bg-grey-lighten-5 border-b">
          <div class="d-flex align-center">
            <v-icon class="mr-2" color="grey-darken-2">
              {{ usuarioEditando ? 'mdi-account-edit' : 'mdi-account-plus' }}
            </v-icon>
            <span class="text-body-1 text-md-h6 font-weight-bold">
              {{ usuarioEditando ? 'Editar Usuário' : 'Novo Usuário' }}
            </span>
          </div>
        </v-card-title>

        <v-card-text class="pa-4 pa-md-6">
          <v-form ref="formUsuario">
            <v-row>
              <v-col cols="12">
                <label class="text-body-2 text-grey-darken-2 mb-2 d-block">Nome completo</label>
                <v-text-field
                  v-model="formDados.nome"
                  placeholder="Digite o nome"
                  variant="outlined"
                  density="comfortable"
                  :rules="[regras.obrigatorio]"
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12">
                <label class="text-body-2 text-grey-darken-2 mb-2 d-block">Login (Email)</label>
                <v-text-field
                  v-model="formDados.login"
                  placeholder="usuario@email.com"
                  type="email"
                  variant="outlined"
                  density="comfortable"
                  :rules="[regras.obrigatorio, regras.email]"
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12">
                <label class="text-body-2 text-grey-darken-2 mb-2 d-block">Tipo de usuário</label>
                <v-select
                  v-model="formDados.tipo"
                  :items="tiposUsuarioFiltrados"
                  item-title="title"
                  item-value="value"
                  variant="outlined"
                  density="comfortable"
                  :rules="[regras.obrigatorio]"
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12">
                <label class="text-body-2 text-grey-darken-2 mb-2 d-block">Matrícula</label>
                <v-text-field
                  v-model="formDados.matricula"
                  placeholder="Digite a matrícula (opcional)"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12" v-if="!usuarioEditando">
                <label class="text-body-2 text-grey-darken-2 mb-2 d-block">Senha</label>
                <v-text-field
                  v-model="formDados.senha"
                  placeholder="Mínimo 6 caracteres"
                  :type="mostrarSenha ? 'text' : 'password'"
                  variant="outlined"
                  density="comfortable"
                  :append-inner-icon="mostrarSenha ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="mostrarSenha = !mostrarSenha"
                  :rules="[regras.obrigatorio, regras.senhaMinima]"
                  hide-details="auto"
                />
              </v-col>

              <!-- Campos de alteração de senha para edição -->
              <template v-if="usuarioEditando">
                <v-col cols="12">
                  <v-divider class="my-2"></v-divider>
                  <p class="text-caption text-grey-darken-1 mb-2">Deixe em branco para não alterar a senha</p>
                </v-col>

                <v-col cols="12">
                  <label class="text-body-2 text-grey-darken-2 mb-2 d-block">Senha Atual</label>
                  <v-text-field
                    v-model="formDados.senhaAtual"
                    placeholder="Digite a senha atual"
                    :type="mostrarSenhaAtual ? 'text' : 'password'"
                    variant="outlined"
                    density="comfortable"
                    :append-inner-icon="mostrarSenhaAtual ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append-inner="mostrarSenhaAtual = !mostrarSenhaAtual"
                    hide-details="auto"
                  />
                </v-col>

                <v-col cols="12">
                  <label class="text-body-2 text-grey-darken-2 mb-2 d-block">Nova Senha</label>
                  <v-text-field
                    v-model="formDados.senhaNova"
                    placeholder="Mínimo 6 caracteres"
                    :type="mostrarSenhaNova ? 'text' : 'password'"
                    variant="outlined"
                    density="comfortable"
                    :append-inner-icon="mostrarSenhaNova ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append-inner="mostrarSenhaNova = !mostrarSenhaNova"
                    :rules="[regras.senhaMinimaOpcional]"
                    hide-details="auto"
                  />
                </v-col>
              </template>
            </v-row>
          </v-form>

          <v-alert
            v-if="erroForm"
            type="error"
            class="mt-4"
            variant="tonal"
            closable
            @click:close="erroForm = null"
          >
            {{ erroForm }}
          </v-alert>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            class="text-none"
            @click="fecharDialog"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            class="text-none"
            :loading="salvando"
            @click="salvarUsuario"
          >
            {{ usuarioEditando ? 'Salvar' : 'Criar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Confirmar Exclusão -->
    <v-dialog v-model="dialogExclusao" max-width="500">
      <v-card>
        <v-card-title class="pa-4 pa-md-6 bg-error text-white">
          <span class="text-body-1 text-md-h6 font-weight-bold">Confirmar Exclusão</span>
        </v-card-title>
        <v-card-text class="pa-4 pa-md-6">
          <p class="text-body-2 text-md-body-1 mb-4">
            Tem certeza que deseja excluir o usuário <strong>{{ usuarioParaExcluir?.nome }}</strong>?
          </p>
          <v-alert type="warning" variant="tonal" density="compact">
            Esta ação não pode ser desfeita.
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            class="text-none"
            @click="dialogExclusao = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            class="text-none"
            :loading="excluindo"
            @click="excluirUsuario"
          >
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Adicionar à Turma -->
    <v-dialog v-model="dialogAdicionarTurma" max-width="500" persistent>
      <v-card>
        <v-card-title class="pa-4 bg-success text-white">
          <span class="text-body-1 text-md-h6 font-weight-bold">
            Adicionar {{ usuarioParaAdicionarTurma?.nome }} a uma Turma
          </span>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-select
            v-model="turmaSelecionadaParaAdicionar"
            :items="turmasDisponiveis"
            item-title="nome"
            item-value="id"
            label="Selecione uma turma"
            variant="outlined"
            density="comfortable"
            :rules="[regras.obrigatorio]"
          />
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            class="text-none"
            @click="dialogAdicionarTurma = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="success"
            variant="flat"
            class="text-none"
            :loading="adicionandoTurma"
            :disabled="!turmaSelecionadaParaAdicionar"
            @click="confirmarAdicionarTurma"
          >
            Adicionar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de Confirmação para Adicionar à Turma -->
    <v-dialog v-model="dialogConfirmarAdicionar" max-width="500">
      <v-card>
        <v-card-title class="pa-4 bg-blue-lighten-5">
          <v-icon color="info" class="mr-2">mdi-help-circle</v-icon>
          Adicionar à Turma
        </v-card-title>
        <v-card-text class="pa-6">
          <p class="text-body-1">
            Deseja adicionar o aluno <strong>{{ alunoAprovado?.nome }}</strong> a uma turma agora?
          </p>
        </v-card-text>
        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-btn variant="text" @click="dialogConfirmarAdicionar = false">
            Não, depois
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="flat" @click="prosseguirParaAdicionarTurma">
            Sim, adicionar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar de sucesso -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.mensagem }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usuarioService } from '@/services/usuarioService'
import { turmaService } from '@/services/turmaService'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const usuarios = ref([])
const solicitacoesPendentes = ref([])
const carregando = ref(false)
const carregandoSolicitacoes = ref(false)
const abaSelecionada = ref('usuarios')
const filtros = ref({
  busca: '',
  tipo: null
})

const tiposUsuario = [
  { title: 'Administrador', value: 'Administrador' },
  { title: 'Professor', value: 'Professor' },
  { title: 'Aluno', value: 'Aluno' }
]

// Tipos disponíveis no formulário - Professor não pode definir como Admin
const tiposUsuarioFiltrados = computed(() => {
  if (authStore.ehAdministrador) {
    return tiposUsuario
  }
  return tiposUsuario.filter(t => t.value !== 'Administrador')
})

// Tipos disponíveis para aprovação - Professor não pode aprovar como Admin
const tiposAprovacao = computed(() => {
  if (authStore.ehAdministrador) {
    return ['Aluno', 'Professor', 'Administrador']
  }
  return ['Aluno', 'Professor']
})

const tipoParaValor = {
  'Administrador': 1,
  'Professor': 2,
  'Aluno': 3
}

const dialogUsuario = ref(false)
const dialogExclusao = ref(false)
const dialogAdicionarTurma = ref(false)
const dialogConfirmarAdicionar = ref(false)
const usuarioEditando = ref(null)
const usuarioParaExcluir = ref(null)
const alunoAprovado = ref(null)
const usuarioParaAdicionarTurma = ref(null)
const turmasDisponiveis = ref([])
const turmaSelecionadaParaAdicionar = ref(null)
const formUsuario = ref(null)
const salvando = ref(false)
const excluindo = ref(false)
const adicionandoTurma = ref(false)
const erroForm = ref(null)
const mostrarSenha = ref(false)
const mostrarSenhaAtual = ref(false)
const mostrarSenhaNova = ref(false)

const formDados = ref({
  nome: '',
  login: '',
  tipo: null,
  senha: '',
  matricula: '',
  senhaAtual: '',
  senhaNova: ''
})

const snackbar = ref({
  show: false,
  mensagem: '',
  color: 'success'
})

const regras = {
  obrigatorio: v => (v !== null && v !== undefined && v !== '') || 'Campo obrigatório',
  email: v => /.+@.+\..+/.test(v) || 'Email inválido',
  senhaMinima: v => !v || v.length >= 6 || 'Senha deve ter no mínimo 6 caracteres',
  senhaMinimaOpcional: v => !v || v.length === 0 || v.length >= 6 || 'Senha deve ter no mínimo 6 caracteres'
}

const usuariosFiltrados = computed(() => {
  let resultado = [...usuarios.value]

  if (filtros.value.busca && filtros.value.busca.trim() !== '') {
    const busca = filtros.value.busca.toLowerCase().trim()
    resultado = resultado.filter(u => 
      u.nome?.toLowerCase().includes(busca) ||
      u.login?.toLowerCase().includes(busca) ||
      u.id?.toString().includes(busca)
    )
  }

  if (filtros.value.tipo) {
    resultado = resultado.filter(u => u.tipo === filtros.value.tipo)
  }

  return resultado
})

onMounted(() => {
  buscarUsuarios()
  carregarSolicitacoesPendentes()
})

async function buscarUsuarios() {
  carregando.value = true
  try {
    const dados = await usuarioService.listarTodos()
    usuarios.value = dados
  } catch (erro) {
    console.error('Erro ao carregar usuários:', erro)
    mostrarSnackbar('Erro ao carregar usuários', 'error')
  } finally {
    carregando.value = false
  }
}

function obterIniciais(nome) {
  return nome?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U'
}

function obterCorTipo(tipo) {
  const cores = {
    'Administrador': 'error',
    'Professor': 'primary',
    'Aluno': 'success'
  }
  return cores[tipo] || 'grey'
}

function abrirDialogCriar() {
  usuarioEditando.value = null
  formDados.value = {
    nome: '',
    login: '',
    tipo: null,
    senha: '',
    matricula: '',
    senhaAtual: '',
    senhaNova: ''
  }
  erroForm.value = null
  dialogUsuario.value = true
}

function abrirDialogEditar(usuario) {
  usuarioEditando.value = usuario
  formDados.value = {
    nome: usuario.nome,
    login: usuario.login,
    tipo: usuario.tipo,
    senha: '',
    matricula: usuario.matricula || '',
    senhaAtual: '',
    senhaNova: ''
  }
  erroForm.value = null
  dialogUsuario.value = true
}

function fecharDialog() {
  dialogUsuario.value = false
  usuarioEditando.value = null
  formDados.value = {
    nome: '',
    login: '',
    tipo: null,
    senha: '',
    matricula: '',
    senhaAtual: '',
    senhaNova: ''
  }
  erroForm.value = null
}

async function salvarUsuario() {
  const { valid } = await formUsuario.value.validate()
  if (!valid) return

  salvando.value = true
  erroForm.value = null

  try {
    if (usuarioEditando.value) {
      // Para atualização, usar o schema AtualizarUsuarioRequest
      const dadosAtualizar = {
        nome: formDados.value.nome,
        matricula: formDados.value.matricula || null
      }

      // Adicionar senhas apenas se foram preenchidas
      if (formDados.value.senhaAtual && formDados.value.senhaNova) {
        dadosAtualizar.senhaAtual = formDados.value.senhaAtual
        dadosAtualizar.senhaNova = formDados.value.senhaNova
      }

      // Se o tipo foi alterado, incluir no payload
      const tipoAlterado = formDados.value.tipo !== usuarioEditando.value.tipo
      if (tipoAlterado) {
        dadosAtualizar.tipo = tipoParaValor[formDados.value.tipo]
      }

      await usuarioService.atualizar(usuarioEditando.value.id, dadosAtualizar)
      
      if (tipoAlterado) {
        mostrarSnackbar('Usuário atualizado com sucesso! O usuário precisará relogar para as novas permissões terem efeito.', 'success')
      } else {
        mostrarSnackbar('Usuário atualizado com sucesso!', 'success')
      }
    } else {
      // Para criação, usar o schema CriarUsuarioRequest
      const dadosCriar = {
        nome: formDados.value.nome,
        login: formDados.value.login,
        senha: formDados.value.senha,
        tipo: tipoParaValor[formDados.value.tipo]
      }

      if (formDados.value.matricula) {
        dadosCriar.matricula = formDados.value.matricula
      }

      await usuarioService.criar(dadosCriar)
      mostrarSnackbar('Usuário criado com sucesso!', 'success')
    }
    
    fecharDialog()
    buscarUsuarios()
  } catch (erro) {
    console.error('Erro ao salvar:', erro.response?.data || erro)
    
    if (erro.response?.data?.errors) {
      const erros = erro.response.data.errors
      const mensagensErro = Object.values(erros).flat().join(', ')
      erroForm.value = mensagensErro
    } else {
      erroForm.value = erro.response?.data?.message || erro.response?.data?.title || 'Erro ao salvar usuário'
    }
  } finally {
    salvando.value = false
  }
}

function confirmarExclusao(usuario) {
  usuarioParaExcluir.value = usuario
  dialogExclusao.value = true
}

async function excluirUsuario() {
  excluindo.value = true
  
  try {
    await usuarioService.deletar(usuarioParaExcluir.value.id)
    mostrarSnackbar('Usuário excluído com sucesso!', 'success')
    dialogExclusao.value = false
    buscarUsuarios()
  } catch (erro) {
    mostrarSnackbar('Erro ao excluir usuário', 'error')
  } finally {
    excluindo.value = false
  }
}

function mostrarSnackbar(mensagem, cor = 'success') {
  snackbar.value = {
    show: true,
    mensagem,
    color: cor
  }
}

async function carregarSolicitacoesPendentes() {
  carregandoSolicitacoes.value = true
  try {
    const dados = await usuarioService.listarSolicitacoesPendentes()
    solicitacoesPendentes.value = Array.isArray(dados) ? dados : []
  } catch (erro) {
    console.error('Erro ao carregar solicitações:', erro)
    solicitacoesPendentes.value = []
  } finally {
    carregandoSolicitacoes.value = false
  }
}

async function abrirDialogAdicionarTurma(usuario) {
  usuarioParaAdicionarTurma.value = usuario
  turmaSelecionadaParaAdicionar.value = null
  try {
    turmasDisponiveis.value = await turmaService.listarTodas()
  } catch (erro) {
    console.error('Erro ao carregar turmas:', erro)
    mostrarSnackbar('Erro ao carregar turmas', 'error')
    return
  }
  dialogAdicionarTurma.value = true
}

async function confirmarAdicionarTurma() {
  if (!turmaSelecionadaParaAdicionar.value) {
    mostrarSnackbar('Selecione uma turma', 'warning')
    return
  }

  adicionandoTurma.value = true
  try {
    const turma = turmasDisponiveis.value.find(t => t.id === turmaSelecionadaParaAdicionar.value)
    const alunosIds = turma.alunosIds || []
    
    // Adicionar o usuário à turma se for aluno
    if (usuarioParaAdicionarTurma.value.tipo === 'Aluno') {
      if (!alunosIds.includes(usuarioParaAdicionarTurma.value.id)) {
        alunosIds.push(usuarioParaAdicionarTurma.value.id)
      }
    }
    
    await turmaService.atualizar(turmaSelecionadaParaAdicionar.value, { alunosIds })
    mostrarSnackbar(`${usuarioParaAdicionarTurma.value.nome} adicionado à turma!`, 'success')
    dialogAdicionarTurma.value = false
  } catch (erro) {
    console.error('Erro ao adicionar usuário à turma:', erro)
    mostrarSnackbar('Erro ao adicionar à turma', 'error')
  } finally {
    adicionandoTurma.value = false
  }
}

async function aprovarSolicitacao(solicitacao, tipo) {
  try {
    await usuarioService.aprovarAcesso(solicitacao.id, tipo)
    mostrarSnackbar(`Solicitação aprovada como ${tipo}!`, 'success')
    
    if (tipo === 'Aluno') {
      alunoAprovado.value = solicitacao
      dialogConfirmarAdicionar.value = true
    }
    
    carregarSolicitacoesPendentes()
    buscarUsuarios()
  } catch (erro) {
    console.error('Erro ao aprovar solicitação:', erro)
    mostrarSnackbar('Erro ao aprovar solicitação', 'error')
  }
}

async function rejeitarSolicitacao(solicitacao) {
  if (confirm('Tem certeza que deseja rejeitar esta solicitação?')) {
    try {
      // Usar deletar para rejeitar (remover a solicitação)
      await usuarioService.deletar(solicitacao.id)
      mostrarSnackbar('Solicitação rejeitada!', 'success')
      carregarSolicitacoesPendentes()
    } catch (erro) {
      console.error('Erro ao rejeitar solicitação:', erro)
      mostrarSnackbar('Erro ao rejeitar solicitação', 'error')
    }
  }
}

function prosseguirParaAdicionarTurma() {
  dialogConfirmarAdicionar.value = false
  abrirDialogAdicionarTurma(alunoAprovado.value)
}

function formatarData(data) {
  if (!data) return '-'
  return new Date(data).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}
</script>

<style scoped>
.gap-1 {
  gap: 4px;
}

.gap-3 {
  gap: 12px;
}
</style>
