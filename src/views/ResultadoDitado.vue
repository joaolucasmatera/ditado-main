<template>
  <div>
    <div class="d-flex align-center mb-4">
      <v-btn
        variant="text"
        prepend-icon="mdi-arrow-left"
        class="text-none mr-4"
        @click="voltar"
      >
        Voltar para Ditados
      </v-btn>
    </div>

    <div v-if="carregando" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="text-grey mt-4">Carregando resultados da turma...</p>
    </div>

    <div v-else-if="detalhes">

      <v-card class="mb-6" elevation="1">
        <v-card-title class="bg-blue-grey-lighten-5 pa-4 font-weight-bold d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-chart-box-outline</v-icon>
          Resultados do Ditado: {{ detalhes.ditadoTitulo }}
        </v-card-title>

        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12" md="4">
              <div class="text-caption text-grey-darken-1 mb-1">Total de Alunos</div>
              <div class="text-h5 font-weight-bold mb-4">{{ detalhes.totalAlunos }}</div>

              <div class="text-caption text-grey-darken-1 mb-1">Nota Média da Turma</div>
              <div class="text-h4 font-weight-black" :class="getCorTextoNota(detalhes.notaMedia)">
                {{ detalhes.notaMedia ? detalhes.notaMedia.toFixed(1) : '-' }}
              </div>
            </v-col>

            <v-col cols="12" md="4">
               <div class="text-caption text-grey-darken-1 mb-1">Alunos que Fizeram</div>
               <div class="text-h6 font-weight-bold mb-1">
                 {{ detalhes.alunosQueFizeram }} <span class="text-body-2 text-grey">/ {{ detalhes.totalAlunos }}</span>
               </div>
               <div class="text-caption text-grey-darken-1 mb-1">Percentual de Conclusão</div>
               <div class="d-flex align-center">
                  <span class="text-h5 font-weight-bold mr-3">{{ detalhes.percentualConclusao }}%</span>
                  <v-progress-linear
                    :model-value="detalhes.percentualConclusao"
                    :color="getCorProgresso(detalhes.percentualConclusao)"
                    height="10"
                    rounded
                    style="max-width: 150px"
                  ></v-progress-linear>
               </div>
            </v-col>

            <v-col cols="12" md="4" class="text-md-right">
               <v-chip class="mb-2" size="small" variant="outlined">{{ detalhes.turmaNome }}</v-chip>
               <br>
               <v-chip :color="detalhes.vencido ? 'error' : 'success'" variant="flat" class="font-weight-bold">
                 {{ detalhes.vencido ? 'Encerrado' : 'Aberto' }}
               </v-chip>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-row class="mb-6">
        <!-- Gráfico Erros por Tipo -->
        <v-col cols="12" md="6">
          <v-card elevation="1" class="h-100">
            <v-card-title class="pa-6 d-flex align-center border-b">
              <v-icon class="mr-3" color="warning">mdi-alert-circle</v-icon>
              <span class="text-h6 font-weight-bold">Erros por Tipo</span>
            </v-card-title>
            <v-card-text class="pa-6">
              <div v-if="detalhes.errosPorTipo && detalhes.errosPorTipo.length > 0">
                <div class="erros-chart">
                  <div 
                    v-for="erro in errosOrdenados" 
                    :key="erro.tipoErroId" 
                    class="erro-bar-container mb-3"
                  >
                    <div class="d-flex justify-space-between align-center mb-1">
                      <span class="text-body-2 font-weight-medium">{{ erro.descricaoCurta }}:</span>
                      <span class="text-body-2 font-weight-bold">{{ erro.quantidade }}</span>
                    </div>
                    <div class="erro-bar-bg">
                      <div 
                        class="erro-bar" 
                        :style="{ width: calcularLarguraBarra(erro.quantidade) + '%' }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-6">
                <v-icon size="48" color="grey-lighten-1">mdi-check-all</v-icon>
                <p class="text-body-1 text-grey mt-2">Nenhum erro registrado.</p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Gráfico Erros por Palavra -->
        <v-col cols="12" md="6">
          <v-card elevation="1" class="h-100">
            <v-card-title class="pa-6 d-flex align-center border-b">
              <v-icon class="mr-3" color="error">mdi-format-letter-case</v-icon>
              <span class="text-h6 font-weight-bold">Erros por Palavra</span>
            </v-card-title>
            <v-card-text class="pa-6">
              <div v-if="detalhes.errosPorPalavra && detalhes.errosPorPalavra.length > 0">
                <div class="erros-chart">
                  <div 
                    v-for="(palavra, index) in palavrasOrdenadas" 
                    :key="index" 
                    class="erro-bar-container mb-3"
                  >
                    <div class="d-flex justify-space-between align-center mb-1">
                      <span class="text-body-2 font-weight-medium">{{ palavra.palavra }}:</span>
                      <span class="text-body-2 font-weight-bold">
                        {{ palavra.quantidadeErros }} ({{ palavra.percentualErro.toFixed(1) }}%)
                      </span>
                    </div>
                    <div class="erro-bar-bg">
                      <div 
                        class="erro-bar-palavra" 
                        :style="{ width: calcularLarguraBarraPalavra(palavra.quantidadeErros) + '%' }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-6">
                <v-icon size="48" color="grey-lighten-1">mdi-check-all</v-icon>
                <p class="text-body-1 text-grey mt-2">Nenhum erro registrado.</p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-card elevation="1">
        <v-card-title class="pa-4 bg-white border-b d-flex align-center">
          <v-icon color="primary" class="mr-2">mdi-account-group</v-icon>
          Resultados dos Alunos
        </v-card-title>

        <v-data-table
          :headers="headersAlunos"
          :items="detalhes.alunos"
          items-per-page="-1"
          class="elevation-0 tabela-sem-paginacao"
          hide-default-footer
          density="comfortable"
        >
          <template v-slot:item.fez="{ item }">
            <v-icon :color="item.fez ? 'success' : 'error'">
              {{ item.fez ? 'mdi-check-circle' : 'mdi-close-circle' }}
            </v-icon>
          </template>

          <template v-slot:item.dataEntrega="{ item }">
            {{ item.dataEntrega ? formatarDataHora(item.dataEntrega) : '-' }}
          </template>

          <template v-slot:item.nota="{ item }">
            <v-chip
              v-if="item.fez"
              :color="obterCorNota(item.nota)"
              variant="flat"
              size="small"
              class="font-weight-bold"
            >
              {{ item.nota?.toFixed(1) }}%
            </v-chip>
            <span v-else>-</span>
          </template>

          <template v-slot:item.erroMaisComum="{ item }">
            <span v-if="item.fez && item.erroMaisComum" class="text-error font-weight-medium">
              {{ item.erroMaisComum }}
            </span>
            <span v-else class="text-grey-lighten-1">-</span>
          </template>

          <template v-slot:item.atrasado="{ item }">
            <div v-if="item.fez">
              <v-icon v-if="item.atrasado" color="error" title="Entregue com atraso">mdi-clock-alert</v-icon>
              <v-icon v-else color="success" title="No prazo">mdi-check</v-icon>
            </div>
            <span v-else>-</span>
          </template>

          <template v-slot:item.acoes="{ item }">
            <v-btn
              icon="mdi-eye"
              size="small"
              variant="text"
              color="primary"
              :disabled="!item.fez"
              @click="abrirDetalhesAluno(item)"
              title="Ver respostas do aluno"
            >
            </v-btn>
          </template>

        </v-data-table>
      </v-card>
    </div>

    <!-- Modal de detalhes da resposta do aluno -->
    <v-dialog v-model="dialogDetalhes" max-width="900" scrollable>
      <v-card>
        <v-card-title class="bg-blue-grey-lighten-5 d-flex align-center">
          <v-icon class="mr-2">mdi-account-details</v-icon>
          <span>Resposta Detalhada - {{ alunoSelecionado?.nome }}</span>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-6" style="max-height: 600px;">
          <div v-if="carregandoDetalhes" class="text-center py-12">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <p class="text-grey mt-4">Carregando respostas...</p>
          </div>

          <div v-else-if="detalhesResposta && detalhesResposta.detalhes">
            <div class="mb-4">
              <div class="text-caption text-grey-darken-1">Nota Final</div>
              <div class="text-h4 font-weight-bold" :class="getCorTextoNota(detalhesResposta.nota)">
                {{ detalhesResposta.nota?.toFixed(1) }}%
              </div>
            </div>

            <v-divider class="my-4"></v-divider>

            <div class="text-h6 mb-3">Comparação Palavra por Palavra</div>

            <v-list>
              <v-list-item
                v-for="(segmento, index) in detalhesResposta.detalhes"
                :key="index"
                class="mb-2 resposta-item"
                :class="segmento.correto ? 'bg-success-lighten-5' : 'bg-error-lighten-5'"
              >
                <div class="d-flex align-center w-100 flex-wrap ga-2">
                  <v-icon :color="getCorItemResposta(segmento.correto)" size="small">
                    {{ segmento.correto ? 'mdi-check-circle' : 'mdi-close-circle' }}
                  </v-icon>
                  
                  <span class="font-weight-bold text-grey-darken-2" style="min-width: 30px;">{{ index + 1 }}.</span>
                  
                  <span class="font-weight-bold text-body-1" style="min-width: 100px;">
                    {{ segmento.respostaEsperada.toUpperCase() }}
                  </span>
                  
                  <template v-if="!segmento.correto">
                    <v-icon size="x-small" class="mx-1">mdi-arrow-right</v-icon>
                    <span class="text-caption text-grey-darken-1">Aluno:</span>
                    <span class="font-weight-bold text-body-1 text-error">
                      {{ (segmento.respostaFornecida || '(não fornecido)').toUpperCase() }}
                    </span>
                  </template>
                  
                  <template v-if="segmento.correto">
                    <span class="text-success font-weight-medium ml-2">✓ Correto</span>
                  </template>
                  
                  <v-chip 
                    v-if="segmento.tipoErro" 
                    size="x-small" 
                    color="error" 
                    variant="flat"
                    class="ml-2"
                  >
                    {{ segmento.tipoErro }}
                  </v-chip>
                </div>
              </v-list-item>
            </v-list>
          </div>

          <div v-else class="text-center py-12 text-grey">
            <v-icon size="64" color="grey-lighten-1">mdi-alert-circle-outline</v-icon>
            <p class="mt-4">Não foi possível carregar os detalhes da resposta.</p>
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="fecharDetalhes">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ditadoService } from '@/services/ditadoService'

const route = useRoute()
const router = useRouter()

const carregando = ref(true)
const detalhes = ref(null)

// Modal de detalhes do aluno
const dialogDetalhes = ref(false)
const alunoSelecionado = ref(null)
const detalhesResposta = ref(null)
const carregandoDetalhes = ref(false)

const headersAlunos = [
  { title: 'Nome do Aluno', key: 'nome', align: 'start' },
  { title: 'Matrícula', key: 'matricula', align: 'start' },
  { title: 'Fez o Ditado', key: 'fez', align: 'center' },
  { title: 'Data de Entrega', key: 'dataEntrega', align: 'center' },
  { title: 'Nota (1ª Tentativa)', key: 'nota', align: 'center' },
  { title: 'Erro Mais Comum', key: 'erroMaisComum', align: 'start' },
  { title: 'Entregou Atrasado', key: 'atrasado', align: 'center' },
  { title: 'Respostas', key: 'acoes', align: 'center', sortable: false },
]

// Erros ordenados por quantidade (maior para menor)
const errosOrdenados = computed(() => {
  if (!detalhes.value?.errosPorTipo) return []
  return [...detalhes.value.errosPorTipo].sort((a, b) => b.quantidade - a.quantidade)
})

// Calcula a largura da barra baseado no máximo
const maxErros = computed(() => {
  if (!errosOrdenados.value.length) return 1
  return Math.max(...errosOrdenados.value.map(e => e.quantidade))
})

function calcularLarguraBarra(quantidade) {
  return (quantidade / maxErros.value) * 100
}

// Palavras ordenadas por quantidade de erros (maior para menor)
const palavrasOrdenadas = computed(() => {
  if (!detalhes.value?.errosPorPalavra) return []
  return [...detalhes.value.errosPorPalavra].sort((a, b) => b.quantidadeErros - a.quantidadeErros)
})

// Calcula a largura da barra de palavras baseado no máximo
const maxErrosPalavra = computed(() => {
  if (!palavrasOrdenadas.value.length) return 1
  return Math.max(...palavrasOrdenadas.value.map(p => p.quantidadeErros))
})

function calcularLarguraBarraPalavra(quantidade) {
  return (quantidade / maxErrosPalavra.value) * 100
}

onMounted(async () => {
  await carregarDetalhes()
})

async function carregarDetalhes() {
  carregando.value = true
  try {
    const { turmaId, ditadoId } = route.params

    // Tenta usar a função correta do seu Service
    detalhes.value = await ditadoService.buscarResultadosDitadoProfessor(turmaId, ditadoId)

  } catch (erro) {
    console.warn('API falhou ou dados incompletos. Carregando DADOS DE TESTE.', erro)
    
    // =============================================================================
    // DADOS DE TESTE (MOCK) - Para garantir que a tela apareça mesmo sem Back
    // =============================================================================
    detalhes.value = {
        turmaId: 5,
        turmaNome: "5º Ano A",
        ditadoId: 10,
        ditadoTitulo: "Ortografia Básica (Dados de Teste)",
        totalAlunos: 25,
        alunosQueFizeram: 18,
        percentualConclusao: 72.0,
        notaMedia: 78.5,
        vencido: false,
        dataLimite: "2025-12-20T23:59:59",
        errosPorTipo: [
            { tipoErroId: 2, descricaoCurta: "Acentuação", quantidade: 12 },
            { tipoErroId: 1, descricaoCurta: "Ortografia", quantidade: 8 },
            { tipoErroId: 3, descricaoCurta: "Troca", quantidade: 4 },
            { tipoErroId: 4, descricaoCurta: "Supressão", quantidade: 2 },
            { tipoErroId: 5, descricaoCurta: "Irregularidade", quantidade: 1 }
        ],
        errosPorPalavra: [
            { palavra: "açúcar", quantidadeErros: 15, percentualErro: 83.33 },
            { palavra: "exceção", quantidadeErros: 12, percentualErro: 66.67 },
            { palavra: "assessoria", quantidadeErros: 10, percentualErro: 55.56 },
            { palavra: "tijolo", quantidadeErros: 8, percentualErro: 44.44 },
            { palavra: "México", quantidadeErros: 6, percentualErro: 33.33 },
            { palavra: "paralelepípedo", quantidadeErros: 5, percentualErro: 27.78 },
            { palavra: "cabeleireiro", quantidadeErros: 3, percentualErro: 16.67 }
        ],
        alunos: [
            { nome: "Pedro Teste", matricula: "12", fez: true, dataEntrega: "2025-12-13T22:08:00", nota: 100.0, erroMaisComum: null, atrasado: false },
            { nome: "João da Silva", matricula: "15", fez: true, dataEntrega: "2025-12-15T10:00:00", nota: 60.5, erroMaisComum: "Acentuação", atrasado: true },
            { nome: "Maria Souza", matricula: "18", fez: false, dataEntrega: null, nota: null, erroMaisComum: null, atrasado: false },
            { nome: "Ana Clara", matricula: "20", fez: true, dataEntrega: "2025-12-14T09:30:00", nota: 85.0, erroMaisComum: "Troca", atrasado: false }
        ]
    }
    // =============================================================================

  } finally {
    carregando.value = false
  }
}

function voltar() {
  router.back()
}

function formatarDataHora(data) {
  if (!data) return '-'
  return new Date(data).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function getCorProgresso(valor) {
  if (valor >= 80) return 'success'
  if (valor >= 50) return 'primary'
  return 'warning'
}

function obterCorNota(nota) {
  if (!nota && nota !== 0) return ''
  if (nota >= 80) return 'success'
  if (nota >= 60) return 'warning'
  return 'error'
}

function getCorTextoNota(nota) {
  if (!nota && nota !== 0) return ''
  if (nota >= 80) return 'text-success'
  if (nota >= 60) return 'text-warning'
  return 'text-error'
}

async function abrirDetalhesAluno(aluno) {
  if (!aluno.fez) return // Não abre se aluno não fez
  
  alunoSelecionado.value = aluno
  dialogDetalhes.value = true
  carregandoDetalhes.value = true
  detalhesResposta.value = null
  
  try {
    const turmaId = route.params.turmaId
    const ditadoId = route.params.ditadoId
    const alunoId = aluno.alunoId || aluno.id
    
    const response = await ditadoService.buscarResultadoAlunoDetalhado(turmaId, alunoId, ditadoId)
    detalhesResposta.value = response
  } catch (erro) {
    console.error('Erro ao carregar detalhes do aluno:', erro)
    detalhesResposta.value = null
  } finally {
    carregandoDetalhes.value = false
  }
}

function fecharDetalhes() {
  dialogDetalhes.value = false
  alunoSelecionado.value = null
  detalhesResposta.value = null
}

function getCorItemResposta(correto) {
  return correto ? 'success' : 'error'
}
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid #e0e0e0;
}

.erros-chart {
  max-width: 500px;
}

.erro-bar-bg {
  background-color: #e0e0e0;
  border-radius: 4px;
  height: 20px;
  overflow: hidden;
}

.erro-bar {
  background: linear-gradient(90deg, #7c4dff, #536dfe);
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.erro-bar-palavra {
  background: linear-gradient(90deg, #f44336, #e91e63);
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* Esconde paginação */
.tabela-sem-paginacao :deep(.v-data-table-footer) {
  display: none !important;
}

/* Item de resposta no modal */
.resposta-item {
  border-left: 3px solid transparent;
  transition: all 0.2s;
}

.resposta-item.bg-success-lighten-5 {
  border-left-color: #4caf50;
}

.resposta-item.bg-error-lighten-5 {
  border-left-color: #f44336;
}
</style>
