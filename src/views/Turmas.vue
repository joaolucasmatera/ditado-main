<template>
  <div>
    <!-- Header -->
    <v-card class="mb-6" elevation="1">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">Turmas</h1>
            <p class="text-body-1 text-grey-darken-1">
              Crie e gerencie turmas para organizar seus alunos
            </p>
          </div>
          <v-btn
            color="success"
            size="large"
            prepend-icon="mdi-plus"
            class="text-none"
            @click="abrirFormulario()"
          >
            TURMA
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Filtro e Busca -->
    <v-card class="mb-6" elevation="1">
      <v-card-text class="pa-6">
        <v-text-field
          v-model="pesquisa"
          prepend-inner-icon="mdi-magnify"
          placeholder="Filtrar turmas"
          variant="outlined"
          density="comfortable"
          @update:model-value="filtrarTurmas"
        />
      </v-card-text>
    </v-card>

    <!-- Tabela de Turmas -->
    <v-card elevation="1">
      <v-card-title class="bg-grey-lighten-5 pa-4">
        <v-icon class="mr-2">mdi-school</v-icon>
        Turmas Cadastradas
      </v-card-title>

      <v-data-table
        v-if="turmasFiltradas.length > 0"
        :headers="headers"
        :items="turmasFiltradas"
        :loading="carregando"
        class="elevation-0"
        density="comfortable"
      >
        <template v-slot:item.nome="{ item }">
          <div class="font-weight-bold">{{ item.nome }}</div>
        </template>

        <template v-slot:item.id="{ item }">
          <v-chip color="primary" size="small" variant="flat">
            <v-icon start size="x-small">mdi-identifier</v-icon>
            {{ item.id }}
          </v-chip>
        </template>

        <template v-slot:item.serie="{ item }">
          <v-chip color="secondary" size="small" variant="flat">
            {{ item.serie }}º ano
          </v-chip>
        </template>

        <template v-slot:item.descricao="{ item }">
          <div class="text-truncate" style="max-width: 300px;">
            {{ item.descricao || '-' }}
          </div>
        </template>

        <template v-slot:item.totalAlunos="{ item }">
          <v-chip color="info" variant="flat" size="small">
            {{ item.totalAlunos || 0 }}
          </v-chip>
        </template>

        <template v-slot:item.dataCriacao="{ item }">
          {{ formatarData(item.dataCriacao) }}
        </template>

        <template v-slot:item.acoes="{ item }">
          <div class="d-flex gap-2">
            <v-tooltip text="Gerenciar alunos" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-account-cog"
                  size="small"
                  variant="text"
                  color="info"
                  @click="irParaGerenciarAlunos(item)"
                />
              </template>
            </v-tooltip>
            <v-tooltip text="Visualizar detalhes" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-eye"
                  size="small"
                  variant="text"
                  color="primary"
                  @click="visualizarTurma(item)"
                />
              </template>
            </v-tooltip>
            <v-tooltip text="Editar turma" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="warning"
                  @click="editarTurma(item)"
                />
              </template>
            </v-tooltip>
            <v-tooltip text="Excluir turma" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="deletarTurma(item)"
                />
              </template>
            </v-tooltip>
          </div>
        </template>

        <template v-slot:no-data>
          <v-row class="pa-6">
            <v-col cols="12" class="text-center">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">
                mdi-school-outline
              </v-icon>
              <p class="text-h6 text-grey-darken-1 mb-2">Nenhuma turma cadastrada</p>
              <p class="text-body-2 text-grey-darken-2 mb-4">
                Crie sua primeira turma clicando no botão acima
              </p>
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                class="text-none"
                @click="abrirFormulario()"
              >
                Criar Turma
              </v-btn>
            </v-col>
          </v-row>
        </template>
      </v-data-table>

      <div v-else class="pa-6 text-center">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">
          mdi-school-outline
        </v-icon>
        <p class="text-h6 text-grey-darken-1 mb-2">Nenhuma turma encontrada</p>
        <p class="text-body-2 text-grey-darken-2">
          Nenhum resultado corresponde aos critérios de busca
        </p>
      </div>
    </v-card>

    <!-- Dialog Criar/Editar Turma -->
    <v-dialog v-model="dialogFormulario" max-width="600" persistent @keydown.esc="fecharFormulario">
      <v-card>
        <v-card-title class="bg-primary text-white pa-4">
          <v-icon class="mr-2">mdi-school</v-icon>
          {{ editando ? 'Editar Turma' : 'Criar Nova Turma' }}
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form ref="formTurma">
            <v-text-field
              v-model="formDados.nome"
              label="Nome da Turma"
              placeholder="Ex: 5º Ano A"
              variant="outlined"
              density="comfortable"
              :rules="[regras.obrigatorio]"
              class="mb-4"
            />

            <v-row class="mb-4">
              <v-col cols="12" sm="6">
                <v-select
                  v-model="formDados.serie"
                  label="Ano"
                  :items="[1, 2, 3, 4, 5, 6, 7, 8, 9]"
                  variant="outlined"
                  density="comfortable"
                  :rules="[regras.obrigatorio]"
                  hide-details="auto"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="formDados.anoLetivo"
                  label="Ano Letivo"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  :rules="[regras.obrigatorio]"
                  hide-details="auto"
                />
              </v-col>
            </v-row>

            <v-text-field
              v-model="formDados.semestre"
              label="Semestre"
              placeholder="Ex: 1º Semestre"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              hide-details="auto"
            />

            <v-textarea
              v-model="formDados.descricao"
              placeholder="Descreva a turma..."
              variant="outlined"
              density="comfortable"
              rows="3"
              class="mb-4"
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-btn
            variant="text"
            @click="fecharFormulario"
          >
            Cancelar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="flat"
            :loading="salvando"
            @click="salvarTurma"
          >
            {{ editando ? 'Atualizar' : 'Criar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Visualizar Turma -->
    <v-dialog v-model="dialogVisualizar" max-width="800" persistent @keydown.esc="dialogVisualizar = false">
      <v-card>
        <v-card-title class="bg-primary text-white pa-4 d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon class="mr-2">mdi-school</v-icon>
            {{ turmaSelecionada?.nome }}
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            color="white"
            @click="dialogVisualizar = false"
          />
        </v-card-title>

        <v-card-text class="pa-6">
          <!-- Informações da Turma -->
          <v-row class="mb-6">
            <v-col cols="12" md="6">
              <div class="text-caption text-grey-darken-1 font-weight-bold mb-1">
                Descrição
              </div>
              <p class="text-body-2">{{ turmaSelecionada?.descricao || '-' }}</p>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-caption text-grey-darken-1 font-weight-bold mb-1">
                ID da Turma
              </div>
              <v-chip color="primary" variant="flat">
                <v-icon start>mdi-identifier</v-icon>
                {{ turmaSelecionada?.id }}
              </v-chip>
            </v-col>
          </v-row>

          <v-divider class="my-6"></v-divider>

          <!-- Título da seção de alunos -->
          <div class="d-flex align-center mb-4">
            <v-icon class="mr-2" color="primary">mdi-account-multiple</v-icon>
            <span class="text-subtitle-1 font-weight-bold">Alunos ({{ turmaSelecionada?.totalAlunos || 0 }})</span>
          </div>

          <!-- Lista de Alunos -->
          <div class="mb-4">
            <v-btn
              color="success"
              prepend-icon="mdi-plus"
              size="small"
              @click="irParaInsertAluno"
            >
              Inserir Aluno
            </v-btn>
          </div>
          <div v-if="membros.length > 0">
            <v-list>
              <v-list-item
                v-for="membro in membros"
                :key="membro.id"
                class="mb-2"
              >
                <template v-slot:prepend>
                  <v-avatar color="primary">
                    {{ obterIniciaisMembro(membro) }}
                  </v-avatar>
                </template>
                <v-list-item-title>{{ membro.nome }}</v-list-item-title>
                <v-list-item-subtitle>{{ membro.email }}</v-list-item-subtitle>
                <template v-slot:append>
                  <v-btn
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    color="error"
                    @click="removerMembro(membro)"
                  />
                </template>
              </v-list-item>
            </v-list>
          </div>
          <div v-else class="text-center py-6">
            <v-icon size="48" color="grey-lighten-1" class="mb-2">
              mdi-account-multiple-outline
            </v-icon>
            <p class="text-grey-darken-1">Nenhum aluno na turma</p>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Dialog Adicionar Alunos à Turma -->
    <v-dialog v-model="dialogAdicionarAlunos" max-width="600" persistent @keydown.esc="fecharDialogAdicionarAlunos">
      <v-card>
        <v-card-title class="bg-success text-white pa-4">
          <v-icon class="mr-2">mdi-account-plus</v-icon>
          Adicionar Alunos à Turma
        </v-card-title>

        <v-card-text class="pa-6">
          <p class="text-body-2 mb-4">
            Selecione os alunos que deseja adicionar à turma {{ turmaSelecionada?.nome }}
          </p>

          <v-autocomplete
            v-model="alunosSelecionados"
            :items="alunosDisponiveis"
            item-title="nome"
            item-value="id"
            label="Selecione os alunos"
            placeholder="Buscar aluno..."
            chips
            closable-chips
            multiple
            variant="outlined"
            density="comfortable"
          />
        </v-card-text>

        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-btn variant="text" @click="fecharDialogAdicionarAlunos">
            Cancelar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="success"
            variant="flat"
            :loading="adicionandoAlunos"
            @click="confirmarAdicionarAlunos"
          >
            Adicionar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de Confirmação de Exclusão -->
    <v-dialog v-model="dialogDelete" max-width="400">
      <v-card>
        <v-card-title class="bg-red-lighten-5 pa-4">
          <v-icon color="error" class="mr-2">mdi-alert</v-icon>
          Confirmar Exclusão
        </v-card-title>
        <v-card-text class="pa-6">
          <p class="text-body-1 mb-2">
            Tem certeza que deseja excluir a turma <strong>{{ turmaSelecionada?.nome }}</strong>?
          </p>
          <p class="text-body-2 text-grey-darken-1">
            Esta ação não pode ser desfeita.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-btn variant="text" @click="dialogDelete = false">
            Cancelar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="flat"
            :loading="deletando"
            @click="confirmarDelecao"
          >
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de Confirmação de Remoção de Membro -->
    <v-dialog v-model="dialogRemoverMembro" max-width="400">
      <v-card>
        <v-card-title class="bg-red-lighten-5 pa-4">
          <v-icon color="error" class="mr-2">mdi-alert</v-icon>
          Confirmar Remoção
        </v-card-title>
        <v-card-text class="pa-6">
          <p class="text-body-1 mb-2">
            Tem certeza que deseja remover <strong>{{ membroSelecionado?.nome }}</strong> da turma?
          </p>
        </v-card-text>
        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-btn variant="text" @click="dialogRemoverMembro = false">
            Cancelar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="flat"
            @click="confirmarRemocaoMembro"
          >
            Remover
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.mensagem }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { turmaService } from '@/services/turmaService'
import { ditadoService } from '@/services/ditadoService'
import { usuarioService } from '@/services/usuarioService'
import { categoriaService } from '@/services/categoriaService'

const router = useRouter()
const authStore = useAuthStore()

const turmas = ref([])
const turmasFiltradas = ref([])
const carregando = ref(false)
const pesquisa = ref('')
const salvando = ref(false)
const deletando = ref(false)

const formTurma = ref(null)
const formDados = ref({
  nome: '',
  serie: null,
  anoLetivo: null,
  semestre: '',
  descricao: '',
  alunosIds: []
})

const dialogFormulario = ref(false)
const dialogVisualizar = ref(false)
const dialogDelete = ref(false)
const dialogRemoverMembro = ref(false)
const editando = ref(false)
const abaSelecionada = ref('alunos')

const turmaSelecionada = ref(null)
const membroSelecionado = ref(null)
const membros = ref([])
const ditadosTurma = ref([])
const solicitacoesPendentes = ref([])
const alunosDisponiveis = ref([])
const alunosSelecionados = ref([])
const dialogAdicionarAlunos = ref(false)
const adicionandoAlunos = ref(false)
const todosOsAlunos = ref([])

const categorias = ref([])

const snackbar = ref({
  show: false,
  mensagem: '',
  color: 'success'
})

const headers = [
  { title: 'Nome', key: 'nome', sortable: true },
  { title: 'ID', key: 'id', align: 'center' },
  { title: 'Série', key: 'serie', align: 'center' },
  { title: 'Alunos', key: 'totalAlunos', align: 'center' },
  { title: 'Data de Criação', key: 'dataCriacao', sortable: true },
  { title: 'Ações', key: 'acoes', sortable: false, align: 'center' }
]

const regras = {
  obrigatorio: v => (v !== null && v !== undefined && v !== '') || 'Campo obrigatório'
}

onMounted(async () => {
  await Promise.all([
    carregarTurmas(),
    carregarCategorias(),
    carregarTodosAlunos()
  ])
})

async function carregarTurmas() {
  carregando.value = true
  try {
    let dados = []
    
    // Alunos veem apenas suas turmas
    if (authStore.ehAluno) {
      dados = await turmaService.listarDosAlunos(authStore.usuario.id)
    } else {
      // Professores veem todas as turmas (ou só as deles se não for admin)
      dados = await turmaService.listarTodas(true)
    }
    
    turmas.value = dados
    filtrarTurmas()
  } catch (erro) {
    console.error('Erro ao carregar turmas:', erro)
    mostrarSnackbar('Erro ao carregar turmas', 'error')
  } finally {
    carregando.value = false
  }
}

function filtrarTurmas() {
  
  let resultado = [...turmas.value]
  
  if (pesquisa.value.trim()) {
    const termo = pesquisa.value.toLowerCase()
    resultado = resultado.filter(t =>
      t.nome.toLowerCase().includes(termo) ||
      t.id.toString().toLowerCase().includes(termo)
    )
  }

  turmasFiltradas.value = resultado
}

async function carregarCategorias() {
  try {
    categorias.value = await categoriaService.listarTodas()
  } catch (erro) {
    console.error('Erro ao carregar categorias:', erro)
  }
}

function abrirFormulario() {
  editando.value = false
  formDados.value = {
    nome: '',
    serie: null,
    anoLetivo: new Date().getFullYear(),
    semestre: '',
    descricao: '',
    alunosIds: []
  }
  dialogFormulario.value = true
}

function editarTurma(turma) {
  editando.value = true
  formDados.value = {
    nome: turma.nome,
    serie: turma.serie,
    anoLetivo: turma.anoLetivo,
    semestre: turma.semestre || '',
    descricao: turma.descricao || '',
    alunosIds: turma.alunos?.map(a => a.id) || []
  }
  turmaSelecionada.value = turma
  dialogFormulario.value = true
}

async function salvarTurma() {
  const { valid } = await formTurma.value.validate()
  if (!valid) return

  salvando.value = true
  try {
    if (editando.value) {
      // Atualizar turma existente
      await turmaService.atualizar(turmaSelecionada.value.id, {
        nome: formDados.value.nome,
        serie: formDados.value.serie,
        anoLetivo: formDados.value.anoLetivo,
        semestre: formDados.value.semestre || null,
        descricao: formDados.value.descricao || null,
        alunosIds: formDados.value.alunosIds
      })
      mostrarSnackbar('Turma atualizada com sucesso!', 'success')
    } else {
      // Criar nova turma
      await turmaService.criar({
        nome: formDados.value.nome,
        serie: formDados.value.serie,
        anoLetivo: formDados.value.anoLetivo,
        semestre: formDados.value.semestre || null,
        descricao: formDados.value.descricao || null,
        professorResponsavelId: authStore.usuario.id,
        alunosIds: formDados.value.alunosIds
      })
      mostrarSnackbar('Turma criada com sucesso!', 'success')
    }
    fecharFormulario()
    await carregarTurmas()
  } catch (erro) {
    console.error('Erro ao salvar turma:', erro)
    mostrarSnackbar('Erro ao salvar turma', 'error')
  } finally {
    salvando.value = false
  }
}

function fecharFormulario() {
  dialogFormulario.value = false
  formDados.value = {
    nome: '',
    serie: null,
    anoLetivo: null,
    semestre: '',
    descricao: '',
    alunosIds: []
  }
  turmaSelecionada.value = null
  editando.value = false
}

async function visualizarTurma(turma) {
  turmaSelecionada.value = turma
  dialogVisualizar.value = true
  await carregarDetalhesTurma(turma.id)
}

async function carregarDetalhesTurma(turmaId) {
  try {
    const turmaDetalhes = await turmaService.buscarPorId(turmaId)
    turmaSelecionada.value = turmaDetalhes
    membros.value = turmaDetalhes.alunos || []
    // ditadosTurma e solicitacoesPendentes não são retornados pela API no escopo atual
    ditadosTurma.value = []
    solicitacoesPendentes.value = []
  } catch (erro) {
    console.error('Erro ao carregar detalhes da turma:', erro)
    mostrarSnackbar('Erro ao carregar detalhes da turma', 'error')
  }
}

function deletarTurma(turma) {
  turmaSelecionada.value = turma
  dialogDelete.value = true
}

async function confirmarDelecao() {
  deletando.value = true
  try {
    await turmaService.deletar(turmaSelecionada.value.id)
    mostrarSnackbar('Turma excluída com sucesso!', 'success')
    await carregarTurmas()
    dialogDelete.value = false
  } catch (erro) {
    console.error('Erro ao deletar turma:', erro)
    mostrarSnackbar('Erro ao excluir turma', 'error')
  } finally {
    deletando.value = false
    turmaSelecionada.value = null
  }
}

function removerMembro(membro) {
  membroSelecionado.value = membro
  dialogRemoverMembro.value = true
}

async function confirmarRemocaoMembro() {
  try {
    // Remover o aluno da lista e atualizar
    const alunosIds = turmaSelecionada.value.alunos
      .map(a => a.id)
      .filter(id => id !== membroSelecionado.value.id)
    
    await turmaService.atualizar(turmaSelecionada.value.id, { alunosIds })
    await carregarDetalhesTurma(turmaSelecionada.value.id)
    mostrarSnackbar('Aluno removido da turma', 'success')
  } catch (erro) {
    console.error('Erro ao remover membro:', erro)
    mostrarSnackbar('Erro ao remover aluno', 'error')
  } finally {
    dialogRemoverMembro.value = false
  }
}

async function removerDitado(ditado) {
  if (confirm(`Deseja remover o ditado "${ditado.titulo}" da turma?`)) {
    try {
      await turmaService.removerAtribuicaoDitado(turmaSelecionada.value.id, ditado.id)
      
      // Remover da lista local
      ditadosTurma.value = ditadosTurma.value.filter(d => d.id !== ditado.id)
      
      mostrarSnackbar(`Ditado "${ditado.titulo}" removido da turma com sucesso`, 'success')
    } catch (erro) {
      console.error('Erro ao remover ditado:', erro)
      mostrarSnackbar('Erro ao remover ditado', 'error')
    }
  }
}

async function aprovarSolicitacao(solicitacao) {
  try {
    // Nota: Funcionalidade de solicitações de turma pode não estar na API
    // Esse recurso seria para alunos solicitarem entrada em turmas
    mostrarSnackbar('Função ainda não implementada na API', 'warning')
  } catch (erro) {
    console.error('Erro ao aprovar solicitação:', erro)
    mostrarSnackbar('Erro ao aprovar solicitação', 'error')
  }
}

async function rejeitarSolicitacao(solicitacao) {
  try {
    // Nota: Funcionalidade de solicitações de turma pode não estar na API
    mostrarSnackbar('Função ainda não implementada na API', 'warning')
  } catch (erro) {
    console.error('Erro ao rejeitar solicitação:', erro)
    mostrarSnackbar('Erro ao rejeitar solicitação', 'error')
  }
}

function formatarData(data) {
  return new Date(data).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

function obterIniciaisMembro(membro) {
  if (!membro || !membro.nome) return 'A'
  return membro.nome
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

function mostrarSnackbar(mensagem, cor = 'success') {
  snackbar.value = {
    show: true,
    mensagem,
    color: cor
  }
}

async function carregarTodosAlunos() {
  try {
    const alunos = await usuarioService.listarTodos()
    // Filtrar apenas alunos - tenta vários campos possíveis
    todosOsAlunos.value = alunos.filter(u => 
      u.tipoUsuario === 'Aluno' || 
      u.tipo === 'Aluno' ||
      u.tipoUsuario === 2 ||
      u.tipo === 2
    ) || []
    alunosDisponiveis.value = [...todosOsAlunos.value]
  } catch (erro) {
    console.error('Erro ao carregar alunos:', erro)
    todosOsAlunos.value = []
    alunosDisponiveis.value = []
  }
}

function irParaGerenciarAlunos(turma) {
  router.push(`/inseriraluno/${turma.id}`)
}

function irParaInsertAluno() {
  router.push(`/inseriraluno/${turmaSelecionada.value.id}`)
}

function abrirDialogAdicionarAlunos() {
  alunosSelecionados.value = []
  // Filtra apenas alunos que NÃO estão na turma
  const alunosIdsNaTurma = turmaSelecionada.value?.alunos?.map(a => a.id) || []
  alunosDisponiveis.value = todosOsAlunos.value.filter(a => !alunosIdsNaTurma.includes(a.id))
  dialogAdicionarAlunos.value = true
}

function fecharDialogAdicionarAlunos() {
  dialogAdicionarAlunos.value = false
  alunosSelecionados.value = []
}

async function confirmarAdicionarAlunos() {
  if (!turmaSelecionada.value || alunosSelecionados.value.length === 0) {
    mostrarSnackbar('Selecione pelo menos um aluno', 'warning')
    return
  }

  adicionandoAlunos.value = true
  try {
    // Combinar alunos já adicionados com os novos, evitando duplicações
    const alunosIdsAtuais = turmaSelecionada.value.alunos?.map(a => a.id) || []
    const todosAlunosIds = [...new Set([...alunosIdsAtuais, ...alunosSelecionados.value])]
    
    // Verifica quantos alunos novos foram realmente adicionados
    const novosAlunos = alunosSelecionados.value.filter(id => !alunosIdsAtuais.includes(id))
    
    await turmaService.atualizar(turmaSelecionada.value.id, { 
      alunosIds: todosAlunosIds 
    })
    
    if (novosAlunos.length > 0) {
      mostrarSnackbar(`${novosAlunos.length} aluno(s) adicionado(s) com sucesso!`, 'success')
    } else {
      mostrarSnackbar('Os alunos selecionados já estavam na turma', 'info')
    }
    
    fecharDialogAdicionarAlunos()
    await carregarDetalhesTurma(turmaSelecionada.value.id)
  } catch (erro) {
    console.error('Erro ao adicionar alunos:', erro)
    mostrarSnackbar('Erro ao adicionar alunos', 'error')
  } finally {
    adicionandoAlunos.value = false
  }
}

function getNomeCategoria(categoriaId) {
  const categoria = categorias.value.find(c => c.id === categoriaId)
  return categoria ? categoria.nome : 'Desconhecida'
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
