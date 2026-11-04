<template>
  <div>
    <!-- Header -->
    <v-card class="mb-6" elevation="1">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">Minhas Turmas</h1>
            <p class="text-body-1 text-grey-darken-1">
              Visualize suas turmas e realize os ditados disponíveis
            </p>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Abas -->
    <v-tabs v-model="abaAtiva" color="primary" class="mb-6">
      <v-tab value="turmas">
        <v-icon start>mdi-school</v-icon>
        Turmas Ativas ({{ minhasTurmas.length }})
      </v-tab>
    </v-tabs>

    <!-- Conteúdo das Abas -->
    <v-window v-model="abaAtiva">
      <!-- Turmas Ativas -->
      <v-window-item value="turmas">
        <v-row>
          <v-col
            v-if="minhasTurmas.length === 0"
            cols="12"
            class="text-center py-12"
          >
            <v-icon size="64" color="grey-lighten-1" class="mb-4">
              mdi-school-outline
            </v-icon>
            <p class="text-h6 text-grey-darken-1 mb-2">Você não está em nenhuma turma</p>
            <p class="text-body-2 text-grey-darken-2 mb-4">
              Aguarde até que um professor ou administrador o adicione a uma turma
            </p>
          </v-col>

          <v-col
            v-for="turma in minhasTurmas"
            :key="turma.id"
            cols="12"
            md="6"
            lg="4"
          >
            <v-card
              class="h-100 d-flex flex-column"
              elevation="1"
              @click="selecionarTurma(turma)"
              style="cursor: pointer;"
            >
              <v-card-title class="bg-primary text-white pb-2">
                <div class="d-flex align-center justify-space-between">
                  <span>{{ turma.nome }}</span>
                  <v-chip color="white" text-color="primary" size="small">
                    {{ turma.ditados?.length || 0 }} ditados
                  </v-chip>
                </div>
              </v-card-title>

              <v-card-text class="flex-grow-1 pa-4">
                <p class="text-body-2 text-grey-darken-1 mb-3">
                  {{ turma.descricao || 'Sem descrição' }}
                </p>

                <v-divider class="my-3"></v-divider>

                <div class="d-flex align-center gap-2 mb-3">
                  <v-icon size="small" color="grey-darken-1">mdi-key</v-icon>
                  <span class="text-caption text-grey-darken-1">
                    {{ turma.codigo }}
                  </span>
                </div>

                <div class="d-flex align-center gap-2">
                  <v-icon size="small" color="grey-darken-1">mdi-account-multiple</v-icon>
                  <span class="text-caption text-grey-darken-1">
                    {{ turma.totalAlunos || 0 }} alunos
                  </span>
                </div>
              </v-card-text>

              <v-card-actions class="pa-4 bg-grey-lighten-5">
                <v-btn
                  color="primary"
                  variant="flat"
                  width="100%"
                  class="text-none"
                  @click.stop="abrirDitadosTurma(turma)"
                >
                  Ver Ditados
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>
    </v-window>

    <!-- Dialog - Ditados da Turma -->
    <v-dialog v-model="dialogDitados" max-width="900" persistent>
      <v-card>
        <v-card-title class="bg-primary text-white pa-4 d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon class="mr-2">mdi-file-document</v-icon>
            Ditados - {{ turmaSelecionada?.nome }}
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            color="white"
            @click="dialogDitados = false"
          />
        </v-card-title>

        <v-card-text class="pa-6">
          <div v-if="ditadosTurma.length === 0" class="text-center py-8">
            <v-icon size="48" color="grey-lighten-1" class="mb-2">
              mdi-file-document-outline
            </v-icon>
            <p class="text-grey-darken-1">Nenhum ditado disponível nessa turma</p>
          </div>

          <v-row v-else>
            <v-col
              v-for="ditado in ditadosTurma"
              :key="ditado.ditadoId || ditado.id"
              cols="12"
              md="6"
            >
              <v-card elevation="2" class="ditado-card h-100 d-flex flex-column" hover>
                <v-card-text class="pa-6 flex-grow-1">
                  <div class="d-flex align-start mb-4">
                    <v-avatar color="primary" size="56" class="mr-4">
                      <v-icon size="32" color="white">mdi-headphones</v-icon>
                    </v-avatar>
                    
                    <div class="flex-grow-1">
                      <h3 class="text-h6 font-weight-bold mb-1">{{ ditado.titulo }}</h3>
                      
                      <p class="text-body-2 text-grey-darken-1 mb-2">
                        {{ ditado.descricao || 'Sem descrição' }}
                      </p>

                      <!-- Categorias -->
                      <div v-if="ditado.categoriasNomes && ditado.categoriasNomes.length > 0" class="d-flex gap-1 flex-wrap mb-2">
                        <v-chip
                          v-for="catNome in ditado.categoriasNomes"
                          :key="catNome"
                          size="x-small"
                          variant="outlined"
                          color="secondary"
                        >
                          {{ catNome }}
                        </v-chip>
                      </div>
                    </div>
                  </div>

                  <v-divider class="my-3"></v-divider>

                  <!-- Informações do ditado -->
                  <v-row dense class="text-caption mb-3">
                    <v-col cols="6">
                      <div class="d-flex align-center text-grey-darken-1 mb-1">
                        <v-icon size="14" class="mr-1">mdi-format-text</v-icon>
                        {{ ditado.palavrasOmitidas || 0 }} palavras
                      </div>
                    </v-col>
                    
                    <v-col cols="6" class="text-right">
                      <div v-if="ditado.dataLimite" :class="isAtrasado(ditado.dataLimite) ? 'text-error' : 'text-grey-darken-1'">
                        <v-icon size="14" class="mr-1">mdi-calendar-clock</v-icon>
                        {{ formatarData(ditado.dataLimite) }}
                      </div>
                    </v-col>
                  </v-row>

                  <!-- Status de Tentativa -->
                  <div v-if="ditado.status?.jaTentou" class="bg-grey-lighten-4 pa-2 rounded text-center">
                    <span class="text-caption text-grey-darken-2">Melhor Nota: </span>
                    <span class="font-weight-bold" :class="getCorNota(ditado.status.melhorNota)">
                      {{ ditado.status.melhorNota.toFixed(1) }}%
                    </span>
                  </div>

                </v-card-text>
                
                <v-card-actions class="pa-4 pt-0">
                  <v-btn
                    block
                    :color="ditado.status?.jaTentou ? 'secondary' : 'primary'"
                    variant="flat"
                    prepend-icon="mdi-play"
                    @click="iniciarDitado(ditado)"
                  >
                    {{ ditado.status?.jaTentou ? 'Tentar Novamente' : 'Iniciar Ditado' }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.mensagem }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { turmaService } from '@/services/turmaService'
import { alunoService } from '@/services/alunoService'
import { categoriaService } from '@/services/categoriaService'

const router = useRouter()
const authStore = useAuthStore()

const minhasTurmas = ref([])
const solicitacoesPendentes = ref([])
const ditadosTurma = ref([])
const carregando = ref(false)

const categorias = ref([])

const abaAtiva = ref('turmas')
const dialogDitados = ref(false)
const turmaSelecionada = ref(null)

const snackbar = ref({
  show: false,
  mensagem: '',
  color: 'success'
})

const regras = {
  obrigatorio: v => (v !== null && v !== undefined && v !== '') || 'Campo obrigatório'
}

onMounted(async () => {
  await carregarDados()
})

async function carregarDados() {
  carregando.value = true
  try {
    await Promise.all([
      carregarMinhasTurmas(),
      carregarSolicitacoesPendentes(),
      carregarCategorias()
    ])
  } catch (erro) {
    console.error('Erro ao carregar dados:', erro)
    mostrarSnackbar('Erro ao carregar dados', 'error')
  } finally {
    carregando.value = false
  }
}

async function carregarCategorias() {
  try {
    categorias.value = await categoriaService.listarTodas()
  } catch (erro) {
    console.error('Erro ao carregar categorias:', erro)
  }
}async function carregarMinhasTurmas() {
  try {
    // Obter o ID do aluno logado atualmente
    const alunoId = authStore.usuario?.id
    
    if (!alunoId) {
      console.error('Usuário não autenticado')
      mostrarSnackbar('Erro: usuário não autenticado', 'error')
      return
    }
    // Chamar a função da API que retorna apenas as turmas do aluno
    const turmas = await turmaService.listarDosAlunos(alunoId)
    minhasTurmas.value = turmas
  } catch (erro) {
    console.error('Erro ao carregar minhas turmas:', erro)
    mostrarSnackbar('Erro ao carregar turmas', 'error')
  }
}

async function carregarSolicitacoesPendentes() {
  try {
    // Endpoint seria para listar solicitações pendentes do aluno
    // Por enquanto deixaremos vazio
    solicitacoesPendentes.value = []
  } catch (erro) {
    console.error('Erro ao carregar solicitações:', erro)
  }
}

async function abrirDitadosTurma(turma) {
  turmaSelecionada.value = turma
  try {
    // Carregar ditados atribuídos à turma do aluno usando o serviço correto
    ditadosTurma.value = await alunoService.listarDitadosDaTurma(turma.id)
    console.log(`Ditados carregados para turma ${turma.nome}:`, ditadosTurma.value)
  } catch (erro) {
    console.error('Erro ao carregar ditados da turma:', erro)
    mostrarSnackbar('Erro ao carregar ditados', 'error')
  }
  dialogDitados.value = true
}

function selecionarTurma(turma) {
  abrirDitadosTurma(turma)
}

function iniciarDitado(ditado) {
  // A API retorna ditadoId ao invés de id
  const id = ditado.ditadoId || ditado.id
  router.push(`/realizar-ditado/${id}`)
}

function formatarData(data) {
  if (!data) return '--/--/----'
  return new Date(data).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

function isAtrasado(dataLimite) {
  if (!dataLimite) return false
  return new Date(dataLimite) < new Date()
}

function mostrarSnackbar(mensagem, cor = 'success') {
  snackbar.value = {
    show: true,
    mensagem,
    color: cor
  }
}

function getCorNota(nota) {
  if (nota >= 70) return 'text-success'
  if (nota >= 50) return 'text-warning'
  return 'text-error'
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}

.border {
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.border:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.ditado-card {
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
}

.ditado-card:hover {
  transform: translateY(-4px);
}
</style>
