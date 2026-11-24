<template>
  <div class="pa-4 pt-0" @click.stop>
    <p v-if="jaTentou" class="text-body-2 text-medium-emphasis mb-2">
      Clique em <strong>Resultados</strong> para ver a correção da IA.
    </p>
    <v-card-actions class="pa-0 flex-wrap ga-2">
      <v-btn v-if="jaTentou" class="text-none flex-grow-1" color="primary" variant="flat"
        prepend-icon="mdi-chart-box-outline" :loading="buscando" @click="abrirResultado">
        Resultados
      </v-btn>
      <v-btn class="text-none flex-grow-1" :color="jaTentou ? 'secondary' : 'primary'" variant="flat"
        prepend-icon="mdi-play" :disabled="buscando" :to="{ name: 'RealizarDitado', params: { id: ditadoId } }">
        {{ jaTentou ? 'Tentar novamente' : 'Iniciar Ditado' }}
      </v-btn>
    </v-card-actions>
    <p v-if="mensagem" class="text-body-2 text-error mt-2" role="alert">{{ mensagem }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ditadoService } from '@/services/ditadoService'

const props = defineProps({
  ditadoId: { type: Number, required: true },
  jaTentou: Boolean
})
const router = useRouter()
const buscando = ref(false)
const mensagem = ref('')

async function abrirResultado() {
  if (buscando.value) return
  buscando.value = true
  mensagem.value = ''
  const rota = router.currentRoute.value

  try {
    const tentativas = await ditadoService.listarMinhasTentativas(props.ditadoId)
    if (router.currentRoute.value !== rota) return

    const ultima = tentativas.at(-1)
    if (!ultima) {
      mensagem.value = 'Nenhum resultado disponível para este ditado.'
      return
    }
    await router.push({ name: 'ResultadoAluno', query: { tentativa: ultima.tentativaId } })
  } catch {
    mensagem.value = 'Não foi possível abrir o resultado. Tente novamente.'
  } finally {
    buscando.value = false
  }
}
</script>
