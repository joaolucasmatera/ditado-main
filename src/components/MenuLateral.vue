<template>
  <v-navigation-drawer
    v-model="drawerLocal"
    :rail="rail"
    :temporary="mobile"
    permanent
    class="menu-lateral"
    color="#3d4f5c"
    width="260"
  >
    <!-- Perfil do usuário -->
    <v-list-item
      class="perfil-usuario px-4 py-2"
      :class="{ 'rail-perfil': rail }"
    >
      <template v-slot:prepend>
        <v-avatar color="primary" size="48">
          <span class="text-h6 font-weight-bold">{{ iniciais }}</span>
        </v-avatar>
      </template>

      <v-list-item-title class="text-white font-weight-bold text-body-1">
        {{ authStore.usuario?.nome || 'Administrador Temporário' }}
      </v-list-item-title>
      <v-list-item-subtitle class="text-grey-lighten-1 text-body-2">
        {{ authStore.usuario?.login || 'admin@sga.com' }}
      </v-list-item-subtitle>
    </v-list-item>

    <v-divider class="border-opacity-25 my-2"></v-divider>

    <!-- Menu de navegação -->
    <v-list density="comfortable" nav class="px-3">
      <v-list-item
        prepend-icon="mdi-home"
        title="Início"
        value="home"
        :to="rotaInicial"
        class="menu-item mb-2 rounded-lg"
      ></v-list-item>

      <!-- Menu Professor e Administrador -->
      <template v-if="authStore.ehProfessor || authStore.ehAdministrador">
        <v-list-item
          prepend-icon="mdi-account-multiple"
          title="Usuários"
          value="usuarios"
          to="/usuarios"
          class="menu-item mb-2 rounded-lg"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-file-document"
          title="Ditados"
          value="ditados"
          to="/ditados"
          class="menu-item mb-2 rounded-lg"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-tag-multiple"
          title="Categorias"
          value="categorias"
          to="/categorias"
          class="menu-item mb-2 rounded-lg"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-school"
          title="Turmas"
          value="turmas"
          to="/turmas"
          class="menu-item mb-2 rounded-lg"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-chart-line"
          title="Relatórios"
          value="relatorios"
          class="menu-item mb-2 rounded-lg"
          @click="funcionalidadeEmBreve"
        ></v-list-item>
      </template>

      <!-- Menu Aluno -->
      <template v-if="authStore.ehAluno">
        <v-list-item
          prepend-icon="mdi-school"
          title="Minhas Turmas"
          value="minhas-turmas"
          to="/minhas-turmas"
          class="menu-item mb-2 rounded-lg"
        ></v-list-item>
      </template>

      <v-divider class="border-opacity-25 my-3"></v-divider>

      <v-list-group value="perfil">
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-account"
            title="Perfil"
            class="menu-item mb-2 rounded-lg"
          ></v-list-item>
        </template>

        <v-list-item
          title="Editar Perfil"
          value="editar-perfil"
          to="/perfil"
          class="submenu-item pl-12 rounded-lg"
        ></v-list-item>
      </v-list-group>

      <v-list-item
        prepend-icon="mdi-logout"
        title="Sair"
        value="sair"
        @click="sair"
        class="menu-item mb-2 rounded-lg"
      ></v-list-item>
    </v-list>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" color="info" :timeout="2000">
      Funcionalidade em desenvolvimento
    </v-snackbar>

    <!-- Botão toggle -->
    <template v-slot:append>
      <div class="pa-2 text-center">
        <v-btn
          :icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
          variant="text"
          color="white"
          size="small"
          @click="rail = !rail"
        ></v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDisplay } from 'vuetify'

const props = defineProps({
  drawer: Boolean
})

const emit = defineEmits(['update:drawer'])

const router = useRouter()
const authStore = useAuthStore()
const { mobile } = useDisplay()

const drawerLocal = ref(props.drawer)
const rail = ref(false)
const snackbar = ref(false)

const rotaInicial = computed(() => {
  if (authStore.ehAdministrador) return '/admin'
  if (authStore.ehProfessor) return '/professor'
  if (authStore.ehAluno) return '/aluno'
  return '/'
})

watch(() => props.drawer, (valor) => {
  drawerLocal.value = valor
})

watch(drawerLocal, (valor) => {
  emit('update:drawer', valor)
})

watch(mobile, (isMobile) => {
  if (isMobile) {
    rail.value = false
  }
})

const iniciais = computed(() => {
  const nome = authStore.usuario?.nome || 'AT'
  return nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
})

function funcionalidadeEmBreve() {
  snackbar.value = true
}

function sair() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.menu-lateral {
  border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.perfil-usuario {
  transition: all 0.3s ease;
}

.rail-perfil {
  padding: 12px 8px !important;
}

.menu-item {
  color: rgba(255, 255, 255, 0.85) !important;
  transition: all 0.2s ease;
  margin-bottom: 4px;
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
}

.menu-item.v-list-item--active {
  background-color: rgba(255, 255, 255, 0.15) !important;
  color: white !important;
}

.submenu-item {
  color: rgba(255, 255, 255, 0.75) !important;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.submenu-item:hover {
  background-color: rgba(255, 255, 255, 0.08) !important;
  color: white !important;
}

:deep(.v-list-group__items) {
  background-color: rgba(0, 0, 0, 0.1);
}

:deep(.v-list-item__prepend > .v-icon) {
  opacity: 0.9;
}
</style>