<template>
  <div>
    <!-- Header -->
    <v-card class="mb-6" elevation="1">
      <v-card-text class="pa-6">
        <h1 class="text-h4 font-weight-bold mb-2">
          Painel do Administrador
        </h1>
        <p class="text-body-1 text-grey-darken-1">
          Gerencie usuários e visualize as estatísticas do sistema
        </p>
      </v-card-text>
    </v-card>

    <!-- Estatísticas -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="1" class="h-100">
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-space-between mb-2">
              <v-icon size="40" color="error">mdi-shield-account</v-icon>
              <v-chip v-if="!carregando" color="error" variant="flat" size="large">
                {{ estatisticas.administradores }}
              </v-chip>
              <v-progress-circular v-else indeterminate color="error" size="32"></v-progress-circular>
            </div>
            <h3 class="text-h6 font-weight-bold">Administradores</h3>
            <p class="text-body-2 text-grey-darken-1 mb-0">Usuários admin</p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card elevation="1" class="h-100">
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-space-between mb-2">
              <v-icon size="40" color="primary">mdi-account-tie</v-icon>
              <v-chip v-if="!carregando" color="primary" variant="flat" size="large">
                {{ estatisticas.professores }}
              </v-chip>
              <v-progress-circular v-else indeterminate color="primary" size="32"></v-progress-circular>
            </div>
            <h3 class="text-h6 font-weight-bold">Professores</h3>
            <p class="text-body-2 text-grey-darken-1 mb-0">Docentes ativos</p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card elevation="1" class="h-100">
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-space-between mb-2">
              <v-icon size="40" color="success">mdi-school</v-icon>
              <v-chip v-if="!carregando" color="success" variant="flat" size="large">
                {{ estatisticas.alunos }}
              </v-chip>
              <v-progress-circular v-else indeterminate color="success" size="32"></v-progress-circular>
            </div>
            <h3 class="text-h6 font-weight-bold">Alunos</h3>
            <p class="text-body-2 text-grey-darken-1 mb-0">Estudantes ativos</p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card elevation="1" class="h-100">
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-space-between mb-2">
              <v-icon size="40" color="info">mdi-account-group</v-icon>
              <v-chip v-if="!carregando" color="info" variant="flat" size="large">
                {{ estatisticas.total }}
              </v-chip>
              <v-progress-circular v-else indeterminate color="info" size="32"></v-progress-circular>
            </div>
            <h3 class="text-h6 font-weight-bold">Total</h3>
            <p class="text-body-2 text-grey-darken-1 mb-0">Todos os usuários</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Ações rápidas -->
    <v-row class="mb-6">
      <v-col cols="12" md="6">
        <v-card elevation="1" class="h-100 action-card" hover @click="irParaUsuarios">
          <v-card-text class="pa-6">
            <div class="d-flex align-center">
              <v-avatar color="primary" size="64" class="mr-4">
                <v-icon size="32" color="white">mdi-account-multiple</v-icon>
              </v-avatar>
              <div>
                <h3 class="text-h6 font-weight-bold mb-1">Gerenciar Usuários</h3>
                <p class="text-body-2 text-grey-darken-1 mb-0">
                  Crie, edite e gerencie todos os usuários do sistema
                </p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card elevation="1" class="h-100 action-card" hover @click="irParaTurmas">
          <v-card-text class="pa-6">
            <div class="d-flex align-center">
              <v-avatar color="success" size="64" class="mr-4">
                <v-icon size="32" color="white">mdi-school</v-icon>
              </v-avatar>
              <div>
                <h3 class="text-h6 font-weight-bold mb-1">Gerenciar Turmas</h3>
                <p class="text-body-2 text-grey-darken-1 mb-0">
                  Crie, edite e organize turmas e seus ditados
                </p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card elevation="1" class="h-100 action-card" hover @click="irParaPerfil">
          <v-card-text class="pa-6">
            <div class="d-flex align-center">
              <v-avatar color="info" size="64" class="mr-4">
                <v-icon size="32" color="white">mdi-account-cog</v-icon>
              </v-avatar>
              <div>
                <h3 class="text-h6 font-weight-bold mb-1">Meu Perfil</h3>
                <p class="text-body-2 text-grey-darken-1 mb-0">
                  Visualize e edite suas informações pessoais
                </p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card elevation="1" class="h-100 action-card" hover @click="irParaDitados" :class="{ 'action-card-destaque': temSolicitacoesPendentes }">
          <v-card-text class="pa-6">
            <div class="d-flex align-center">
              <v-badge
                v-if="temSolicitacoesPendentes"
                color="error"
                floating
                :content="totalSolicitacoesPendentes"
              >
                <v-avatar color="warning" size="64" class="mr-4">
                  <v-icon size="32" color="white">mdi-file-document</v-icon>
                </v-avatar>
              </v-badge>
              <v-avatar v-else color="warning" size="64" class="mr-4">
                <v-icon size="32" color="white">mdi-file-document</v-icon>
              </v-avatar>
              <div>
                <h3 class="text-h6 font-weight-bold mb-1">Gerenciar Ditados</h3>
                <p class="text-body-2 text-grey-darken-1 mb-0">
                  Crie e organize os ditados da instituição
                </p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Informações do sistema -->
    <v-card elevation="1">
      <v-card-title class="pa-6 bg-grey-lighten-5">
        <v-icon class="mr-2" color="grey-darken-2">mdi-information</v-icon>
        <span class="text-h6 font-weight-bold">Informações do Sistema</span>
      </v-card-title>
      <v-card-text class="pa-6">
        <v-row>
          <v-col cols="12" md="6">
            <v-list class="bg-transparent">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title>Status do Sistema</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip color="success" size="small" variant="flat">Operacional</v-chip>
                </v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="info">mdi-calendar</v-icon>
                </template>
                <v-list-item-title>Último Acesso</v-list-item-title>
                <v-list-item-subtitle>{{ formatarDataHora(new Date()) }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="warning">mdi-account-clock</v-icon>
                </template>
                <v-list-item-title>Usuário Logado</v-list-item-title>
                <v-list-item-subtitle>{{ authStore.usuario?.nome }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-col>

          <v-col cols="12" md="6">
            <v-list class="bg-transparent">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="success">mdi-shield-check</v-icon>
                </template>
                <v-list-item-title>Nível de Acesso</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip color="error" size="small" variant="flat">Administrador</v-chip>
                </v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-email</v-icon>
                </template>
                <v-list-item-title>Email</v-list-item-title>
                <v-list-item-subtitle>{{ authStore.usuario?.login }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="info">mdi-identifier</v-icon>
                </template>
                <v-list-item-title>ID do Usuário</v-list-item-title>
                <v-list-item-subtitle>#{{ authStore.usuario?.id }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usuarioService } from '@/services/usuarioService'

const router = useRouter()
const authStore = useAuthStore()

const usuarios = ref([])
const solicitacoesPendentes = ref([])
const carregando = ref(false)

const estatisticas = computed(() => {
  const administradores = usuarios.value.filter(u => u.tipo === 'Administrador').length
  const professores = usuarios.value.filter(u => u.tipo === 'Professor').length
  const alunos = usuarios.value.filter(u => u.tipo === 'Aluno').length
  
  return {
    administradores,
    professores,
    alunos,
    total: usuarios.value.length
  }
})

const temSolicitacoesPendentes = computed(() => solicitacoesPendentes.value.length > 0)
const totalSolicitacoesPendentes = computed(() => solicitacoesPendentes.value.length)

onMounted(() => {
  buscarUsuarios()
  buscarSolicitacoesPendentes()
})

async function buscarUsuarios() {
  carregando.value = true
  try {
    const dados = await usuarioService.listarTodos()
    usuarios.value = dados
  } catch (erro) {
    console.error('Erro ao carregar usuários:', erro)
  } finally {
    carregando.value = false
  }
}

async function buscarSolicitacoesPendentes() {
  try {
    // Solicitações de usuário (acesso) são gerenciadas em Usuarios.vue
    solicitacoesPendentes.value = []
  } catch (erro) {
    console.error('Erro ao carregar solicitações pendentes:', erro)
  }
}

function formatarDataHora(data) {
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function irParaUsuarios() {
  router.push('/usuarios')
}

function irParaTurmas() {
  router.push('/turmas')
}

function irParaDitados() {
  router.push('/ditados')
}

function irParaPerfil() {
  router.push('/perfil')
}
</script>

<style scoped>
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
</style>
