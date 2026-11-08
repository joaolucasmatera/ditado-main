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
            <v-btn-toggle v-model="perfil" mandatory class="mb-6" divided>
              <v-btn value="professor" class="text-none">Professor</v-btn>
              <v-btn value="aluno" class="text-none">Aluno</v-btn>
            </v-btn-toggle>
            <!-- Campo Login -->
            <div v-if="perfil === 'professor'" class="mb-6">
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
            <div v-if="perfil === 'professor'" class="mb-8">
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
            <template v-else>
              <div v-if="!primeiroAcesso || !primeiroAcessoEtapa" class="mb-6">
                <label class="text-body-2 text-grey-darken-2 mb-2 d-block">Matrícula ou código de entrada</label>
                <v-text-field v-model="matriculaOuCodigo" placeholder="Matrícula ou código de entrada" variant="outlined" density="comfortable" :rules="[regras.obrigatorio]" hide-details="auto" />
                <p class="text-caption text-grey-darken-1 mt-2">O código de entrada é composto por: nome da escola + turma + número na chamada. Ex.: <strong>EscolaPensar100103</strong></p>
              </div>
              <div v-if="!primeiroAcesso || primeiroAcessoEtapa" class="mb-8">
                <p v-if="primeiroAcessoEtapa" class="text-body-2 text-grey-darken-1 mb-4">Identificador confirmado. Agora crie seu PIN para acessar como aluno.</p>
                <label class="text-body-2 text-grey-darken-2 mb-2 d-block">{{ primeiroAcesso ? 'Criar PIN' : 'PIN' }}</label>
                <v-text-field v-model="pin" type="password" :placeholder="primeiroAcesso ? 'Crie seu PIN (mínimo 4 caracteres)' : 'Informe seu PIN'" variant="outlined" density="comfortable" :rules="[regras.obrigatorio, regras.pin]" hide-details="auto" />
              </div>
            </template>


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
              {{ perfil === 'professor' ? 'Entrar como professor' : (primeiroAcesso && !primeiroAcessoEtapa ? 'Continuar' : primeiroAcesso ? 'Criar PIN' : 'Entrar como aluno') }}
            </v-btn>
            <v-btn v-if="perfil === 'aluno'" variant="text" block class="text-none" @click="primeiroAcesso = !primeiroAcesso; primeiroAcessoEtapa = false; pin = ''">
              {{ primeiroAcesso ? 'Voltar para entrar' : 'Primeiro login: criar PIN' }}
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
            role="alert"
            aria-live="assertive"
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
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const login = ref('')
const senha = ref('')
const matriculaOuCodigo = ref('')
const pin = ref('')
const perfil = ref(route.query.perfil === 'aluno' ? 'aluno' : 'professor')
const primeiroAcesso = ref(route.query.primeiroAcesso === '1')
const primeiroAcessoEtapa = ref(false)
const mostrarSenha = ref(false)
const carregando = ref(false)
const erro = ref(null)
const formulario = ref(null)

const regras = {
  obrigatorio: v => !!v || 'Campo obrigatório',
  pin: v => String(v || '').length >= 4 || 'O PIN deve ter no mínimo 4 caracteres'
}

function redirecionarUsuario() {
  if (authStore.ehAdministrador) router.push('/admin')
  else if (authStore.ehProfessor) router.push('/professor')
  else if (authStore.ehAluno) router.push('/aluno')
  else router.push('/')
}

async function fazerLogin() {
  const { valid } = await formulario.value.validate()
  
  if (!valid) return
  
  carregando.value = true
  erro.value = null
  
  try {
    if (perfil.value === 'aluno' && primeiroAcesso.value) {
      if (!primeiroAcessoEtapa.value) {
        await authStore.verificarPrimeiroAcessoAluno(matriculaOuCodigo.value)
        primeiroAcessoEtapa.value = true
        pin.value = ''
        return
      }
      await authStore.configurarPrimeiroAcessoAluno(matriculaOuCodigo.value, pin.value)
      await authStore.loginAluno(matriculaOuCodigo.value, pin.value)
      erro.value = null
      primeiroAcesso.value = false
      primeiroAcessoEtapa.value = false
      pin.value = ''
      redirecionarUsuario()
      return
    }
    if (perfil.value === 'aluno') await authStore.loginAluno(matriculaOuCodigo.value, pin.value)
    else await authStore.login(login.value, senha.value)
    
    redirecionarUsuario()
  } catch (e) {
    // Tratar erros específicos da API
    if (e.response?.data?.mensagem) {
      erro.value = e.response.data.mensagem
    } else if (e.response?.status === 401) {
      erro.value = 'Email ou senha inválidos, ou acesso não foi aprovado'
    } else if (e.response?.data?.message) {
      erro.value = e.response.data.message
    } else if (e.response?.data?.title) {
      erro.value = e.response.data.title
    } else if (e.response?.data?.errors) {
      const mensagens = Object.values(e.response.data.errors).flat()
      erro.value = mensagens[0] || 'Dados inválidos. Verifique o PIN e tente novamente.'
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
