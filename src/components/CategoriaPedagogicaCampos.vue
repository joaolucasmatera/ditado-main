<template>
  <div>
    <v-select v-model="categoria.codigo" :items="opcoes" :item-title="rotuloCategoriaPedagogica"
      item-value="codigo" label="Categoria pedagógica" variant="outlined" density="comfortable"
      :loading="carregando" :disabled="desabilitado || carregando || falha"
      :error-messages="validar && !categoria.codigo ? 'Selecione a categoria pedagógica.' : []"
      @update:model-value="categoria.nome = ''" hide-details="auto" />
    <v-alert v-if="falha" type="error" variant="tonal" class="mt-2">
      Não foi possível carregar as categorias pedagógicas.
      <v-btn type="button" variant="text" class="text-none" @click="carregar">
        Tentar novamente
      </v-btn>
    </v-alert>
    <v-text-field v-if="categoria.codigo === NAO_ORTOGRAFICO" v-model="categoria.nome" class="mt-3"
      label="Nome da categoria não ortográfica" variant="outlined" density="comfortable"
      maxlength="200" :disabled="desabilitado"
      :error-messages="validar && !categoria.nome.trim() ? 'Informe o nome da categoria.' : []"
      hide-details="auto" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { catalogoErrosService } from '@/services/catalogoErrosService'
import { NAO_ORTOGRAFICO, rotuloCategoriaPedagogica } from '@/utils/categoriaPedagogica'

const categoria = defineModel({ type: Object, required: true })
defineProps({ desabilitado: Boolean, validar: Boolean })
const opcoes = ref([])
const carregando = ref(false)
const falha = ref(false)

async function carregar() {
  carregando.value = true
  falha.value = false
  try {
    opcoes.value = await catalogoErrosService.listarCategoriasPedagogicas()
  } catch {
    falha.value = true
  } finally {
    carregando.value = false
  }
}

onMounted(carregar)
</script>
