<template>
  <v-container class="py-6">
    <v-row>
      <v-col cols="12">
        <v-card elevation="0" class="mb-6">
          <v-card-title class="bg-primary text-white pa-4">
            <v-icon class="mr-2">mdi-account-cog</v-icon>
            Gerenciar Alunos
          </v-card-title>

          <v-card-text class="pa-6">
            <!-- Campo de busca -->
            <v-row class="mb-6 align-center">
              <v-col cols="12" sm="8" md="9">
                <v-text-field
                  v-model="busca"
                  label="Buscar aluno"
                  placeholder="Nome do aluno"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                />
              </v-col>
              <v-col cols="12" sm="4" md="3" class="d-flex align-center justify-end" style="gap: 1rem;">
                <v-btn
                  variant="outlined"
                  @click="voltar"
                  class="text-none"
                >
                  Cancelar
                </v-btn>
                <v-btn
                  color="success"
                  :disabled="salvando"
                  :loading="salvando"
                  @click="salvarAlunos"
                  class="text-none"
                  prepend-icon="mdi-check"
                >
                  Salvar
                </v-btn>
              </v-col>
            </v-row>

            <v-divider class="my-4"></v-divider>

            <!-- Loading -->
            <v-progress-linear
              v-if="carregando"
              indeterminate
              color="primary"
              class="mb-4"
            ></v-progress-linear>

            <!-- Lista de alunos -->
            <div v-else-if="alunos.length > 0">
              <v-list class="bg-transparent" density="compact">
                <v-list-item
                  v-for="aluno in alunosFiltrados"
                  :key="aluno.id"
                  class="mb-1 rounded border pa-2 aluno-item aluno-clicavel"
                  :class="{ 
                    'bg-green-lighten-5': selecionados.includes(aluno.id) && !alunoSeraDeletado(aluno.id),
                    'aluno-na-turma': alunosJaAdicionados.includes(aluno.id) && selecionados.includes(aluno.id),
                    'aluno-sera-deletado': alunoSeraDeletado(aluno.id)
                  }"
                  density="compact"
                  @click="alternarSeleção(aluno.id)"
                >
                  <template v-slot:prepend>
                    <v-checkbox
                      :model-value="selecionados.includes(aluno.id)"
                      @change="alternarSeleção(aluno.id)"
                      density="compact"
                      hide-details
                    ></v-checkbox>
                  </template>

                  <div class="d-flex align-center">
                    <v-avatar size="32" color="primary" text-color="white">
                      <span class="text-caption">{{ aluno.nome.charAt(0).toUpperCase() }}</span>
                    </v-avatar>
                    <div class="flex-grow-1 ml-4">
                      <v-list-item-title class="text-body-2 font-weight-bold">
                        {{ aluno.nome }}
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-caption">
                        {{ aluno.login }}
                      </v-list-item-subtitle>
                    </div>
                  </div>

                  <template v-slot:append>
                    <div class="chip-container">
                      <!-- Aluno que será deletado -->
                      <v-chip
                        v-if="alunoSeraDeletado(aluno.id)"
                        color="error"
                        variant="tonal"
                        size="small"
                        prepend-icon="mdi-alert"
                      >
                        Clique em salvar para concluir exclusão
                      </v-chip>
                      
                      <!-- Aluno na turma (normal e hover) -->
                      <template v-else-if="alunosJaAdicionados.includes(aluno.id) && selecionados.includes(aluno.id)">
                        <v-chip
                          color="success"
                          variant="tonal"
                          size="small"
                          prepend-icon="mdi-check"
                          class="chip-default"
                        >
                          Na turma
                        </v-chip>
                        <v-chip
                          color="error"
                          variant="tonal"
                          size="small"
                          prepend-icon="mdi-delete"
                          class="chip-hover"
                        >
                          Clique para excluir
                        </v-chip>
                      </template>
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </div>

            <!-- Nenhum aluno encontrado -->
            <v-empty-state
              v-else-if="!carregando"
              headline="Nenhum aluno encontrado"
              title="Sem resultados"
              :text="busca ? 'Não há alunos com o filtro selecionado' : 'Não há alunos cadastrados no sistema'"
              icon="mdi-account-search"
            ></v-empty-state>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.mensagem }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usuarioService } from '@/services/usuarioService'
import { turmaService } from '@/services/turmaService'

const router = useRouter()
const route = useRoute()

const turmaId = route.params.turmaId
const turma = ref(null)
const alunos = ref([])
const alunosJaAdicionados = ref([])
const selecionados = ref([])
const busca = ref('')
const carregando = ref(false)
const salvando = ref(false)

const snackbar = ref({
  show: false,
  mensagem: '',
  color: 'success'
})

const alunosFiltrados = computed(() => {
  return alunos.value.filter(aluno =>
    aluno.nome.toLowerCase().includes(busca.value.toLowerCase()) ||
    aluno.login.toLowerCase().includes(busca.value.toLowerCase())
  )
})

function mostrarSnackbar(mensagem, color = 'success') {
  snackbar.value.mensagem = mensagem
  snackbar.value.color = color
  snackbar.value.show = true
}

onMounted(async () => {
  await carregarDados()
})

async function carregarDados() {
  carregando.value = true
  try {
    // Carregar dados da turma
    turma.value = await turmaService.buscarPorId(turmaId)
    // Extrai os IDs dos alunos já adicionados
    alunosJaAdicionados.value = turma.value.alunos ? turma.value.alunos.map(a => a.id) : []

    // Carregar todos os alunos
    const todosOsUsuarios = await usuarioService.listarTodos()
    console.log('Todos os usuários:', todosOsUsuarios)
    console.log('Primeiro usuário:', todosOsUsuarios[0])
    
    // Filtrar apenas alunos - tenta vários campos possíveis
    alunos.value = todosOsUsuarios.filter(u => 
      u.tipoUsuario === 'Aluno' || 
      u.tipo === 'Aluno' ||
      u.tipoUsuario === 2 || // Algumas APIs usam enum numérico
      u.tipo === 2
    )

    console.log('Alunos filtrados:', alunos.value)

    // Inicializar selecionados com os já adicionados
    selecionados.value = [...alunosJaAdicionados.value]
  } catch (erro) {
    console.error('Erro ao carregar dados:', erro)
    mostrarSnackbar('Erro ao carregar dados', 'error')
  } finally {
    carregando.value = false
  }
}

function alternarSeleção(alunoId) {
  const index = selecionados.value.indexOf(alunoId)
  if (index > -1) {
    selecionados.value.splice(index, 1)
  } else {
    selecionados.value.push(alunoId)
  }
}

function alunoSeraDeletado(alunoId) {
  // Aluno estava na turma MAS foi desmarcado
  return alunosJaAdicionados.value.includes(alunoId) && !selecionados.value.includes(alunoId)
}

async function salvarAlunos() {
  salvando.value = true
  try {
    // Garante que não há duplicações enviando apenas IDs únicos
    const alunosUnicos = [...new Set(selecionados.value)]
    
    await turmaService.atualizar(turmaId, {
      alunosIds: alunosUnicos
    })
    mostrarSnackbar(`Alunos salvos na ${turma.value?.nome} com sucesso!`, 'success')
    setTimeout(() => {
      router.push('/turmas')
    }, 1500)
  } catch (erro) {
    console.error('Erro ao salvar alunos:', erro)
    mostrarSnackbar(
      erro.response?.data?.message || 'Erro ao salvar alunos',
      'error'
    )
  } finally {
    salvando.value = false
  }
}

function voltar() {
  router.push('/turmas')
}
</script>

<style scoped>
.aluno-item.aluno-clicavel {
  cursor: pointer;
  transition: background-color 0.3s;
}

.aluno-item.aluno-na-turma:hover {
  background-color: #ffebee !important;
}

.aluno-item.aluno-sera-deletado {
  background-color: #ffebee !important;
}

.chip-container {
  position: relative;
  min-width: 280px;
}

.chip-default,
.chip-hover {
  transition: opacity 0.3s;
}

.chip-hover {
  position: absolute;
  right: 0;
  opacity: 0;
}

.aluno-item.aluno-na-turma:hover .chip-default {
  opacity: 0;
}

.aluno-item.aluno-na-turma:hover .chip-hover {
  opacity: 1;
}
</style>
