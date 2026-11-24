<template>
  <fieldset class="exemplos">
    <legend class="text-body-1 font-weight-medium">
      Exemplos <span class="text-body-2 text-medium-emphasis">opcional</span>
    </legend>
    <p class="text-body-2 text-medium-emphasis mb-3">Mostre um trecho que ilustre o padrão.</p>
    <div v-for="(exemplo, indice) in exemplos" :key="indice" class="mb-4">
      <p class="text-body-2 text-medium-emphasis font-weight-medium mb-2">Exemplo {{ indice + 1 }}</p>
      <div class="exemplo">
        <v-text-field v-model="exemplo.esperado" label="Escrita esperada" placeholder="Ex.: também"
          variant="outlined" density="comfortable" persistent-placeholder maxlength="2000"
          hide-details="auto" :disabled="desabilitado" :error="indiceInvalido === indice && !exemplo.esperado.trim()" />
        <v-text-field v-model="exemplo.resposta" label="Resposta do aluno" placeholder="Ex.: tanbém"
          variant="outlined" density="comfortable" persistent-placeholder maxlength="2000"
          hide-details="auto" :disabled="desabilitado" :error="indiceInvalido === indice && !exemplo.resposta.trim()" />
        <v-btn v-if="exemplos.length > 1" icon="mdi-delete-outline" variant="text" :disabled="desabilitado" type="button"
          :aria-label="`Remover exemplo ${indice + 1}`" :title="`Remover exemplo ${indice + 1}`"
          @click="exemplos.splice(indice, 1)" />
      </div>
    </div>
    <p v-if="indiceInvalido >= 0" class="text-body-2 text-error mt-2" role="alert">
      Preencha a escrita esperada e a resposta do aluno no exemplo {{ indiceInvalido + 1 }}.
    </p>
    <v-btn prepend-icon="mdi-plus" variant="text" color="primary" class="text-none" type="button"
      :disabled="desabilitado || exemplos.length >= limiteExemplos" @click="exemplos.push(novoExemplo())">
      Adicionar exemplo
    </v-btn>
    <p v-if="exemplos.length >= limiteExemplos" class="text-caption text-medium-emphasis" role="status">
      Limite de {{ limiteExemplos }} exemplos
    </p>
  </fieldset>
</template>

<script setup>
import { novoExemplo } from '@/utils/exemplosErro'

const limiteExemplos = 5
const exemplos = defineModel({ type: Array, required: true })
defineProps({
  desabilitado: Boolean,
  indiceInvalido: { type: Number, default: -1 }
})
</script>

<style scoped>
.exemplos { border: 0; padding: 0; min-width: 0; }
.exemplo { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)) auto; gap: 10px; align-items: start; }
@media (max-width: 520px) {
  .exemplo { grid-template-columns: minmax(0, 1fr) auto; }
  .exemplo > :first-child { grid-column: 1; }
  .exemplo > :nth-child(2) { grid-column: 1; grid-row: 2; }
  .exemplo > button { grid-column: 2; grid-row: 1; }
}
</style>
