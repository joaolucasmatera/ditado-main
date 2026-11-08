<template>
  <div>
    <v-card class="mb-6" elevation="1">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between flex-wrap ga-4">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">Catálogo de erros</h1>
            <p class="text-body-1 text-grey-darken-1">
              Consulte os padrões de escrita disponíveis para usar nos seus ditados.
            </p>
          </div>
          <v-btn
            color="success"
            size="large"
            prepend-icon="mdi-plus"
            to="/catalogo-erros/publicar"
            class="text-none"
          >
            Publicar erro
          </v-btn>
          <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-file-import-outline"
            to="/catalogo-erros/importar"
            variant="outlined"
            class="text-none"
          >
            Importar JSON
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-card class="mb-6" elevation="1">
      <v-card-text class="pa-6">
        <v-row>
          <v-col cols="12" md="8">
            <v-text-field
              v-model="pesquisa"
              prepend-inner-icon="mdi-magnify"
              label="Pesquisar erros"
              placeholder="Busque por nome, descrição ou código"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" md="4" class="d-flex align-center">
            <v-chip color="success" variant="tonal" prepend-icon="mdi-check-circle-outline">
            {{ estado === 'ativo' ? 'Exibindo erros ativos' : 'Exibindo erros arquivados' }}
            </v-chip>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-alert v-if="falha" type="error" variant="tonal" class="mb-6" closable @click:close="falha = ''">
      {{ falha }}
      <template #append>
        <v-btn variant="text" size="small" class="text-none" @click="carregar">Tentar novamente</v-btn>
      </template>
    </v-alert>

    <v-card elevation="1">
      <v-card-title class="bg-grey-lighten-5 pa-4 d-flex align-center">
        <v-icon class="mr-2" color="primary">mdi-book-open-variant</v-icon>
        {{ estado === 'ativo' ? 'Erros ativos' : 'Erros arquivados' }}
        <v-chip class="ml-3" size="small" :color="estado === 'ativo' ? 'primary' : 'warning'" variant="tonal">{{ errosFiltrados.length }}</v-chip>
      </v-card-title>
      <v-card-text class="pa-4 pb-0">
        <v-btn-toggle :model-value="estado" color="primary" mandatory divided>
          <v-btn value="ativo" class="text-none" @click="alterarEstado('ativo')">Ativos</v-btn>
          <v-btn value="arquivado" class="text-none" @click="alterarEstado('arquivado')">Arquivados</v-btn>
        </v-btn-toggle>
      </v-card-text>

      <v-data-table
        :headers="headers"
        :items="errosFiltrados"
        :loading="carregando"
        item-value="id"
        density="comfortable"
        class="elevation-0"
      >
        <template #item.nome="{ item }">
          <div class="font-weight-bold">{{ item.nome }}</div>
          <div class="text-caption text-medium-emphasis">{{ item.codigo }}</div>
        </template>

        <template #item.descricao="{ item }">
          <div class="descricao">{{ item.descricao }}</div>
        </template>

        <template #item.autorId="{ item }">
          <span class="text-medium-emphasis">Autor #{{ item.autorId }}</span>
        </template>

        <template #item.ativo="{ item }">
          <v-chip :color="estado === 'ativo' ? 'success' : 'warning'" size="small" variant="tonal">{{ estado === 'ativo' ? 'Ativo' : 'Arquivado' }}</v-chip>
        </template>

        <template #item.acoes="{ item }">
          <div class="d-flex justify-center ga-1" @click.stop>
            <v-btn icon="mdi-eye" size="small" variant="text" color="primary" title="Ver detalhes" :aria-label="`Ver detalhes do erro ${item.nome}`" @click="abrirDetalhes(item)" />
            <v-btn
              v-if="estado === 'ativo' && podeEditar(item)"
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="info"
              title="Editar erro"
              :aria-label="`Editar erro ${item.nome}`"
              @click="abrirEdicao(item)"
            />
            <v-btn
              :icon="estado === 'ativo' ? 'mdi-archive-arrow-down' : 'mdi-archive-arrow-up'"
              size="small"
              variant="text"
              :color="estado === 'ativo' ? 'warning' : 'success'"
              :title="estado === 'ativo' ? 'Arquivar erro' : 'Restaurar erro'"
              :aria-label="`${estado === 'ativo' ? 'Arquivar' : 'Restaurar'} erro ${item.nome}`"
              @click="abrirAlteracaoEstado(item)"
            />
          </div>
        </template>

        <template #no-data>
          <div class="text-center pa-8 text-grey">
            <v-icon size="56" color="grey-lighten-1" class="mb-3">mdi-book-search-outline</v-icon>
            <p class="text-h6 text-grey-darken-1 mb-2">{{ pesquisa.trim() ? 'Nenhum erro encontrado' : 'Nenhum erro publicado ainda' }}</p>
            <p class="text-body-2 mb-4">{{ pesquisa.trim() ? 'Ajuste a busca para encontrar outro erro.' : 'Publique uma nova definição para começar o catálogo.' }}</p>
            <v-btn v-if="pesquisa.trim()" color="primary" variant="outlined" class="text-none mr-2" @click="pesquisa = ''">Limpar busca</v-btn>
            <v-btn color="primary" to="/catalogo-erros/publicar" prepend-icon="mdi-plus" class="text-none">Publicar erro</v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialogDetalhes" max-width="650">
      <v-card v-if="erroSelecionado">
        <v-card-title class="bg-primary text-white pa-4 d-flex justify-space-between align-center">
          <span><v-icon class="mr-2">mdi-alert-circle-outline</v-icon>Detalhes do erro</span>
          <v-btn icon="mdi-close" variant="text" color="white" aria-label="Fechar detalhes" title="Fechar detalhes" @click="dialogDetalhes = false" />
        </v-card-title>
        <v-card-text class="pa-6">
          <div class="d-flex align-center ga-3 mb-2">
            <h2 class="text-h5 font-weight-bold">{{ erroSelecionado.nome }}</h2>
            <v-chip :color="estado === 'ativo' ? 'success' : 'warning'" size="small" variant="tonal">
              {{ estado === 'ativo' ? 'Ativo' : 'Arquivado' }}
            </v-chip>
          </div>
          <p class="text-caption text-medium-emphasis mb-5">{{ erroSelecionado.codigo }}</p>
          <dl class="detalhes-grid">
            <div class="campo-integral"><dt>Descrição</dt><dd>{{ erroSelecionado.descricao }}</dd></div>
            <div><dt>Exemplo esperado</dt><dd>{{ erroSelecionado.exemploEsperado || 'Não informado' }}</dd></div>
            <div><dt>Resposta do aluno</dt><dd>{{ erroSelecionado.exemploResposta || 'Não informado' }}</dd></div>
            <div class="campo-integral"><dt>Observação pedagógica</dt><dd>{{ erroSelecionado.observacaoPedagogica || 'Não informado' }}</dd></div>
            <div><dt>Série/ano</dt><dd>{{ erroSelecionado.serieAno || 'Não informado' }}</dd></div>
            <div><dt>Data de criação</dt><dd>{{ formatarData(erroSelecionado.dataCriacao) }}</dd></div>
          </dl>
        </v-card-text>
        <v-card-actions class="pa-4 bg-grey-lighten-5"><v-spacer /><v-btn variant="text" class="text-none" @click="dialogDetalhes = false">Fechar</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogEditar" max-width="760" scrollable>
      <v-card>
        <v-card-title class="bg-primary text-white pa-4 d-flex justify-space-between align-center">
          <span><v-icon class="mr-2">mdi-pencil</v-icon>Editar erro</span>
          <v-btn icon="mdi-close" variant="text" color="white" aria-label="Fechar edição" title="Fechar edição" @click="dialogEditar = false" />
        </v-card-title>
        <v-card-text class="pa-6">
          <v-alert v-if="edicaoFalha" type="error" variant="tonal" class="mb-5" role="alert">{{ edicaoFalha }}</v-alert>
          <v-progress-linear v-if="carregandoEdicao" indeterminate color="primary" class="mb-5" />
          <div class="d-flex flex-column ga-4">
            <v-text-field v-model="edicao.nome" label="Nome do erro" variant="outlined" density="comfortable" maxlength="200" :disabled="carregandoEdicao || salvandoEdicao" :error-messages="edicaoErros.nome || []" />
            <v-textarea v-model="edicao.descricao" label="Descrição do erro" variant="outlined" density="comfortable" maxlength="10000" rows="4" :disabled="carregandoEdicao || salvandoEdicao" :error-messages="edicaoErros.descricao || []" />
            <div class="edicao-exemplo">
              <v-text-field v-model="edicao.exemploEsperado" label="Escrita esperada" variant="outlined" density="comfortable" maxlength="2000" :disabled="carregandoEdicao || salvandoEdicao" :error-messages="edicaoErros.exemplo || []" />
              <v-text-field v-model="edicao.exemploResposta" label="Resposta do aluno" variant="outlined" density="comfortable" maxlength="2000" :disabled="carregandoEdicao || salvandoEdicao" :error="!!edicaoErros.exemplo" />
            </div>
            <v-textarea v-model="edicao.observacaoPedagogica" label="Observação pedagógica" variant="outlined" density="comfortable" maxlength="10000" rows="3" :disabled="carregandoEdicao || salvandoEdicao" />
            <v-text-field v-model="edicao.serieAno" label="Série/ano" variant="outlined" density="comfortable" maxlength="200" :disabled="carregandoEdicao || salvandoEdicao" />
          </div>
          <div v-if="erroEditando" class="metadados-edicao mt-6" aria-label="Metadados do erro">
            <div class="metadados-linha">
              <span><strong>Código:</strong> {{ erroEditando.codigo }}</span>
              <span><strong>Estado:</strong> {{ erroEditando.ativo ? 'Ativo' : 'Arquivado' }}</span>
              <span><strong>Alterado em:</strong> {{ formatarData(erroEditando.dataAlteracao) }}</span>
            </div>
            <p class="text-caption text-medium-emphasis mb-0 mt-1">Código, autoria e datas são gerados pelo servidor e não podem ser alterados.</p>
          </div>
        </v-card-text>
        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-btn variant="text" class="text-none" :disabled="salvandoEdicao" @click="dialogEditar = false">Cancelar</v-btn>
          <v-spacer />
          <v-btn color="primary" variant="flat" class="text-none" :loading="salvandoEdicao" :disabled="carregandoEdicao || salvandoEdicao || !edicaoPronta" @click="salvarEdicao">Salvar alterações</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogArquivar" max-width="500">
      <v-card>
        <v-card-title class="pa-4" :class="estado === 'ativo' ? 'bg-amber-lighten-5' : 'bg-green-lighten-5'"><v-icon :color="estado === 'ativo' ? 'warning' : 'success'" class="mr-2">{{ estado === 'ativo' ? 'mdi-archive-alert' : 'mdi-archive-arrow-up' }}</v-icon>{{ estado === 'ativo' ? 'Arquivar erro' : 'Restaurar erro' }}</v-card-title>
        <v-card-text class="pa-6">
          <p class="text-body-1 mb-3">{{ estado === 'ativo' ? 'Arquivar' : 'Restaurar' }} <strong>{{ erroSelecionado?.nome }}</strong>?</p>
          <p class="text-body-2 text-medium-emphasis">{{ estado === 'ativo' ? 'O registro e seu histórico serão preservados, mas ele deixará de ser selecionável em novos ditados.' : 'O erro voltará a ficar disponível para novas seleções, preservando seu identificador e histórico.' }}</p>
        </v-card-text>
        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-btn variant="text" class="text-none" @click="dialogArquivar = false">Cancelar</v-btn>
          <v-spacer />
          <v-btn :color="estado === 'ativo' ? 'warning' : 'success'" variant="flat" class="text-none" :loading="arquivando" @click="confirmarAlteracaoEstado">{{ estado === 'ativo' ? 'Arquivar' : 'Restaurar' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3500">{{ snackbar.mensagem }}</v-snackbar>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { catalogoErrosService } from '@/services/catalogoErrosService'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const erros = ref([])
const pesquisa = ref('')
const estado = ref(route.query.estado === 'arquivado' ? 'arquivado' : 'ativo')
const carregando = ref(false)
const arquivando = ref(false)
const falha = ref('')
const dialogDetalhes = ref(false)
const dialogEditar = ref(false)
const dialogArquivar = ref(false)
const erroSelecionado = ref(null)
const erroEditando = ref(null)
const carregandoEdicao = ref(false)
const salvandoEdicao = ref(false)
const edicaoPronta = ref(false)
const edicaoFalha = ref('')
const edicaoErros = ref({})
const edicao = reactive({ nome: '', descricao: '', exemploEsperado: '', exemploResposta: '', observacaoPedagogica: '', serieAno: '' })
const snackbar = ref({ show: false, mensagem: '', color: 'success' })

const headers = [
  { title: 'Nome do erro', key: 'nome', sortable: true },
  { title: 'Descrição', key: 'descricao', sortable: false },
  { title: 'Autoria', key: 'autorId', sortable: false },
  { title: 'Estado', key: 'ativo', align: 'center', sortable: false },
  { title: 'Ações', key: 'acoes', align: 'center', sortable: false }
]
const errosFiltrados = computed(() => {
  const termo = pesquisa.value.trim().toLocaleLowerCase()
  if (!termo) return erros.value
  return erros.value.filter(erro => [erro.nome, erro.descricao, erro.codigo].some(valor => valor?.toLocaleLowerCase().includes(termo)))
})

onMounted(carregar)
watch(() => route.query.estado, valor => {
  const proximoEstado = valor === 'arquivado' ? 'arquivado' : 'ativo'
  if (estado.value !== proximoEstado) estado.value = proximoEstado
  carregar()
})

async function carregar() {
  carregando.value = true
  falha.value = ''
  try {
    erros.value = await catalogoErrosService.listar(estado.value)
  } catch (erro) {
    console.error('Erro ao carregar catálogo de erros:', erro)
    falha.value = erro.response?.status === 403 ? 'Você não tem permissão para consultar o catálogo de erros.' : 'Não foi possível carregar o catálogo de erros.'
  } finally {
    carregando.value = false
  }
}

async function abrirDetalhes(item) {
  try {
    erroSelecionado.value = await catalogoErrosService.obter(item.id)
  } catch (erro) {
    erroSelecionado.value = item
  }
  dialogDetalhes.value = true
}

async function abrirEdicao(item) {
  dialogEditar.value = true
  carregandoEdicao.value = true
  edicaoPronta.value = false
  edicaoFalha.value = ''
  edicaoErros.value = {}
  erroEditando.value = item
  Object.assign(edicao, { nome: '', descricao: '', exemploEsperado: '', exemploResposta: '', observacaoPedagogica: '', serieAno: '' })
  try {
    const erro = await catalogoErrosService.obter(item.id)
    erroEditando.value = erro
    Object.assign(edicao, {
      nome: erro.nome || '', descricao: erro.descricao || '', exemploEsperado: erro.exemploEsperado || '',
      exemploResposta: erro.exemploResposta || '', observacaoPedagogica: erro.observacaoPedagogica || '', serieAno: erro.serieAno || ''
    })
    edicaoPronta.value = true
  } catch (erro) {
    edicaoFalha.value = erro.response?.data?.mensagem || 'Não foi possível carregar os dados do erro.'
  } finally {
    carregandoEdicao.value = false
  }
}

async function salvarEdicao() {
  edicaoErros.value = {}
  if (!edicao.nome.trim()) edicaoErros.value.nome = 'Informe o nome do erro.'
  if (!edicao.descricao.trim()) edicaoErros.value.descricao = 'Informe a descrição do erro.'
  if (!!edicao.exemploEsperado.trim() !== !!edicao.exemploResposta.trim()) edicaoErros.value.exemplo = 'Preencha os dois campos do exemplo ou deixe ambos vazios.'
  if (Object.keys(edicaoErros.value).length) return

  salvandoEdicao.value = true
  edicaoFalha.value = ''
  try {
    const atualizado = await catalogoErrosService.atualizar(erroEditando.value.id, { ...edicao })
    const indice = erros.value.findIndex(erro => erro.id === atualizado.id)
    if (indice >= 0) erros.value.splice(indice, 1, atualizado)
    erroEditando.value = atualizado
    dialogEditar.value = false
    mostrarSnackbar('Erro atualizado com sucesso.', 'success')
  } catch (erro) {
    edicaoFalha.value = erro.response?.data?.mensagem || 'Não foi possível atualizar o erro.'
  } finally {
    salvandoEdicao.value = false
  }
}

function abrirAlteracaoEstado(item) {
  erroSelecionado.value = item
  dialogArquivar.value = true
}

async function confirmarAlteracaoEstado() {
  arquivando.value = true
  try {
    if (estado.value === 'ativo') await catalogoErrosService.arquivar(erroSelecionado.value.id)
    else await catalogoErrosService.restaurar(erroSelecionado.value.id)
    erros.value = erros.value.filter(erro => erro.id !== erroSelecionado.value.id)
    dialogArquivar.value = false
    mostrarSnackbar(estado.value === 'ativo' ? 'Erro arquivado com sucesso.' : 'Erro restaurado com sucesso.', 'success')
  } catch (erro) {
    mostrarSnackbar(erro.response?.data?.mensagem || `Não foi possível ${estado.value === 'ativo' ? 'arquivar' : 'restaurar'} o erro.`, 'error')
  } finally {
    arquivando.value = false
  }
}

function alterarEstado(proximoEstado) {
  router.push({ path: '/catalogo-erros', query: { estado: proximoEstado } })
}

function podeEditar(item) {
  return authStore.ehAdministrador || String(item.autorId) === String(authStore.usuario?.id)
}

function formatarData(data) {
  if (!data) return 'Não informada'
  return new Date(data).toLocaleDateString('pt-BR')
}

function mostrarSnackbar(mensagem, color) {
  snackbar.value = { show: true, mensagem, color }
}
</script>

<style scoped>
.descricao { max-width: 430px; white-space: normal; }
.detalhes-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px 24px; }
.detalhes-grid dt { color: rgba(var(--v-theme-on-surface), .62); font-size: .875rem; }
.detalhes-grid dd { margin-top: 4px; white-space: pre-wrap; overflow-wrap: anywhere; }
.campo-integral { grid-column: 1 / -1; }
.edicao-exemplo { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.metadados-edicao { border-top: 1px solid rgba(var(--v-border-color), .45); padding-top: 12px; color: rgba(var(--v-theme-on-surface), .62); font-size: .78rem; }
.metadados-linha { display: flex; flex-wrap: wrap; gap: 4px 18px; }
.metadados-linha strong { font-weight: 600; color: rgba(var(--v-theme-on-surface), .72); }
@media (max-width: 520px) { .detalhes-grid { grid-template-columns: 1fr; } .campo-integral { grid-column: auto; } }
@media (max-width: 600px) { .edicao-exemplo { grid-template-columns: 1fr; gap: 0; } }
</style>
