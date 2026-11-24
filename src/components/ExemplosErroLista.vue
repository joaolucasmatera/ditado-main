<template>
  <div v-if="exemplos.length" class="d-flex flex-column ga-3">
    <dl v-for="(exemplo, indice) in exemplos" :key="indice" class="par-exemplo">
      <div>
        <dt class="text-body-2 text-medium-emphasis">Escrita esperada</dt>
        <dd>{{ exemplo.esperado }}</dd>
      </div>
      <div>
        <dt class="text-body-2 text-medium-emphasis">Resposta do aluno</dt>
        <dd>{{ exemplo.resposta }}</dd>
      </div>
    </dl>
  </div>
  <p v-else>Nenhum exemplo informado.</p>
</template>

<script setup>
import { computed } from 'vue'
import { lerExemplos } from '@/utils/exemplosErro'

const props = defineProps({ erro: { type: Object, required: true } })
const exemplos = computed(() => lerExemplos(props.erro))
</script>

<style scoped>
.par-exemplo { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; overflow-wrap: anywhere; }
@media (max-width: 520px) { .par-exemplo { grid-template-columns: minmax(0, 1fr); } }
</style>
