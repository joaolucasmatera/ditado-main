<template>
  <section class="marketplace-publicacao">
    <v-card class="mb-6" elevation="1">
      <v-card-text class="pa-6">
        <p class="text-overline text-medium-emphasis">Marketplace</p>
        <h1 class="text-h4 font-weight-bold mb-2">Publicar erro</h1>
        <p class="text-body-1 text-medium-emphasis">Cadastre um padrão de escrita para consulta e uso pedagógico.</p>
      </v-card-text>
    </v-card>

    <v-card v-if="publicado" class="recibo" elevation="1" aria-live="polite" role="status">
      <v-card-text class="pa-6">
        <div class="d-flex flex-wrap align-center ga-3 mb-4">
          <h2 class="text-h5 font-weight-bold">Erro publicado</h2>
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
        <v-btn variant="flat" size="large" class="text-none px-8" color="primary" prepend-icon="mdi-plus" @click="novaPublicacao">Publicar outro erro</v-btn>
      </v-card-actions>
    </v-card>

    <v-card v-else elevation="1">
      <form novalidate @submit.prevent="publicar" :aria-busy="salvando">
        <v-card-text class="pa-6">
          <section class="form-secao mb-6"><h2 class="text-subtitle-1 font-weight-bold mb-4">Dados do erro</h2><div class="mb-6">
            <label for="erro-nome" class="rotulo">Nome do erro <span aria-hidden="true">*</span></label>
            <v-text-field id="erro-nome" v-model="dados.nome" :disabled="salvando" maxlength="200" required
              variant="outlined" density="comfortable" persistent-placeholder hide-details="auto"
              placeholder="Ex.: Troca de M por N antes de P ou B" aria-describedby="nome-ajuda" :error-messages="erros.nome || []" />
            <p id="nome-ajuda" class="text-body-2 text-medium-emphasis mt-2">Dê um nome curto para o padrão de escrita.</p>
          </div>
          <div class="mb-6">
            <label for="erro-descricao" class="rotulo">Descrição do erro <span aria-hidden="true">*</span></label>
            <v-textarea id="erro-descricao" v-model="dados.descricao" :disabled="salvando" maxlength="10000" rows="4" required
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
                <v-text-field id="erro-esperado" v-model="dados.exemploEsperado" :disabled="salvando" maxlength="2000"
                  variant="outlined" density="comfortable" persistent-placeholder hide-details="auto"
                  placeholder="Ex.: também" aria-describedby="exemplo-ajuda" :error-messages="erros.exemplo || []" />
              </div>
              <span class="seta text-medium-emphasis" aria-hidden="true">→</span>
              <div>
                <label for="erro-resposta" class="rotulo text-body-2">Resposta do aluno</label>
                <v-text-field id="erro-resposta" v-model="dados.exemploResposta" :disabled="salvando" maxlength="2000"
                  variant="outlined" density="comfortable" persistent-placeholder hide-details="auto"
                  placeholder="Ex.: tanbém" aria-describedby="exemplo-ajuda" :error="!!erros.exemplo" />
              </div>
            </div>
            <p id="exemplo-ajuda" class="text-body-2 text-medium-emphasis mt-2">Mostre um trecho que ilustre o padrão, sem identificar o aluno.</p>
          </fieldset>
          <section class="form-secao mb-6"><h2 class="text-subtitle-1 font-weight-bold mb-4">Orientação pedagógica</h2><div class="mb-6">
            <label for="erro-observacao" class="rotulo">Observação pedagógica <span class="opcional text-medium-emphasis">opcional</span></label>
            <v-textarea id="erro-observacao" v-model="dados.observacaoPedagogica" :disabled="salvando" maxlength="10000" rows="3"
              variant="outlined" density="comfortable" persistent-placeholder hide-details="auto"
              placeholder="Ex.: Retomar a regularidade de M antes de P e B." aria-describedby="observacao-ajuda" />
            <p id="observacao-ajuda" class="text-body-2 text-medium-emphasis mt-2">Registre uma orientação para trabalhar esse padrão em sala.</p>
          </div>
          <div>
            <label for="erro-serie" class="rotulo">Série/ano <span class="opcional text-medium-emphasis">opcional</span></label>
            <v-text-field id="erro-serie" v-model="dados.serieAno" :disabled="salvando" maxlength="200"
              variant="outlined" density="comfortable" persistent-placeholder hide-details="auto"
              placeholder="Ex.: 3º ano do Ensino Fundamental" aria-describedby="serie-ajuda" />
            <p id="serie-ajuda" class="text-body-2 text-medium-emphasis mt-2">Informe para qual turma ou etapa esta orientação é mais adequada.</p>
          </div></section>
          <v-alert v-if="falha" type="error" variant="tonal" class="mt-6" role="alert">{{ falha }}</v-alert>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-6 acoes">
          <span class="text-body-2 text-medium-emphasis">* Campos obrigatórios</span>
          <v-spacer />
          <v-btn type="submit" color="primary" variant="flat" size="large" class="text-none px-8" prepend-icon="mdi-content-save" :loading="salvando" :disabled="salvando">Publicar erro</v-btn>
        </v-card-actions>
      </form>
    </v-card>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { marketplaceService } from '@/services/marketplaceService'

const vazios = () => ({ nome: '', descricao: '', exemploEsperado: '', exemploResposta: '', observacaoPedagogica: '', serieAno: '' })
const dados = reactive(vazios())
const erros = ref({})
const salvando = ref(false)
const falha = ref('')
const publicado = ref(null)
const camposRecibo = [{ chave: 'nome', label: 'Nome do erro' }, { chave: 'descricao', label: 'Descrição do erro' }, { chave: 'observacaoPedagogica', label: 'Observação pedagógica' }, { chave: 'serieAno', label: 'Série/ano' }]

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
    publicado.value = await marketplaceService.publicar({ ...dados })
  } catch (erro) {
    const resposta = erro.response?.data
    falha.value = resposta?.errors ? Object.values(resposta.errors).flat().join(' ') : 'Não foi possível publicar o erro. Seus dados foram mantidos. Tente novamente.'
  } finally {
    salvando.value = false
  }
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
:deep(input::placeholder), :deep(textarea::placeholder) { opacity: .7; }
@media (max-width: 520px) { .exemplo, .recibo-grid { grid-template-columns: minmax(0, 1fr); } .seta { display: none; } .campo-integral { grid-column: auto; } }
</style>
