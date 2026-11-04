<template>
  <div>
    <v-card class="mb-6" elevation="1">
      <v-card-text class="pa-6">
        <h1 class="text-h4 font-weight-bold mb-2">
          Bem-vindo(a), {{ authStore.usuario?.nome?.split(' ')[0] }}
        </h1>
        <p class="text-body-1 text-grey-darken-1">
          Pratique ditados e acompanhe seu progresso
        </p>
      </v-card-text>
    </v-card>

    <v-card elevation="1">
      <v-card-title class="pa-6 d-flex align-center border-b">
        <v-icon class="mr-3" color="grey-darken-2">mdi-headphones</v-icon>
        <span class="text-h6 font-weight-bold">Meus Ditados</span>
        <v-spacer></v-spacer>
        <v-chip color="primary" variant="flat">
          {{ ditadosFiltrados.length }} {{ ditadosFiltrados.length === 1 ? 'ditado' : 'ditados' }}
        </v-chip>
      </v-card-title>

      <v-card-text class="pa-6">
        
        <div v-if="carregando" class="text-center py-12">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="text-grey mt-4">Carregando seus ditados...</p>
        </div>

        <div v-else-if="ditados.length === 0" class="text-center py-12">
          <v-icon size="64" color="grey-lighten-1">mdi-folder-open-outline</v-icon>
          <p class="text-body-1 text-grey mt-4">Nenhum ditado atribuído para você no momento.</p>
        </div>

        <v-row v-else>
          <v-col v-for="ditado in ditadosFiltrados" :key="ditado.ditadoId" cols="12" md="6">
            
            <v-card elevation="2" class="ditado-card h-100 d-flex flex-column" hover @click="iniciarDitado(ditado.ditadoId)">
              <v-card-text class="pa-6 flex-grow-1">
                <div class="d-flex align-start mb-4">
                  <v-avatar :color="ditado.atrasado ? 'error' : 'primary'" size="56" class="mr-4">
                    <v-icon size="32" color="white">mdi-headphones</v-icon>
                  </v-avatar>
                  
                  <div class="flex-grow-1">
                    <h3 class="text-h6 font-weight-bold mb-1">{{ ditado.titulo }}</h3>
                    
                    <p class="text-body-2 text-grey-darken-1 mb-2">
                      {{ ditado.descricao || 'Sem descrição' }}
                    </p>

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

                <v-row dense class="text-caption">
                    <v-col cols="6">
                        <div class="text-grey-darken-1">
                            <v-icon size="14" class="mr-1">mdi-calendar-import</v-icon>
                            Atribuído em:
                        </div>
                        <div class="font-weight-medium">
                            {{ formatarData(ditado.turmas?.[0]?.dataAtribuicao) }}
                        </div>
                    </v-col>
                    
                    <v-col cols="6" class="text-right">
                        <div :class="ditado.atrasado ? 'text-error' : 'text-grey-darken-1'">
                            <v-icon size="14" class="mr-1">mdi-calendar-clock</v-icon>
                            Entrega até:
                        </div>
                        <div class="font-weight-medium" :class="{'text-error': ditado.atrasado}">
                            {{ formatarData(ditado.dataLimite) }}
                        </div>
                    </v-col>
                </v-row>

                <div v-if="ditado.status?.jaTentou" class="mt-3 bg-grey-lighten-4 pa-2 rounded text-center">
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
                >
                    {{ ditado.status?.jaTentou ? 'Tentar Novamente' : 'Iniciar Ditado' }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.mensagem }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ditadoService } from '@/services/ditadoService'
// Removi categoriaService por enquanto pois a listagem de meus-ditados não retorna IDs de categoria para filtrar

const router = useRouter()
const authStore = useAuthStore()

const ditados = ref([])
const ditadosFiltrados = ref([])
const carregando = ref(false)

const snackbar = ref({
  show: false,
  mensagem: '',
  color: 'success'
})

onMounted(() => {
  buscarDitados()
})

async function buscarDitados() {
  carregando.value = true
  try {
    // Chama a nova rota correta
    const dados = await ditadoService.listarMeusDitados()
    ditados.value = dados
    ditadosFiltrados.value = dados
  } catch (erro) {
    console.error('Erro ao carregar ditados:', erro)
    mostrarSnackbar('Erro ao carregar ditados. Tente novamente.', 'error')
  } finally {
    carregando.value = false
  }
}

// Formatação segura de data
function formatarData(dataISO) {
  if (!dataISO) return '--/--/----'
  const date = new Date(dataISO)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function iniciarDitado(id) {
  router.push(`/realizar-ditado/${id}`)
}

function mostrarSnackbar(mensagem, cor = 'success') {
  snackbar.value = {
    show: true,
    mensagem,
    color: cor
  }
}

// Define a cor da nota (Verde se > 70, etc)
function getCorNota(nota) {
    if (nota >= 70) return 'text-success'
    if (nota >= 50) return 'text-warning'
    return 'text-error'
}
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid #e0e0e0;
}

.ditado-card {
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
}

.ditado-card:hover {
  transform: translateY(-4px);
}
</style>