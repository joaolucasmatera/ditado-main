<template>
  <section class="marketplace-publicacao">
    <v-card class="mb-6" elevation="1">
      <v-card-text class="pa-6">
        <p class="text-overline text-medium-emphasis">Catálogo de erros</p>
        <h1 class="text-h4 font-weight-bold mb-2">{{ modoEdicao ? 'Editar erro' : 'Publicar erro' }}</h1>
        <p class="text-body-1 text-medium-emphasis">{{ modoEdicao ? 'Atualize a definição enquanto ela ainda não foi usada em um ditado.' : 'Cadastre um padrão de escrita para consulta e uso pedagógico.' }}</p>
      </v-card-text>
    </v-card>

    <v-card v-if="publicado" class="recibo" elevation="1" aria-live="polite" role="status">
      <v-card-text class="pa-6">
        <div class="d-flex flex-wrap align-center ga-3 mb-4">
          <h2 class="text-h5 font-weight-bold">{{ modoEdicao ? 'Erro atualizado' : 'Erro publicado' }}</h2>
          <v-chip color="success" variant="tonal">Ativo</v-chip>
        </div>
        <p class="text-body-1 mb-6">No momento, os erros cadastrados ainda não entram na correção automática.</p>
        <section class="recibo-secao"><h3 class="text-subtitle-1 font-weight-bold mb-4">Publicação</h3><dl class="recibo-grid">
          <div><dt class="text-body-2 text-medium-emphasis">Número do registro</dt><dd class="text-body-1 font-weight-medium">{{ publicado.id }}</dd></div>
          <div><dt class="text-body-2 text-medium-emphasis">Nome do erro</dt><dd class="text-body-1">{{ publicado.nome }}</dd></div>
          <div class="campo-integral"><dt class="text-body-2 text-medium-emphasis">Descrição do erro</dt><dd class="text-body-1">{{ publicado.descricao }}</dd></div>
        </dl></section>
        <section class="recibo-secao"><h3 class="text-subtitle-1 font-weight-bold mb-4">Exemplo</h3><dl class="recibo-grid">
          <div><dt class="text-body-2 text-medium-emphasis">Escrita esperada</dt><dd class="text-body-1">{{ publicado.exemploEsperado || 'Não informado' }}</dd></div>
          <div><dt class="text-body-2 text-medium-emphasis">Resposta do aluno</dt><dd class="text-body-1">{{ publicado.exemploResposta || 'Não informado' }}</dd></div>
        </dl></section>
        <section class="recibo-secao"><h3 class="text-subtitle-1 font-weight-bold mb-4">Orientação pedagógica</h3><dl class="recibo-grid">
          <div><dt class="text-body-2 text-medium-emphasis">Observação pedagógica</dt><dd class="text-body-1">{{ publicado.observacaoPedagogica || 'Não informado' }}</dd></div>
          <div><dt class="text-body-2 text-medium-emphasis">Série/ano</dt><dd class="text-body-1">{{ publicado.serieAno || 'Não informado' }}</dd></div>
        </dl></section>
      </v-card-text>
      <v-divider />
      <v-card-actions class="pa-6">
        <v-spacer />
        <v-btn variant="outlined" size="large" class="text-none" color="primary" prepend-icon="mdi-arrow-left" @click="router.push('/catalogo-erros')">Voltar ao catálogo</v-btn>
        <v-btn v-if="!modoEdicao" variant="flat" size="large" class="text-none px-8" color="primary" prepend-icon="mdi-plus" @click="novaPublicacao">Publicar outro erro</v-btn>
      </v-card-actions>
    </v-card>

    <v-card v-else elevation="1">
      <form novalidate @submit.prevent="publicar" :aria-busy="salvando || carregando">
        <v-progress-linear v-if="carregando" indeterminate color="primary" />
        <v-card-text class="pa-6">
          <v-alert v-if="modoEdicao && metadados && !metadados.ativo" type="warning" variant="tonal" class="mb-6">
            Este erro está arquivado e não pode ser editado. Restaure-o para uso futuro ou publique uma nova definição.
          </v-alert>
          <section class="form-secao mb-6"><h2 class="text-subtitle-1 font-weight-bold mb-4">Dados do erro</h2><div class="mb-6">
            <label for="erro-nome" class="rotulo">Nome do erro <span aria-hidden="true">*</span></label>
            <v-text-field id="erro-nome" v-model="dados.nome" :disabled="salvando || carregando || (modoEdicao && metadados && !metadados.ativo)" maxlength="200" required
              variant="outlined" density="comfortable" persistent-placeholder hide-details="auto"
              placeholder="Ex.: Troca de M por N antes de P ou B" aria-describedby="nome-ajuda" :error-messages="erros.nome || []" />
            <p id="nome-ajuda" class="text-body-2 text-medium-emphasis mt-2">Dê um nome curto para o padrão de escrita.</p>
          </div>
          <div class="mb-6">
            <label for="erro-descricao" class="rotulo">Descrição do erro <span aria-hidden="true">*</span></label>
            <v-textarea id="erro-descricao" v-model="dados.descricao" :disabled="salvando || carregando || (modoEdicao && metadados && !metadados.ativo)" maxlength="10000" rows="4" required
              variant="outlined" density="comfortable" persistent-placeholder hide-details="auto"
              placeholder="Ex.: Ocorre quando o aluno escreve N no lugar de M imediatamente antes de P ou B."
              aria-describedby="descricao-ajuda" :error-messages="erros.descricao || []" />
            <p id="descricao-ajuda" class="text-body-2 text-medium-emphasis mt-2">Explique o que o aluno escreveu e em que situação o erro aparece. Você pode incluir exemplos e orientações.</p>
          </div></section>
          <fieldset class="form-secao exemplo-grupo mb-6">
            <legend class="rotulo">Exemplo <span class="opcional text-medium-emphasis">opcional</span></legend>
            <div class="exemplo">
              <div>
                <label for="erro-esperado" class="rotulo text-body-2">Escrita esperada</label>
                <v-text-field id="erro-esperado" v-model="dados.exemploEsperado" :disabled="salvando || carregando || (modoEdicao && metadados && !metadados.ativo)" maxlength="2000"
                  variant="outlined" density="comfortable" persistent-placeholder hide-details="auto"
                  placeholder="Ex.: também" aria-describedby="exemplo-ajuda" :error-messages="erros.exemplo || []" />
              </div>
              <span class="seta text-medium-emphasis" aria-hidden="true">→</span>
              <div>
                <label for="erro-resposta" class="rotulo text-body-2">Resposta do aluno</label>
                <v-text-field id="erro-resposta" v-model="dados.exemploResposta" :disabled="salvando || carregando || (modoEdicao && metadados && !metadados.ativo)" maxlength="2000"
                  variant="outlined" density="comfortable" persistent-placeholder hide-details="auto"
                  placeholder="Ex.: tanbém" aria-describedby="exemplo-ajuda" :error="!!erros.exemplo" />
              </div>
            </div>
            <p id="exemplo-ajuda" class="text-body-2 text-medium-emphasis mt-2">Mostre um trecho que ilustre o padrão, sem identificar o aluno.</p>
          </fieldset>
          <section class="form-secao mb-6"><h2 class="text-subtitle-1 font-weight-bold mb-4">Orientação pedagógica</h2><div class="mb-6">
            <label for="erro-observacao" class="rotulo">Observação pedagógica <span class="opcional text-medium-emphasis">opcional</span></label>
            <v-textarea id="erro-observacao" v-model="dados.observacaoPedagogica" :disabled="salvando || carregando || (modoEdicao && metadados && !metadados.ativo)" maxlength="10000" rows="3"
              variant="outlined" density="comfortable" persistent-placeholder hide-details="auto"
              placeholder="Ex.: Retomar a regularidade de M antes de P e B." aria-describedby="observacao-ajuda" />
            <p id="observacao-ajuda" class="text-body-2 text-medium-emphasis mt-2">Registre uma orientação para trabalhar esse padrão em sala.</p>
          </div>
          <div>
            <label for="erro-serie" class="rotulo">Série/ano <span class="opcional text-medium-emphasis">opcional</span></label>
            <v-text-field id="erro-serie" v-model="dados.serieAno" :disabled="salvando || carregando || (modoEdicao && metadados && !metadados.ativo)" maxlength="200"
              variant="outlined" density="comfortable" persistent-placeholder hide-details="auto"
              placeholder="Ex.: 3º ano do Ensino Fundamental" aria-describedby="serie-ajuda" />
            <p id="serie-ajuda" class="text-body-2 text-medium-emphasis mt-2">Informe para qual turma ou etapa esta orientação é mais adequada.</p>
          </div></section>
          <v-alert v-if="falha" type="error" variant="tonal" class="mt-6" role="alert">{{ falha }}</v-alert>
          <div v-if="modoEdicao && metadados" class="metadados-edicao mt-8" aria-label="Metadados do erro">
            <div class="metadados-linha">
              <span><strong>Código:</strong> {{ metadados.codigo }}</span>
              <span><strong>Estado:</strong> {{ metadados.ativo ? 'Ativo' : 'Arquivado' }}</span>
              <span><strong>Alterado em:</strong> {{ formatarData(metadados.dataAlteracao) }}</span>
            </div>
            <p class="text-caption text-medium-emphasis mb-0 mt-1">Código, autoria e datas são gerados pelo servidor e não podem ser alterados.</p>
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-6 acoes">
          <span class="text-body-2 text-medium-emphasis">* Campos obrigatórios</span>
          <v-spacer />
          <v-btn type="submit" color="primary" variant="flat" size="large" class="text-none px-8" prepend-icon="mdi-content-save" :loading="salvando" :disabled="salvando || carregando || (modoEdicao && metadados && !metadados.ativo)">{{ modoEdicao ? 'Salvar alterações' : 'Publicar erro' }}</v-btn>
        </v-card-actions>
      </form>
    </v-card>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marketplaceService } from '@/services/marketplaceService'
import { catalogoErrosService } from '@/services/catalogoErrosService'

const vazios = () => ({ nome: '', descricao: '', exemploEsperado: '', exemploResposta: '', observacaoPedagogica: '', serieAno: '' })
const dados = reactive(vazios())
const route = useRoute()
const router = useRouter()
const modoEdicao = ref(Boolean(route.params.id))
const carregando = ref(false)
const metadados = ref(null)
const erros = ref({})
const salvando = ref(false)
const falha = ref('')
const publicado = ref(null)
const camposRecibo = [{ chave: 'nome', label: 'Nome do erro' }, { chave: 'descricao', label: 'Descrição do erro' }, { chave: 'observacaoPedagogica', label: 'Observação pedagógica' }, { chave: 'serieAno', label: 'Série/ano' }]

onMounted(async () => {
  if (!modoEdicao.value) return
  carregando.value = true
  try {
    const erro = await catalogoErrosService.obter(route.params.id)
    metadados.value = erro
    Object.assign(dados, {
      nome: erro.nome || '', descricao: erro.descricao || '', exemploEsperado: erro.exemploEsperado || '',
      exemploResposta: erro.exemploResposta || '', observacaoPedagogica: erro.observacaoPedagogica || '', serieAno: erro.serieAno || ''
    })
  } catch (erro) {
    falha.value = mensagemDeErro(erro, 'carregar')
  } finally {
    carregando.value = false
  }
})

async function publicar() {
  if (salvando.value) return
  erros.value = {}
  falha.value = ''
  if (!dados.nome.trim()) erros.value.nome = 'Informe o nome do erro.'
  if (!dados.descricao.trim()) erros.value.descricao = 'Informe a descrição do erro.'
  if (!!dados.exemploEsperado.trim() !== !!dados.exemploResposta.trim()) erros.value.exemplo = 'Preencha a escrita esperada e a resposta do aluno para informar um exemplo.'
  if (Object.keys(erros.value).length) return
  salvando.value = true
  try {
    publicado.value = modoEdicao.value
      ? await catalogoErrosService.atualizar(route.params.id, { ...dados })
      : await marketplaceService.publicar({ ...dados })
  } catch (erro) {
    falha.value = mensagemDeErro(erro, modoEdicao.value ? 'editar' : 'publicar')
  } finally {
    salvando.value = false
  }
}

function mensagemDeErro(erro, operacao) {
  const status = erro.response?.status
  const resposta = erro.response?.data
  if (status === 403) return 'Você não tem permissão para realizar esta operação.'
  if (status === 404) return 'Erro de catálogo não encontrado ou fora do seu escopo.'
  const texto = resposta?.mensagem || resposta?.message || resposta?.title || (resposta?.errors ? Object.values(resposta.errors).flat().join(' ') : '')
  const normalizado = String(texto || '').toLocaleLowerCase()
  if (normalizado.includes('associ') || normalizado.includes('ditado') || normalizado.includes('usado')) {
    return 'Este erro já foi utilizado em um ditado e não pode mais ser editado. Arquive-o e publique uma nova definição.'
  }
  if (normalizado.includes('arquiv')) return 'Erros arquivados não podem ser editados. Restaure o erro ou publique uma nova definição.'
  return texto || `Não foi possível ${operacao} o erro. Seus dados foram mantidos. Tente novamente.`
}

function formatarData(data) {
  if (!data) return 'Não informada'
  return new Date(data).toLocaleString('pt-BR')
}

function novaPublicacao() {
  Object.assign(dados, vazios())
  publicado.value = null
  erros.value = {}
  falha.value = ''
}
</script>

<style scoped>
.marketplace-publicacao { max-width: 760px; margin: 0 auto; }
.rotulo { display: block; margin-bottom: 8px; font-weight: 600; }
.opcional { font-weight: 400; font-size: .8rem; margin-left: 5px; }
.exemplo-grupo { padding: 0; border: 0; min-width: 0; }
.exemplo { display: grid; grid-template-columns: minmax(0, 1fr) 24px minmax(0, 1fr); gap: 10px; align-items: start; }
.seta { padding-top: 42px; text-align: center; }
.acoes { flex-wrap: wrap; gap: 16px; }
.form-secao { border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); padding-top: 20px; }
.recibo-secao { border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); padding-top: 20px; margin-top: 22px; }
.recibo-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px 24px; }
.campo-integral { grid-column: 1 / -1; }
.recibo dt { margin-top: 0; }
.recibo dd { margin-top: 4px; white-space: pre-wrap; overflow-wrap: anywhere; }
.metadados-edicao { border-top: 1px solid rgba(var(--v-border-color), .45); padding-top: 12px; color: rgba(var(--v-theme-on-surface), .62); font-size: .78rem; }
.metadados-linha { display: flex; flex-wrap: wrap; gap: 4px 18px; }
.metadados-linha strong { font-weight: 600; color: rgba(var(--v-theme-on-surface), .72); }
:deep(input::placeholder), :deep(textarea::placeholder) { opacity: .7; }
@media (max-width: 520px) { .exemplo, .recibo-grid { grid-template-columns: minmax(0, 1fr); } .seta { display: none; } .campo-integral { grid-column: auto; } }
</style>
