<template>
  <div>
    <v-card class="mb-6" elevation="1">
      <v-card-text class="pa-6">
        <h1 class="text-h4 font-weight-bold mb-2">
          Bem-vindo(a), {{ authStore.usuario?.nome?.split(" ")[0] }}
        </h1>
        <p class="text-body-1 text-grey-darken-1">
          Gerencie textos, turmas, relatórios e ditados passados
        </p>
      </v-card-text>
    </v-card>

    <v-row class="mb-6">
      <v-col cols="12" md="4">
        <v-card elevation="1" class="h-100 action-card" hover @click="irParaCadastroTextos">
          <v-card-text class="pa-6 text-center">
            <v-icon size="64" color="primary" class="mb-4">mdi-file-document-plus</v-icon>
            <h3 class="text-h6 font-weight-bold mb-2">Cadastro de Ditados</h3>
            <p class="text-body-2 text-grey-darken-1">
              Crie e organize textos para futuras sessões de ditado.
            </p>
            <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" class="mt-4 text-none">
              Novo ditado
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card
          elevation="1"
          class="h-100 action-card"
          hover
          @click="irParaGerenciamentoTurmas"
          :class="{ 'action-card-destaque': temSolicitacoesPendentes }"
        >
          <v-card-text class="pa-6 text-center">
            <v-badge
              v-if="temSolicitacoesPendentes"
              color="error"
              floating
              :content="totalSolicitacoesPendentes"
              class="mb-4"
            >
              <v-icon size="64" color="success">mdi-school</v-icon>
            </v-badge>
            <v-icon v-else size="64" color="success" class="mb-4">mdi-school</v-icon>
            <h3 class="text-h6 font-weight-bold mb-2">Gerenciamento de Turma</h3>
            <p class="text-body-2 text-grey-darken-1">
              Adicione alunos, organize grupos e defina sessões.
            </p>
            <v-btn
              color="success"
              variant="flat"
              prepend-icon="mdi-account-plus"
              class="mt-4 text-none"
            >
              Novo aluno
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card elevation="1" class="h-100 action-card" hover @click="irParaRelatorios">
          <v-card-text class="pa-6 text-center">
            <v-icon size="64" color="info" class="mb-4">mdi-chart-line</v-icon>
            <h3 class="text-h6 font-weight-bold mb-2">Relatórios</h3>
            <p class="text-body-2 text-grey-darken-1">
              Acompanhe evolução por aluno, turma e habilidade.
            </p>
            <v-btn
              color="info"
              variant="flat"
              prepend-icon="mdi-chart-box"
              class="mt-4 text-none"
            >
              Visão geral
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card v-if="temSolicitacoesPendentes" class="mb-6 elevation-1 border-error">
      <v-card-title class="bg-error text-white pa-4 d-flex align-center">
        <v-icon class="mr-2">mdi-bell-ring</v-icon>
        Solicitações de Ingresso Pendentes
        <v-chip color="white" text-color="error" size="small" class="ml-2">
          {{ totalSolicitacoesPendentes }}
        </v-chip>
      </v-card-title>

      <v-card-text class="pa-6">
        <v-list class="bg-transparent">
          <v-list-item
            v-for="solicitacao in solicitacoesPendentes"
            :key="solicitacao.id"
            class="mb-3 rounded border"
            elevation="0"
          >
            <template v-slot:prepend>
              <v-avatar color="warning">
                {{ obterIniciaisUsuario(solicitacao.usuario) }}
              </v-avatar>
            </template>

            <v-list-item-title class="text-h6 font-weight-bold mb-1">
              {{ solicitacao.usuario?.nome }}
            </v-list-item-title>

            <v-list-item-subtitle class="text-body-2 mb-2">
              <div>
                <div>{{ solicitacao.usuario?.email }}</div>
                <div class="text-caption mt-1">
                  Solicitado em {{ formatarData(solicitacao.dataSolicitacao) }}
                  <v-chip color="info" variant="flat" size="x-small" class="ml-2">
                    {{ solicitacao.turma?.nome }}
                  </v-chip>
                </div>
              </div>
            </v-list-item-subtitle>

            <template v-slot:append>
              <div class="d-flex gap-2">
                <v-btn
                  icon="mdi-check"
                  size="small"
                  variant="flat"
                  color="success"
                  @click="aprovarSolicitacao(solicitacao)"
                />
                <v-btn
                  icon="mdi-close"
                  size="small"
                  variant="flat"
                  color="error"
                  @click="rejeitarSolicitacao(solicitacao)"
                />
              </div>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <v-card elevation="1">
      <v-card-title class="pa-6 d-flex align-center border-b">
        <v-icon class="mr-3" color="grey-darken-2">mdi-headphones</v-icon>
        <span class="text-h6 font-weight-bold">Ditados passados</span>
        <v-spacer></v-spacer>
        <v-chip color="warning" variant="flat"> Últimos 30 dias </v-chip>
      </v-card-title>

      <v-card-text class="pa-6">
        <v-row class="mb-4">
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="filtroDitados"
              label="Filtrar por ditado ou turma"
              placeholder="Digite o título do ditado ou nome da turma"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
              v-model="filtroTurma"
              label="Turma"
              :items="turmasUnicas"
              item-title="nome"
              item-value="nome"
              placeholder="Todas as turmas"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
            />
          </v-col>
        </v-row>

        <div v-if="carregandoDitados" class="text-center py-12">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="text-grey mt-4">Carregando ditados...</p>
        </div>

        <div v-else-if="ditadosFiltrados.length === 0" class="text-center py-12">
          <v-icon size="64" color="grey-lighten-1">mdi-folder-open-outline</v-icon>
          <p class="text-body-1 text-grey mt-4">Nenhum ditado atribuído encontrado</p>
          <v-btn
            color="primary"
            variant="flat"
            prepend-icon="mdi-plus"
            class="mt-4 text-none"
            @click="irParaCadastroTextos"
          >
            Configure um novo ditado a partir de um texto existente na sua biblioteca
          </v-btn>
        </div>

        <div v-else>
          <v-list class="bg-transparent">
            <v-list-item
              v-for="ditado in ditadosFiltrados"
              :key="ditado.ditadoId"
              class="mb-3 rounded border"
              elevation="0"
              @click="verDetalhesDitado(ditado)"
              style="cursor: pointer"
            >
              <template v-slot:prepend>
                <v-avatar color="primary" size="48">
                  <v-icon color="white">mdi-headphones</v-icon>
                </v-avatar>
              </template>

              <v-list-item-title class="text-h6 font-weight-bold mb-1">
                {{ ditado.ditadoTitulo }}
                <v-chip
                  :color="ditado.vencido ? 'error' : 'success'"
                  variant="flat"
                  size="x-small"
                  class="ml-2"
                >
                  {{ ditado.vencido ? 'Vencido' : 'Ativo' }}
                </v-chip>
              </v-list-item-title>

              <v-list-item-subtitle class="text-body-2">
                <span class="font-weight-medium">Turma:</span> {{ ditado.turmaNome }}
                <br />
                <v-icon size="16" class="mr-1">mdi-calendar-alert</v-icon>
                Data limite: {{ formatarData(ditado.dataLimite) }}
                <br />
                <v-icon size="16" class="mr-1">mdi-account-multiple</v-icon>
                {{ ditado.alunosQueFizeram }} / {{ ditado.totalAlunos }} alunos ({{
                  ditado.percentualConclusao
                }}%)
              </v-list-item-subtitle>

              <template v-slot:append>
                <div class="d-flex align-center gap-2">
                  <v-chip
                    :color="obterCorMedia(ditado.notaMedia)"
                    variant="flat"
                    size="large"
                  >
                    <v-icon start size="18">mdi-check-circle</v-icon>
                    Média {{ ditado.notaMedia }}%
                  </v-chip>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </div>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.mensagem }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { ditadoService } from "@/services/ditadoService";

const router = useRouter();
const authStore = useAuthStore();

const estatisticas = ref({
  turmas: 0,
  ditados: 0,
});

const ditados = ref([]);
const solicitacoesPendentes = ref([]);
const carregandoDitados = ref(false);
const carregandoEstatisticas = ref(false);
const filtroDitados = ref("");
const filtroTurma = ref(null);

const series = [
  "1º ano",
  "2º ano",
  "3º ano",
  "4º ano",
  "5º ano",
  "6º ano",
  "7º ano",
  "8º ano",
  "9º ano",
];

const snackbar = ref({
  show: false,
  mensagem: "",
  color: "info",
});

const ditadosFiltrados = computed(() => {
  let resultado = [...ditados.value];

  if (filtroDitados.value && filtroDitados.value.trim() !== "") {
    const busca = filtroDitados.value.toLowerCase().trim();
    resultado = resultado.filter(
      (d) =>
        d.ditadoTitulo?.toLowerCase().includes(busca) ||
        d.turmaNome?.toLowerCase().includes(busca)
    );
  }

  if (filtroTurma.value) {
    resultado = resultado.filter((d) => d.turmaNome === filtroTurma.value);
  }

  resultado.sort((a, b) => {
    if (a.vencido && !b.vencido) return -1;
    if (!a.vencido && b.vencido) return 1;
    return new Date(a.dataLimite).getTime() - new Date(b.dataLimite).getTime();
  });

  return resultado;
});

const temSolicitacoesPendentes = computed(
  () => solicitacoesPendentes.value.length > 0
);
const totalSolicitacoesPendentes = computed(
  () => solicitacoesPendentes.value.length
);

const turmasUnicas = computed(() => {
  const uniqueTurmas = new Set();
  ditados.value.forEach((ditado) => {
    if (ditado.turmaNome) {
      uniqueTurmas.add(ditado.turmaNome);
    }
  });
  return Array.from(uniqueTurmas).map((turmaNome) => ({ nome: turmaNome }));
});

onMounted(() => {
  buscarEstatisticas();
  buscarDitadosAtribuidos();
  buscarSolicitacoesPendentes();
});

async function buscarEstatisticas() {
  carregandoEstatisticas.value = true;
  try {
    const dadosDitados = await ditadoService.listarMeusDitadosAtribuidos();
    estatisticas.value.ditados = dadosDitados.length;
  } catch (erro) {
    console.error("Erro ao carregar estatísticas:", erro);
  } finally {
    carregandoEstatisticas.value = false;
  }
}

async function buscarDitadosAtribuidos() {
  carregandoDitados.value = true;
  try {
    const dados = await ditadoService.listarMeusDitadosAtribuidos();
    ditados.value = dados;
  } catch (erro) {
    console.error("Erro ao carregar ditados atribuidos:", erro);
    mostrarSnackbar("Erro ao carregar ditados atribuidos", "error");
  } finally {
    carregandoDitados.value = false;
  }
}

async function buscarSolicitacoesPendentes() {
  try {
    solicitacoesPendentes.value = [];
  } catch (erro) {
    console.error("Erro ao carregar solicitações pendentes:", erro);
  }
}

async function aprovarSolicitacao(solicitacao) {
  try {
    mostrarSnackbar("Funcionalidade ainda não implementada", "warning");
  } catch (erro) {
    console.error("Erro ao aprovar solicitação:", erro);
    mostrarSnackbar("Erro ao aprovar solicitação", "error");
  }
}

async function rejeitarSolicitacao(solicitacao) {
  try {
    mostrarSnackbar("Funcionalidade ainda não implementada", "warning");
  } catch (erro) {
    console.error("Erro ao rejeitar solicitação:", erro);
    mostrarSnackbar("Erro ao rejeitar solicitação", "error");
  }
}

function formatarData(data) {
  const date = new Date(data);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function obterIniciaisUsuario(usuario) {
  if (!usuario || !usuario.nome) return "A";
  return usuario.nome
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

function obterCorMedia(media) {
  if (media >= 80) return "success";
  if (media >= 60) return "warning";
  return "error";
}

function irParaCadastroTextos() {
  router.push("/cadastro-ditado");
}

function irParaGerenciamentoTurmas() {
  router.push("/turmas");
}

function irParaRelatorios() {
  mostrarSnackbar("Funcionalidade em desenvolvimento", "info");
}

function verDetalhesDitado(ditado) {
  router.push({
    name: "ResultadosDitadoProfessor",
    params: {
      turmaId: ditado.turmaId,
      ditadoId: ditado.ditadoId,
    },
  });
}

function mostrarSnackbar(mensagem, cor = "info") {
  snackbar.value = {
    show: true,
    mensagem,
    color: cor,
  };
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}

.action-card {
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
}

.action-card:hover {
  transform: translateY(-4px);
}

.action-card-destaque {
  border: 2px solid #d32f2f;
}

.border-b {
  border-bottom: 1px solid #e0e0e0;
}

.border-error {
  border: 2px solid #d32f2f;
}
</style>