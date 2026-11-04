<template>
  <v-container>
    <div v-if="carregando" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="text-grey mt-4">Carregando resultado...</p>
    </div>

    <v-row v-else-if="resultado">
      <v-col cols="12">
        <!-- Card de Nota Perfeita -->
        <v-card v-if="resultado.nota === 100" elevation="4" class="mb-6 perfection-card">
          <v-card-text class="pa-8 text-center">
            <div class="trophy-container">
              <v-icon size="80" color="amber-darken-1" class="trophy-icon">mdi-trophy</v-icon>
            </div>
            <h2 class="text-h4 font-weight-bold mt-4 mb-2 text-amber-darken-2">🎉 Nota Perfeita! 🎉</h2>
            <p class="text-h6 mb-3">Você acertou todas as palavras!</p>
            <div class="stars-container">
              <v-icon v-for="i in 3" :key="i" size="32" color="amber" class="star-icon">mdi-star</v-icon>
            </div>
          </v-card-text>
        </v-card>

        <!-- Resumo do Resultado -->
        <v-card elevation="1" class="mb-6">
          <v-card-title class="pa-6 d-flex align-center border-b bg-success-lighten-5">
            <v-icon class="mr-3" color="success" size="large">mdi-check-circle</v-icon>
            <span class="text-h5 font-weight-bold">Ditado Concluído!</span>
          </v-card-title>
          <v-card-text class="pa-6">
            <v-row>
              <v-col cols="12" md="3">
                <v-list-item>
                  <v-list-item-subtitle class="text-caption">Sua Nota</v-list-item-subtitle>
                  <v-list-item-title class="text-h4 font-weight-bold" :class="obterCorNota(resultado.nota)">
                    {{ resultado.nota?.toFixed(1) }}%
                  </v-list-item-title>
                </v-list-item>
              </v-col>
              <v-col cols="12" md="3">
                <v-list-item>
                  <v-list-item-subtitle>Total de Palavras</v-list-item-subtitle>
                  <v-list-item-title class="text-h6">{{ resultado.totalLacunas }}</v-list-item-title>
                </v-list-item>
              </v-col>
              <v-col cols="12" md="3">
                <v-list-item>
                  <v-list-item-subtitle>Acertos</v-list-item-subtitle>
                  <v-list-item-title class="text-h6 text-success">{{ resultado.acertos }}</v-list-item-title>
                </v-list-item>
              </v-col>
              <v-col cols="12" md="3">
                <v-list-item>
                  <v-list-item-subtitle>Erros</v-list-item-subtitle>
                  <v-list-item-title class="text-h6 text-error">{{ resultado.erros }}</v-list-item-title>
                </v-list-item>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Detalhes das Respostas -->
        <v-card elevation="1" class="mb-6">
          <v-card-title class="pa-6 d-flex align-center border-b">
            <v-icon class="mr-3" color="info">mdi-text-box-check</v-icon>
            <span class="text-h6 font-weight-bold">Detalhes das Respostas</span>
          </v-card-title>
          <v-card-text class="pa-0">
            <v-table>
              <thead>
                <tr>
                  <th class="text-center">#</th>
                  <th class="text-left">Sua Resposta</th>
                  <th class="text-left">Resposta Esperada</th>
                  <th class="text-center">Resultado</th>
                  <th class="text-left">Tipo de Erro</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(detalhe, index) in resultado.detalhes" :key="detalhe.segmentoId" :class="detalhe.correto ? 'bg-success-lighten-5' : 'bg-error-lighten-5'">
                  <td class="text-center font-weight-bold">{{ index + 1 }}</td>
                  <td>
                    <span :class="detalhe.correto ? 'text-success font-weight-bold' : 'text-error font-weight-bold'">
                      {{ detalhe.respostaFornecida || '(vazio)' }}
                    </span>
                  </td>
                  <td class="font-weight-medium">{{ detalhe.respostaEsperada }}</td>
                  <td class="text-center">
                    <v-icon :color="detalhe.correto ? 'success' : 'error'">
                      {{ detalhe.correto ? 'mdi-check-circle' : 'mdi-close-circle' }}
                    </v-icon>
                  </td>
                  <td>
                    <v-chip v-if="!detalhe.correto && detalhe.tipoErro" color="error" size="small" variant="outlined">
                      {{ detalhe.tipoErro }}
                    </v-chip>
                    <span v-else>-</span>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>

        <!-- Botões de Ação -->
        <v-row>
          <v-col cols="12" class="text-center">
            <v-btn color="primary" size="large" prepend-icon="mdi-home" @click="voltarParaDitados">
              Voltar para Meus Ditados
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.mensagem }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const resultado = ref(null);
const carregando = ref(true);

const snackbar = ref({
  show: false,
  mensagem: '',
  color: 'info',
});

onMounted(async () => {
  // O resultado vem do state do history (passado após submissão)
  const resultadoData = window.history.state?.resultado;
  
  if (resultadoData) {
    resultado.value = resultadoData;
    carregando.value = false;
  } else {
    mostrarSnackbar('Nenhum resultado encontrado. Redirecionando...', 'error');
    setTimeout(() => {
      router.push('/aluno');
    }, 2000);
    carregando.value = false;
  }
});

function obterCorNota(nota) {
  if (nota >= 80) return 'success';
  if (nota >= 60) return 'warning';
  return 'error';
}

function voltarParaDitados() {
  router.push('/aluno');
}

function mostrarSnackbar(mensagem, cor = 'info') {
  snackbar.value = {
    show: true,
    mensagem,
    color: cor,
  };
}
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid #e0e0e0;
}

/* Card de nota perfeita */
.perfection-card {
  background: linear-gradient(135deg, #fff9c4 0%, #fff59d 100%);
  border: 2px solid #ffc107;
  position: relative;
  overflow: hidden;
}

.perfection-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 193, 7, 0.1) 0%, transparent 70%);
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(10%, 10%);
  }
}

.trophy-container {
  position: relative;
  display: inline-block;
}

.trophy-icon {
  animation: float 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.stars-container {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
}

.star-icon {
  animation: pulse 1.5s ease-in-out infinite;
}

.star-icon:nth-child(2) {
  animation-delay: 0.3s;
}

.star-icon:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
}
</style>
