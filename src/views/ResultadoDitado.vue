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

    <v-alert v-else-if="erroResultados" type="error" variant="tonal">{{ erroResultados }}</v-alert>
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
                {{ detalhes.notaMedia?.toFixed(1) ?? '-' }}
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
                    :key="erro.origem + ':' + (erro.erroCatalogoId ?? erro.tipoErroId)"
                    class="erro-bar-container mb-3"
                  >
                    <div class="d-flex justify-space-between align-center mb-1">
                      <span class="text-body-2 font-weight-medium">
                        {{ erro.descricaoCurta }} · {{ erro.origem === 'LLM' ? 'LLM' : 'Código' }}
                      </span>
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
              <div v-if="detalhes.lacunasIncorretasSemClassificacao > 0" class="mt-3">
                <p v-if="detalhes.lacunasIncorretasAguardandoLlm" class="text-body-2">
                  Lacunas incorretas aguardando análise LLM: {{ detalhes.lacunasIncorretasAguardandoLlm }}
                </p>
                <p v-if="lacunasParaRevisar > 0" class="text-body-2">
                  Lacunas incorretas sem classificação: {{ lacunasParaRevisar }}
                </p>
              </div>
              <div v-else-if="!errosOrdenados.length" class="text-center py-6">
                <v-icon size="48" color="grey-lighten-1">mdi-check-all</v-icon>
                <p class="text-body-1 text-grey mt-2">
                  {{ detalhes.alunosQueFizeram ? 'Nenhum erro registrado.' : 'Ainda não há tentativas.' }}
                </p>
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
              title="Ver tentativas do aluno"
              aria-label="Ver tentativas do aluno"
            >
            </v-btn>
          </template>

        </v-data-table>
      </v-card>
    </div>

    <v-dialog v-model="dialogDetalhes" max-width="1100" aria-label="Tentativas do aluno" scrollable>
      <v-card rounded="lg">
        <v-card-title class="pt-5 px-6 text-h5 font-weight-bold">
          Tentativas do aluno
        </v-card-title>
        <v-card-subtitle class="px-6 pb-4">
          {{ alunoSelecionado?.nome }} · {{ detalhes?.ditadoTitulo }}
        </v-card-subtitle>

        <v-divider></v-divider>

        <v-card-text class="pa-6" style="max-height: 600px;">
          <div v-if="carregandoDetalhes" class="text-center py-12">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <p class="text-grey mt-4">Carregando respostas...</p>
          </div>

          <div v-else-if="linhasTentativas.length" class="tentativas-scroll" role="region"
            aria-label="Tabela de tentativas do aluno" tabindex="0">
            <v-table density="compact" class="tabela-tentativas">
              <colgroup span="2" />
              <colgroup v-if="colunasLacunas.length" :span="colunasLacunas.length" />
              <colgroup span="2" />
              <thead>
                <tr class="grupos-tentativas">
                  <th scope="colgroup" colspan="2">Identificação</th>
                  <th v-if="colunasLacunas.length" scope="colgroup" :colspan="colunasLacunas.length">
                    Respostas por lacuna
                  </th>
                  <th scope="colgroup" colspan="2">Correção</th>
                </tr>
                <tr>
                  <th scope="col" class="tentativa-identificacao">Tentativa</th>
                  <th scope="col" class="tentativa-nota">Nota</th>
                  <th v-for="(lacuna, index) in colunasLacunas" :key="lacuna.segmentoId" scope="col" class="tentativa-lacuna">
                    <span class="sr-only">Lacuna {{ index + 1 }}. </span>{{ lacuna.respostaEsperada || '—' }}
                  </th>
                  <th scope="col" class="tentativa-correcao">Por código</th>
                  <th scope="col" class="tentativa-correcao">Via LLM</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="linha in linhasTentativas" :key="linha.id">
                  <th scope="row" class="tentativa-identificacao">
                    <span class="font-weight-bold">{{ linha.numero }}</span>
                    <time class="d-block text-caption text-medium-emphasis" :datetime="linha.data">
                      {{ formatarDataHora(linha.data) }}
                    </time>
                  </th>
                  <td class="tentativa-nota font-weight-bold" :class="getCorTextoNota(linha.nota)">
                    {{ linha.nota.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) }}%
                  </td>
                  <td v-for="resposta in linha.respostas" :key="resposta.segmentoId" class="tentativa-lacuna">
                    <template v-if="resposta.texto !== null">
                      <span :class="!resposta.correto && 'text-error'">{{ resposta.texto }}</span>
                      <span v-if="resposta.gabaritoHistorico" class="d-block text-caption text-medium-emphasis">
                        Esperada nesta tentativa: {{ resposta.gabaritoHistorico }}
                      </span>
                    </template>
                    <span v-else class="text-medium-emphasis">Lacuna indisponível</span>
                  </td>
                  <td class="tentativa-correcao">
                    <ul v-if="linha.codigo.length" class="lista-correcao">
                      <li v-for="erro in linha.codigo" :key="erro.chave">
                        {{ erro.nome }}
                        <v-chip color="warning" size="x-small" variant="tonal">Código</v-chip>
                      </li>
                    </ul>
                    <span v-else class="text-medium-emphasis" aria-label="Sem achados por código">—</span>
                  </td>
                  <td class="tentativa-correcao">
                    <ul v-if="linha.llm.length" class="lista-correcao">
                      <li v-for="erro in linha.llm" :key="erro.chave">
                        {{ erro.nome }}
                        <v-chip color="info" size="x-small" variant="tonal">LLM</v-chip>
                      </li>
                    </ul>
                    <p v-for="estado in linha.estados" :key="estado" class="text-caption text-medium-emphasis">
                      {{ estado }}
                    </p>
                    <span v-if="!linha.llm.length && !linha.estados.length" class="text-medium-emphasis">
                      Sem análise LLM
                    </span>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
          <div v-else class="text-center py-12 text-grey">
            <v-icon size="64" color="grey-lighten-1">mdi-alert-circle-outline</v-icon>
            <p class="mt-4">Não foi possível carregar o histórico de tentativas.</p>
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="px-6 py-4">
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="flat" class="text-none" @click="dialogDetalhes = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ditadoService } from '@/services/ditadoService'
import { classificacoesVisiveis, estadosLlm } from '@/utils/resultadosDitado'

const route = useRoute()
const router = useRouter()

const carregando = ref(true)
const detalhes = ref(null)
const erroResultados = ref('')

// Modal de detalhes do aluno
const dialogDetalhes = ref(false)
const alunoSelecionado = ref(null)
const carregandoDetalhes = ref(false)
const tentativas = ref([])
let consultaHistorico = 0

const colunasLacunas = computed(() => {
  const colunas = new Map()
  for (const { resultado } of tentativas.value) {
    for (const lacuna of resultado.detalhes) {
      if (!colunas.has(lacuna.segmentoId)) colunas.set(lacuna.segmentoId, lacuna)
    }
  }
  return Array.from(colunas.values())
})

const linhasTentativas = computed(() => [...tentativas.value].reverse().map(({ dataRealizacao, resultado }, index) => {
  const porSegmento = new Map(resultado.detalhes.map(lacuna => [lacuna.segmentoId, lacuna]))
  const codigo = []
  const llm = []
  const estadosPorLacuna = new Map()

  for (const lacuna of resultado.detalhes) {
    for (const erro of classificacoesVisiveis(lacuna)) {
      const destino = erro.origem === 'LLM' ? llm : codigo
      destino.push({ ...erro, chave: `${lacuna.segmentoId}:${erro.id}` })
    }
    if (lacuna.estadoAnaliseLlm) {
      const estado = lacuna.estadoAnaliseLlm
      if (!estadosPorLacuna.has(estado)) estadosPorLacuna.set(estado, [])
      estadosPorLacuna.get(estado).push(lacuna.respostaEsperada)
    }
  }

  const estados = Array.from(estadosPorLacuna, ([estado, lacunas]) => {
    const rotulo = estado === 'Concluida' && !llm.length
      ? 'Concluída · sem achados'
      : estadosLlm[estado] || estado
    return lacunas.length === resultado.detalhes.length ? rotulo : `${rotulo} · ${lacunas.join(', ')}`
  })

  return {
    id: resultado.respostaDitadoId,
    numero: index + 1,
    data: dataRealizacao,
    nota: resultado.nota,
    codigo,
    llm,
    estados,
    respostas: colunasLacunas.value.map(coluna => {
      const lacuna = porSegmento.get(coluna.segmentoId)
      return {
        segmentoId: coluna.segmentoId,
        texto: lacuna ? (lacuna.respostaAusente ? '(sem resposta)' : lacuna.respostaFornecida || '(vazio)') : null,
        correto: lacuna?.correto,
        gabaritoHistorico: lacuna?.respostaEsperada !== coluna.respostaEsperada ? lacuna?.respostaEsperada : null
      }
    })
  }
}))

const headersAlunos = [
  { title: 'Nome do Aluno', key: 'nome', align: 'start' },
  { title: 'Matrícula', key: 'matricula', align: 'start' },
  { title: 'Fez o Ditado', key: 'fez', align: 'center' },
  { title: 'Entrega do melhor resultado', key: 'dataEntrega', align: 'center' },
  { title: 'Melhor nota', key: 'nota', align: 'center' },
  { title: 'Erro Mais Comum', key: 'erroMaisComum', align: 'start' },
  { title: 'Entregou Atrasado', key: 'atrasado', align: 'center' },
  { title: 'Respostas', key: 'acoes', align: 'center', sortable: false },
]

// Erros ordenados por quantidade (maior para menor)
const errosOrdenados = computed(() => {
  if (!detalhes.value?.errosPorTipo) return []
  return [...detalhes.value.errosPorTipo].sort((a, b) => b.quantidade - a.quantidade)
})

const lacunasParaRevisar = computed(() =>
  (detalhes.value?.lacunasIncorretasSemClassificacao ?? 0) - (detalhes.value?.lacunasIncorretasAguardandoLlm ?? 0)
)

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

    detalhes.value = await ditadoService.buscarResultadosDitadoProfessor(turmaId, ditadoId)

  } catch {
    erroResultados.value = 'Não foi possível carregar os resultados desta turma.'
  } finally {
    carregando.value = false
  }
}

function voltar() {
  router.back()
}

function formatarDataHora(data) {
  if (!data) return '-'
  const dataUtc = /(?:Z|[+-]\d{2}:\d{2})$/i.test(data) ? data : `${data}Z`
  return new Date(dataUtc).toLocaleString('pt-BR', {
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
  const consulta = ++consultaHistorico
  alunoSelecionado.value = aluno
  tentativas.value = []
  carregandoDetalhes.value = true
  dialogDetalhes.value = true

  try {
    const { turmaId, ditadoId } = route.params
    const historico = await ditadoService.buscarTentativasAlunoProfessor(turmaId, aluno.alunoId, ditadoId)
    if (consulta !== consultaHistorico || !dialogDetalhes.value) return
    tentativas.value = historico
  } catch {
    // O modal mantém a mensagem de histórico indisponível.
  } finally {
    if (consulta === consultaHistorico) carregandoDetalhes.value = false
  }
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

.tentativas-scroll {
  overflow-x: auto;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
}

.tabela-tentativas :deep(.v-table__wrapper) {
  overflow: visible;
}

.tabela-tentativas :deep(th),
.tabela-tentativas :deep(td) {
  padding: 8px 12px;
  border-inline-end: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.tabela-tentativas :deep(th:last-child),
.tabela-tentativas :deep(td:last-child) {
  border-inline-end: 0;
}

.tabela-tentativas :deep(thead) {
  background-color: #e7eef7;
  color: #1d2939;
}

.tabela-tentativas :deep(.grupos-tentativas th) {
  background-color: #d4e0ef;
  text-align: center;
  font-weight: 700;
}

.tabela-tentativas :deep(.tentativa-identificacao),
.tabela-tentativas :deep(.tentativa-nota),
.tabela-tentativas :deep(.tentativa-lacuna) {
  text-align: center;
}

.tentativa-identificacao {
  min-width: 8.5rem;
}

.tentativa-nota {
  min-width: 5rem;
  white-space: nowrap;
}

.tentativa-lacuna {
  min-width: 6.5rem;
  max-width: 12rem;
  overflow-wrap: anywhere;
}

.tentativa-correcao {
  min-width: 12rem;
  max-width: 18rem;
  overflow-wrap: anywhere;
}

.lista-correcao {
  list-style: none;
  padding: 0;
}

.lista-correcao li + li {
  margin-top: 4px;
}

</style>
