<template>
  <v-app>
    <!-- Barra superior -->
    <v-app-bar elevation="0" color="white" height="70">
      <v-container class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon size="30" class="mr-2">mdi-book-open-page-variant</v-icon>
          <span class="text-h5 font-weight-bold">Ditado</span>
        </div>
      </v-container>
    </v-app-bar>

    <!-- Conteúdo principal -->
    <v-main class="bg-grey-lighten-4">
      <v-container class="py-12">
        <v-card
          class="mx-auto pa-8"
          max-width="500"
          elevation="2"
        >
          <div class="text-center mb-8">
            <h1 class="text-h4 font-weight-bold mb-2">Entrar no Ditado</h1>
            <p class="text-body-1 text-grey-darken-1">
              Digite suas credenciais para continuar
            </p>
          </div>

          <v-form @submit.prevent="fazerLogin" ref="formulario">
            <!-- Campo Login -->
            <div class="mb-6">
              <label class="text-body-2 text-grey-darken-2 mb-2 d-block">
                Email
              </label>
              <v-text-field
                v-model="login"
                placeholder="seu@email.com"
                variant="outlined"
                density="comfortable"
                :rules="[regras.obrigatorio]"
                hide-details="auto"
              />
            </div>

            <!-- Campo Senha -->
            <div class="mb-8">
              <label class="text-body-2 text-grey-darken-2 mb-2 d-block">
                Senha
              </label>
              <v-text-field
                v-model="senha"
                placeholder="Digite sua senha"
                :type="mostrarSenha ? 'text' : 'password'"
                variant="outlined"
                density="comfortable"
                :append-inner-icon="mostrarSenha ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="mostrarSenha = !mostrarSenha"
                :rules="[regras.obrigatorio]"
                hide-details="auto"
              />
            </div>

            <!-- Botão Entrar -->
            <v-btn
              type="submit"
              color="primary"
              size="large"
              block
              :loading="carregando"
              class="mb-4 text-none"
              prepend-icon="mdi-login"
            >
              Entrar
            </v-btn>

            <!-- Link Cadastro -->
            <div class="text-center">
              <span class="text-body-2 text-grey-darken-1">
                Não tem conta? 
              </span>
              <router-link 
                to="/cadastro" 
                class="text-primary text-decoration-none font-weight-medium"
              >
                Cadastre-se
              </router-link>
            </div>
          </v-form>

          <!-- Alertas -->
          <v-alert
            v-if="erro"
            type="error"
            class="mt-6"
            variant="tonal"
            closable
            @click:close="erro = null"
          >
            {{ erro }}
          </v-alert>
        </v-card>

        <!-- Rodapé informativo -->
        <div class="text-center mt-8">
          <v-card class="d-inline-flex align-center pa-3 mr-4" elevation="0" color="success-lighten-5">
            <v-icon color="success" class="mr-2">mdi-lock-check</v-icon>
            <span class="text-body-2">Seus dados estão seguros</span>
          </v-card>
          
          <v-card class="d-inline-flex align-center pa-3" elevation="0" color="info-lighten-5">
            <v-icon color="info" class="mr-2">mdi-volume-high</v-icon>
            <span class="text-body-2">Ouvimos melhor com fones de ouvido</span>
          </v-card>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const login = ref('')
const senha = ref('')
const mostrarSenha = ref(false)
const carregando = ref(false)
const erro = ref(null)
const formulario = ref(null)

const regras = {
  obrigatorio: v => !!v || 'Campo obrigatório'
}

async function fazerLogin() {
  const { valid } = await formulario.value.validate()
  
  if (!valid) return
  
  carregando.value = true
  erro.value = null
  
  try {
    await authStore.login(login.value, senha.value)
    
    // Redirecionar baseado no tipo de usuário
    if (authStore.ehAdministrador) {
      router.push('/admin')
    } else if (authStore.ehProfessor) {
      router.push('/professor')
    } else if (authStore.ehAluno) {
      router.push('/aluno')
    } else {
      router.push('/')
    }
  } catch (e) {
    // Tratar erros específicos da API
    if (e.response?.status === 401) {
      erro.value = 'Email ou senha inválidos, ou acesso não foi aprovado'
    } else if (e.response?.data?.message) {
      erro.value = e.response.data.message
    } else if (e.response?.data?.title) {
      erro.value = e.response.data.title
    } else {
      erro.value = 'Erro ao fazer login. Tente novamente.'
    }
  } finally {
    carregando.value = false
  }
}
</script>

<style scoped>
.gap-4 {
  gap: 16px;
}
</style>