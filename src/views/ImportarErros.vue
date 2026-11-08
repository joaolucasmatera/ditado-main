<template>
  <section class="catalogo-importacao">
    <v-card class="mb-6" elevation="1">
      <v-card-text class="pa-6">
        <p class="text-overline text-medium-emphasis">Catálogo de erros</p>
        <h1 class="text-h4 font-weight-bold mb-2">Importar erros em JSON</h1>
        <p class="text-body-1 text-medium-emphasis">Envie definições em lote e revise o resultado antes de concluir.</p>
      </v-card-text>
    </v-card>

    <v-stepper v-model="etapa" :items="etapas" alt-labels class="mb-6">
      <template #item.1>
        <v-card flat>
          <v-card-text class="pa-6">
            <h2 class="text-h6 font-weight-bold mb-4">1. Escolha o arquivo</h2>
            <v-file-input
              v-model="arquivo"
              accept="application/json,.json"
              label="Arquivo JSON"
              placeholder="Selecione um arquivo .json"
              prepend-icon="mdi-file-code-outline"
              variant="outlined"
              show-size
              clearable
              :disabled="enviando"
              :error-messages="erroArquivo"
              aria-describedby="importacao-ajuda"
              @update:model-value="validarArquivo"
            />
            <p id="importacao-ajuda" class="text-body-2 text-medium-emphasis mt-4 mb-0" role="note">
              Versão suportada: <strong>schemaVersion 1</strong>. Limite do arquivo: <strong>256 KB</strong>. O servidor limita o lote a <strong>100 itens</strong> e rejeita campos desconhecidos e códigos duplicados sem sobrescrever registros.
            </p>
            <v-alert v-if="falha" type="error" variant="tonal" class="mt-4" role="alert">{{ falha }}</v-alert>
          </v-card-text>
          <v-card-actions class="pa-6">
            <v-btn variant="text" class="text-none" @click="router.push('/catalogo-erros')">Cancelar</v-btn>
            <v-spacer />
            <v-btn color="primary" variant="flat" class="text-none" :disabled="!arquivoValido || enviando" :loading="enviando" @click="enviar">Validar e enviar</v-btn>
          </v-card-actions>
        </v-card>
      </template>

      <template #item.2>
        <v-card flat>
          <v-card-text class="pa-6">
            <h2 class="text-h6 font-weight-bold mb-4">2. Revise o resultado</h2>
            <v-alert v-if="resultado?.mensagem" :type="resultado.rejeitados.length ? 'warning' : 'success'" variant="tonal" class="mb-5" role="status" aria-live="polite">{{ resultado.mensagem }}</v-alert>
            <v-row>
              <v-col cols="12" md="6"><v-card variant="outlined"><v-card-text><div class="text-overline">Criados</div><div class="text-h4 font-weight-bold text-success">{{ resultado?.criados.length || 0 }}</div></v-card-text></v-card></v-col>
              <v-col cols="12" md="6"><v-card variant="outlined"><v-card-text><div class="text-overline">Rejeitados</div><div class="text-h4 font-weight-bold text-warning">{{ resultado?.rejeitados.length || 0 }}</div></v-card-text></v-card></v-col>
            </v-row>
            <v-alert v-if="resultado?.rejeitados.length" type="warning" variant="tonal" class="mt-5">
              Itens rejeitados não alteraram registros existentes. Corrija os motivos abaixo e envie um novo arquivo, se necessário.
            </v-alert>
            <v-table v-if="resultado?.rejeitados.length" class="mt-4" density="comfortable">
              <thead><tr><th>Índice</th><th>Campo</th><th>Motivo</th></tr></thead>
              <tbody><tr v-for="item in resultado.rejeitados" :key="`${item.indice}-${item.campo}-${item.motivo}`"><td>{{ item.indice ?? '-' }}</td><td>{{ item.campo || '-' }}</td><td>{{ item.motivo || 'Item rejeitado' }}</td></tr></tbody>
            </v-table>
            <v-list v-if="resultado?.criados.length" class="mt-4" lines="one" border>
              <v-list-subheader>Itens criados</v-list-subheader>
              <v-list-item v-for="item in resultado.criados" :key="`${item.indice}-${item.id}`" title="Item importado">
                <template #prepend><v-icon color="success">mdi-check-circle-outline</v-icon></template>
                <template #subtitle>Índice {{ item.indice }} · ID {{ item.id }}</template>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions class="pa-6"><v-spacer /><v-btn color="primary" variant="flat" class="text-none" @click="etapa = 3">Concluir revisão</v-btn></v-card-actions>
        </v-card>
      </template>

      <template #item.3>
        <v-card flat>
            <v-card-text class="pa-8 text-center" role="status" aria-live="polite">
            <v-icon size="64" color="success" class="mb-4">mdi-check-circle-outline</v-icon>
            <h2 class="text-h5 font-weight-bold mb-2">Importação concluída</h2>
            <p class="text-body-1 text-medium-emphasis mb-6">O resultado foi processado pelo servidor. Itens rejeitados permanecem sem alteração.</p>
            <v-btn color="primary" variant="flat" class="text-none" @click="router.push('/catalogo-erros')">Voltar ao catálogo</v-btn>
          </v-card-text>
        </v-card>
      </template>
    </v-stepper>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { catalogoErrosService } from '@/services/catalogoErrosService'

const router = useRouter()
const etapas = ['Arquivo', 'Revisão', 'Conclusão']
const etapa = ref(1)
const arquivo = ref(null)
const erroArquivo = ref('')
const falha = ref('')
const enviando = ref(false)
const resultado = ref(null)
const limiteBytes = 256 * 1024
const arquivoValido = computed(() => arquivo.value && !erroArquivo.value)

function validarArquivo(valor) {
  const selecionado = Array.isArray(valor) ? valor[0] : valor
  arquivo.value = selecionado || null
  erroArquivo.value = ''
  falha.value = ''
  if (!selecionado) return
  if (!selecionado.name.toLocaleLowerCase().endsWith('.json')) erroArquivo.value = 'Selecione um arquivo com extensão .json.'
  else if (selecionado.size > limiteBytes) erroArquivo.value = 'O arquivo excede o limite de 256 KB.'
}

async function enviar() {
  if (!arquivoValido.value || enviando.value) return
  enviando.value = true
  falha.value = ''
  try {
    const resposta = await catalogoErrosService.importar(arquivo.value)
    resultado.value = normalizarResultado(resposta)
    etapa.value = 2
  } catch (erro) {
    const resposta = erro.response?.data
    if (resposta?.criados || resposta?.rejeitados) {
      resultado.value = normalizarResultado(resposta)
      etapa.value = 2
    } else if (erro.response?.status === 401) falha.value = 'Sua sessão expirou. Faça login novamente.'
    else if (erro.response?.status === 403) falha.value = 'Você não tem permissão para importar erros.'
    else if (erro.response?.status === 400) falha.value = resposta?.mensagem || resposta?.title || 'O arquivo foi rejeitado. Confira schemaVersion, campos, limites e códigos duplicados.'
    else falha.value = 'Não foi possível enviar o arquivo. Tente novamente.'
  } finally {
    enviando.value = false
  }
}

function normalizarResultado(resposta) {
  return {
    mensagem: resposta?.mensagem || resposta?.message || '',
    criados: Array.isArray(resposta?.criados) ? resposta.criados : [],
    rejeitados: Array.isArray(resposta?.rejeitados) ? resposta.rejeitados : []
  }
}
</script>

<style scoped>
.catalogo-importacao { max-width: 900px; margin: 0 auto; }
</style>
