<template>
  <div>
    <!-- Header -->
    <v-card class="mb-6" elevation="1">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">Cadastro de Ditados</h1>
            <p class="text-body-1 text-grey-darken-1">
              Crie e organize ditados para futuras sessões.
            </p>
          </div>
          <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-view-list"
            variant="outlined"
            class="text-none"
            @click="voltarParaLista"
          >
            Ver Banco de Ditados
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Formulário de Cadastro -->
    <v-card elevation="1">
      <v-card-text class="pa-6">
        <!-- Banner de Aviso -->
        <v-alert
          type="warning"
          variant="tonal"
          class="mb-6"
          icon="mdi-alert"
          border="start"
          border-color="orange"
        >
          <v-alert-title class="font-weight-bold mb-2">Atenção!</v-alert-title>
          <div class="text-body-2">
            <strong>Ditados não podem ser editados após serem criados.</strong><br>
            Verifique se todas as informações estão 100% corretas antes de salvar, pois não será possível fazer alterações posteriormente.
          </div>
        </v-alert>

        <v-form ref="formDitado">
          <v-row>
            <!-- Coluna Esquerda - Detalhes da Palavra -->
            <v-col cols="12" md="6">
              <v-card elevation="0" class="border">
                <v-card-title class="bg-grey-lighten-5 pa-4">
                  <v-icon class="mr-2">mdi-text</v-icon>
                  Detalhes do Ditado
                </v-card-title>
                <v-card-text class="pa-6">
                  <!-- Título -->
                  <div class="mb-6">
                    <label class="text-body-2 font-weight-bold text-grey-darken-2 mb-2 d-block">
                      Título
                    </label>
                    <v-text-field
                      v-model="formDados.titulo"
                      placeholder="Digite o título do ditado"
                      variant="outlined"
                      density="comfortable"
                      :rules="[regras.obrigatorio]"
                      hide-details="auto"
                    />
                  </div>

                  <!-- Descrição -->
                  <div class="mb-6">
                    <label class="text-body-2 font-weight-bold text-grey-darken-2 mb-2 d-block">
                      Descrição
                    </label>
                    <v-textarea
                      v-model="formDados.descricao"
                      placeholder="Descreva o objetivo ou contexto do ditado"
                      variant="outlined"
                      density="comfortable"
                      rows="3"
                      hide-details="auto"
                    />
                  </div>

                  <!-- Categorias -->
                  <div class="mb-6">
                    <label class="text-body-2 font-weight-bold text-grey-darken-2 mb-2 d-block">
                      Categorias
                    </label>
                    <v-select
                      v-model="formDados.categoriaIds"
                      :items="categorias"
                      item-title="nome"
                      item-value="id"
                      multiple
                      placeholder="Selecione as categorias para este ditado"
                      variant="outlined"
                      density="comfortable"
                      :loading="carregandoCategorias"
                      chips
                      clearable
                      hide-details="auto"
                    />
                  </div>

                  <div class="mb-6">
                    <label for="ditado-erros-catalogo" class="text-body-2 font-weight-bold text-grey-darken-2 mb-2 d-block">
                      Erros do catálogo
                    </label>
                    <v-autocomplete
                      id="ditado-erros-catalogo"
                      v-model="formDados.erroCatalogoIds"
                      :items="errosCatalogoAtivos"
                      item-title="nome"
                      item-value="id"
                      multiple
                      chips
                      closable-chips
                      clearable
                      variant="outlined"
                      density="comfortable"
                      placeholder="Selecione um ou mais erros"
                      :loading="carregandoErrosCatalogo"
                      :disabled="selecaoErrosBloqueada || salvando || carregando"
                      no-data-text="Nenhum erro ativo encontrado"
                      hide-details="auto"
                    >
                      <template #item="{ props, item }">
                        <v-list-item v-bind="props">
                          <template #subtitle>{{ item.raw.descricao }}</template>
                        </v-list-item>
                      </template>
                    </v-autocomplete>
                    <v-alert v-if="falhaErrosCatalogo" type="error" variant="tonal" density="comfortable" class="mt-3" role="alert">
                      {{ falhaErrosCatalogo }}
                      <template #append><v-btn variant="text" size="small" class="text-none" @click="carregarErrosCatalogo">Tentar novamente</v-btn></template>
                    </v-alert>
                    <v-alert v-if="selecaoErrosBloqueada" type="info" variant="tonal" density="comfortable" class="mt-3">
                      A seleção de erros está bloqueada porque este ditado já recebeu respostas. Para preservar o histórico, não é possível alterá-la.
                    </v-alert>
                    <p v-else class="text-body-2 text-grey-darken-1 mt-2 mb-0">
                      Escolha os erros ativos que poderão ser considerados na análise deste ditado. Novos ditados precisam de pelo menos um erro.
                    </p>
                  </div>

                  <!-- Ditado (Texto com Marcações) -->
                  <div class="mb-4">
                    <label class="text-body-2 font-weight-bold text-grey-darken-2 mb-2 d-block">
                      Ditado
                    </label>
                    <v-textarea
                      v-model="formDados.textoComMarcacoes"
                      placeholder="Digite o texto do ditado"
                      variant="outlined"
                      density="comfortable"
                      rows="5"
                      :rules="[regras.obrigatorio, regras.validarColchetes]"
                      hide-details="auto"
                    />
                  </div>
                  
                  <!-- Exemplo de uso -->
                  <v-alert type="info" variant="tonal" density="compact">
                    <div class="text-caption">
                      <strong>Como escrever:</strong><br>
                      Use colchetes <code>[ ]</code> para marcar as palavras que serão omitidas.<br>
                      <strong>Exemplo:</strong> O menino foi ao [parque] com seu [cachorro].
                    </div>
                  </v-alert>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Coluna Direita - Áudio -->
            <v-col cols="12" md="6">
              <v-card elevation="0" class="border">
                <v-card-title class="bg-grey-lighten-5 pa-4">
                  <v-icon class="mr-2">mdi-music</v-icon>
                  Áudio
                </v-card-title>
                <v-card-text class="pa-6">
                  <!-- Gravação direta -->
                  <div>
                    <h3 class="text-h6 font-weight-bold mb-4 d-flex align-center">
                      <v-icon class="mr-2">mdi-microphone</v-icon>
                      Gravação direta
                    </h3>
                    <div class="d-flex align-center gap-3 mb-4">
                      <v-btn
                        v-if="!gravando && !audioGravado"
                        color="error"
                        variant="flat"
                        prepend-icon="mdi-microphone"
                        class="text-none"
                        @click="iniciarGravacao"
                      >
                        Iniciar
                      </v-btn>
                      <v-btn
                        v-if="gravando"
                        color="grey"
                        variant="flat"
                        prepend-icon="mdi-stop"
                        class="text-none"
                        @click="pararGravacao"
                      >
                        Parar
                      </v-btn>
                      <v-btn
                        v-if="audioGravado"
                        color="primary"
                        variant="outlined"
                        prepend-icon="mdi-refresh"
                        class="text-none"
                        @click="reiniciarGravacao"
                      >
                        Nova gravação
                      </v-btn>
                      <v-chip v-if="gravando" color="error" variant="flat">
                        <v-icon start>mdi-circle</v-icon>
                        Gravando... {{ tempoGravacao }}s
                      </v-chip>
                    </div>

                    <!-- Audio gravado -->
                    <div v-if="audioGravado">
                      <audio ref="audioGravadoPlayer" controls class="w-100">
                        <source :src="audioGravado" type="audio/webm">
                      </audio>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Alerta de erro -->
          <v-alert
            v-if="erroForm"
            type="error"
            class="mt-6"
            variant="tonal"
            closable
            @click:close="erroForm = null"
          >
            {{ erroForm }}
          </v-alert>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Ações -->
      <v-card-actions class="pa-6 bg-grey-lighten-5">
        <v-btn
          variant="text"
          class="text-none"
          prepend-icon="mdi-close"
          @click="cancelar"
        >
          Cancelar
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="flat"
          size="large"
          class="text-none px-8"
          prepend-icon="mdi-content-save"
          :loading="salvando"
          @click="salvarDitado"
        >
          Salvar Ditado
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.mensagem }}
    </v-snackbar>

    <!-- Dialog de Confirmação de Saída -->
    <v-dialog v-model="dialogSair" max-width="400">
      <v-card>
        <v-card-title class="bg-amber-lighten-5 pa-4">
          <v-icon color="warning" class="mr-2">mdi-alert</v-icon>
          Confirmar Saída
        </v-card-title>
        <v-card-text class="pa-6">
          <p class="text-body-1 mb-2">
            Tem certeza que deseja sair? As alterações não salvas serão perdidas.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-btn variant="text" @click="dialogSair = false">
            Cancelar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="warning" variant="flat" @click="confirmarSaida">
            Sair
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de Validação de Marcadores -->
    <v-dialog v-model="dialogValidacaoMarcadores" max-width="400">
      <v-card>
        <v-card-title class="bg-amber-lighten-5 pa-4">
          <v-icon color="warning" class="mr-2">mdi-alert</v-icon>
          Aviso
        </v-card-title>
        <v-card-text class="pa-6">
          <p class="text-body-1 mb-2">
            O texto do ditado deve conter pelo menos uma palavra entre colchetes. Exemplo: [palavra].
          </p>
        </v-card-text>
        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-spacer></v-spacer>
          <v-btn color="warning" variant="flat" @click="dialogValidacaoMarcadores = false">
            Entendi
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de Áudio Obrigatório -->
    <v-dialog v-model="dialogAudioObrigatorio" max-width="400">
      <v-card>
        <v-card-title class="bg-red-lighten-5 pa-4">
          <v-icon color="error" class="mr-2">mdi-microphone-off</v-icon>
          Áudio Obrigatório
        </v-card-title>
        <v-card-text class="pa-6">
          <p class="text-body-1 mb-2">
            <strong>Não é possível criar um ditado sem áudio.</strong>
          </p>
          <p class="text-body-2 text-grey-darken-1">
            Por favor, grave uma áudio do ditado antes de salvar. O áudio é essencial para que os alunos possam realizar a atividade.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-spacer></v-spacer>
          <v-btn color="error" variant="flat" @click="dialogAudioObrigatorio = false">
            Entendi
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onUnmounted, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ditadoService } from '@/services/ditadoService'
import { categoriaService } from '@/services/categoriaService'
import { catalogoErrosService } from '@/services/catalogoErrosService'

const router = useRouter()
const route = useRoute()

const formDitado = ref(null)
const audioGravadoPlayer = ref(null)

const ditadoId = computed(() => route.params.id)

const formDados = ref({
  titulo: '',
  descricao: '',
  textoComMarcacoes: '',
  categoriaIds: [],
  erroCatalogoIds: []
})

let ditadoEmEdicao = null

const salvando = ref(false)
const carregando = ref(false)
const erroForm = ref(null)
const dialogSair = ref(false)
const dialogValidacaoMarcadores = ref(false)
const dialogAudioObrigatorio = ref(false)
const alteracoesNaoSalvas = ref(false)

const categorias = ref([])
const carregandoCategorias = ref(false)
const errosCatalogoAtivos = ref([])
const carregandoErrosCatalogo = ref(false)
const falhaErrosCatalogo = ref('')
const selecaoErrosBloqueada = ref(false)
const modoEdicao = computed(() => Boolean(ditadoId.value))

// Gravação
const gravando = ref(false)
const audioGravado = ref(null)
const tempoGravacao = ref(0)
let mediaRecorder = null
let chunks = []
let intervaloTempo = null

const snackbar = ref({
  show: false,
  mensagem: '',
  color: 'success'
})

const regras = {
  obrigatorio: v => (v !== null && v !== undefined && v !== '') || 'Campo obrigatório',
  validarColchetes: v => {
    if (!v || v.trim() === '') return true // Campo vazio será validado por 'obrigatorio'
    
    // Verificar se há colchetes
    const temAbertura = v.includes('[')
    const temFechamento = v.includes(']')
    
    if (!temAbertura && !temFechamento) {
      return 'O ditado deve conter pelo menos uma palavra entre colchetes. Exemplo: [palavra]'
    }
    
    if (temAbertura && !temFechamento) {
      return 'Colchete aberto [ sem fechamento. Use: [palavra]'
    }
    
    if (!temAbertura && temFechamento) {
      return 'Colchete fechado ] sem abertura. Use: [palavra]'
    }
    
    // Verificar se há palavras dentro dos colchetes
    const regex = /\[([^\[\]]*?)\]/g
    let match
    const colchetes = []
    
    while ((match = regex.exec(v)) !== null) {
      const conteudo = match[1]
      const conteudoTrimmed = conteudo.trim()
      
      // Verificar se está vazio
      if (!conteudoTrimmed) {
        return 'Não é permitido colchetes vazios. Use: [palavra]'
      }
      
      // Verificar se há espaços dentro dos colchetes
      if (conteudo !== conteudoTrimmed || conteudoTrimmed.includes(' ')) {
        return 'Não é permitido espaços nas lacunas. Use: [palavra] e não [palavra ]'
      }
      
      colchetes.push(conteudoTrimmed)
    }
    
    if (colchetes.length === 0) {
      return 'O ditado deve conter pelo menos uma palavra entre colchetes. Exemplo: [palavra]'
    }
    
    // Verificar se há colchetes desbalanceados
    let abertas = 0
    for (let i = 0; i < v.length; i++) {
      if (v[i] === '[') abertas++
      if (v[i] === ']') abertas--
      if (abertas < 0) {
        return 'Colchetes desbalanceados. Verifique se todos os [ têm ] correspondente'
      }
    }
    if (abertas !== 0) {
      return 'Colchetes desbalanceados. Verifique se todos os [ têm ] correspondente'
    }
    
    return true
  }
}

onMounted(async () => {
  await Promise.all([carregarCategorias(), carregarErrosCatalogo(), carregarDitadoEmEdicao()])
})

async function carregarCategorias() {
  carregandoCategorias.value = true
  try {
    categorias.value = await categoriaService.listarTodas()
  } catch (erro) {
    console.error('Erro ao carregar categorias:', erro)
    mostrarSnackbar('Erro ao carregar categorias', 'error')
  } finally {
    carregandoCategorias.value = false
  }
}

async function carregarErrosCatalogo() {
  carregandoErrosCatalogo.value = true
  try {
    falhaErrosCatalogo.value = ''
    errosCatalogoAtivos.value = (await catalogoErrosService.listar('ativo'))
      .filter(erro => erro.ativo !== false)
  } catch (erro) {
    console.error('Erro ao carregar erros do catálogo:', erro)
    errosCatalogoAtivos.value = []
    falhaErrosCatalogo.value = 'Não foi possível carregar os erros do catálogo.'
  } finally {
    carregandoErrosCatalogo.value = false
  }
}

async function carregarDitadoEmEdicao() {
  if (!modoEdicao.value) return
  carregando.value = true
  try {
    const ditado = await ditadoService.buscarPorId(ditadoId.value)
    ditadoEmEdicao = ditado
    formDados.value = {
      titulo: ditado.titulo || '',
      descricao: ditado.descricao || '',
      textoComMarcacoes: ditado.textoComMarcacoes || '',
      categoriaIds: (ditado.categorias || []).map(categoria => categoria.id),
      erroCatalogoIds: obterIdsErrosSelecionados(ditado)
    }
    selecaoErrosBloqueada.value = possuiRespostas(ditado)
    if (ditado.audioBase64) audioGravado.value = getAudioSrc(ditado.audioBase64)
    alteracoesNaoSalvas.value = false
  } catch (erro) {
    erroForm.value = mensagemErroDitado(erro, 'carregar o ditado')
  } finally {
    carregando.value = false
  }
}

function obterIdsErrosSelecionados(ditado) {
  const selecionados = ditado.errosCatalogo || ditado.errosSelecionados || []
  if (Array.isArray(selecionados)) {
    return selecionados.map(erro => typeof erro === 'object' ? erro.id : erro).filter(Boolean)
  }
  return Array.isArray(ditado.erroCatalogoIds) ? ditado.erroCatalogoIds : []
}

function possuiRespostas(ditado) {
  // Contrato vigente: o backend calcula este indicador com RespostaDitados.Any().
  if (ditado.possuiRespostas === true) return true
  // Compatibilidade com respostas de versões anteriores do endpoint.
  return ditado.temRespostas === true ||
    Number(ditado.quantidadeRespostas || ditado.totalRespostas || 0) > 0 ||
    (Array.isArray(ditado.respostas) && ditado.respostas.length > 0) ||
    (Array.isArray(ditado.respostasDitados) && ditado.respostasDitados.length > 0)
}

// Observar alterações no formulário
watch(formDados, () => {
  alteracoesNaoSalvas.value = true
}, { deep: true })


async function iniciarGravacao() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)
    chunks = []

    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data)
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' })
      const reader = new FileReader()
      reader.onload = () => {
        audioGravado.value = reader.result
      }
      reader.readAsDataURL(blob)

      // Parar todas as tracks
      stream.getTracks().forEach(track => track.stop())
    }

    mediaRecorder.start()
    gravando.value = true
    tempoGravacao.value = 0

    // Contador de tempo
    intervaloTempo = setInterval(() => {
      tempoGravacao.value++
    }, 1000)
  } catch (erro) {
    console.error('Erro ao acessar microfone:', erro)
    mostrarSnackbar('Erro ao acessar o microfone. Verifique as permissões.', 'error')
  }
}

function pararGravacao() {
  if (mediaRecorder && gravando.value) {
    mediaRecorder.stop()
    gravando.value = false
    clearInterval(intervaloTempo)
  }
}

function reiniciarGravacao() {
  audioGravado.value = null
  tempoGravacao.value = 0
  iniciarGravacao()
}

async function salvarDitado() {
  const { valid } = await formDitado.value.validate()
  if (!valid) {
    mostrarSnackbar('Por favor, preencha todos os campos obrigatórios', 'warning')
    return
  }

  // Validar campos obrigatórios manualmente
  if (!formDados.value.titulo || !formDados.value.textoComMarcacoes) {
    mostrarSnackbar('Por favor, preencha o título e o ditado', 'warning')
    return
  }

  if (!modoEdicao.value && formDados.value.erroCatalogoIds.length === 0) {
    erroForm.value = 'Selecione pelo menos um erro do catálogo para criar o ditado.'
    mostrarSnackbar('Selecione pelo menos um erro do catálogo', 'warning')
    return
  }

  // Validar se há áudio
  if (!audioGravado.value) {
    dialogAudioObrigatorio.value = true
    return
  }

  salvando.value = true
  erroForm.value = null

  try {
    const dados = {
      titulo: formDados.value.titulo,
      descricao: formDados.value.descricao || '',
      textoComMarcacoes: formDados.value.textoComMarcacoes,
      categoriaIds: formDados.value.categoriaIds
    }

    if (!modoEdicao.value || !selecaoErrosBloqueada.value) {
      dados.erroCatalogoIds = formDados.value.erroCatalogoIds
    }

    // Adicionar áudio da gravação
    if (audioGravado.value) {
      const base64Audio = audioGravado.value.split(',')[1]
      dados.audioBase64 = base64Audio
      console.log('Tamanho do áudio em base64:', base64Audio.length, 'caracteres')
    }

    console.log('Dados a serem enviados:', {
      ...dados,
      audioBase64: dados.audioBase64 ? `[${dados.audioBase64.length} caracteres]` : 'não definido'
    })

    if (modoEdicao.value) await ditadoService.atualizar(ditadoId.value, dados)
    else await ditadoService.criar(dados)
    mostrarSnackbar(modoEdicao.value ? 'Ditado atualizado com sucesso!' : 'Ditado cadastrado com sucesso!', 'success')
    
    setTimeout(() => {
      router.push('/ditados')
    }, 1500)
  } catch (erro) {
    console.error('Erro ao salvar ditado:', erro)
    
    erroForm.value = mensagemErroDitado(erro, modoEdicao.value ? 'atualizar o ditado' : 'cadastrar o ditado')
    
    mostrarSnackbar('Erro ao salvar ditado', 'error')
  } finally {
    salvando.value = false
  }
}

function mensagemErroDitado(erro, operacao) {
  const status = erro.response?.status
  const resposta = erro.response?.data
  if (status === 403) return 'Você não tem permissão para alterar este ditado.'
  if (status === 404) return 'Ditado não encontrado ou fora do seu escopo.'
  const texto = resposta?.mensagem || resposta?.message || resposta?.title ||
    (resposta?.errors ? Object.values(resposta.errors).flat().join(', ') : '')
  const normalizado = String(texto || '').toLocaleLowerCase()
  if (normalizado.includes('resposta') && normalizado.includes('erro')) {
    selecaoErrosBloqueada.value = true
    return 'A seleção de erros não pode ser alterada porque o ditado já recebeu respostas.'
  }
  return texto || (erro.message ? `Erro de rede ao ${operacao}. Verifique sua conexão com a internet.` : `Não foi possível ${operacao}.`)
}

function getAudioSrc(base64) {
  if (!base64) return ''
  return base64.startsWith('data:audio') ? base64 : `data:audio/mp3;base64,${base64}`
}

function cancelar() {
  if (alteracoesNaoSalvas.value) {
    dialogSair.value = true
  } else {
    voltarParaLista()
  }
}

function confirmarSaida() {
  dialogSair.value = false
  voltarParaLista()
}

function voltarParaLista() {
  router.push('/ditados')
}

function mostrarSnackbar(mensagem, cor = 'success') {
  snackbar.value = {
    show: true,
    mensagem,
    color: cor
  }
}

// Cleanup
onUnmounted(() => {
  if (gravando.value) {
    pararGravacao()
  }
  if (intervaloTempo) {
    clearInterval(intervaloTempo)
  }
})
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}

.border {
  border: 1px solid #e0e0e0;
}

.border-dashed {
  border-style: dashed !important;
}

.w-100 {
  width: 100%;
}
</style>
