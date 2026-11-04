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
          max-width="550"
          elevation="2"
        >
          <div class="text-center mb-8">
            <h1 class="text-h4 font-weight-bold mb-2">Criar Conta</h1>
            <p class="text-body-1 text-grey-darken-1">
              Preencha os dados abaixo para começar
            </p>
          </div>

          <v-form @submit.prevent="cadastrar" ref="formulario">
            <!-- Campo Nome -->
            <div class="mb-4">
              <label class="text-body-2 text-grey-darken-2 mb-2 d-block">
                Nome completo
              </label>
              <v-text-field
                v-model="dados.nome"
                placeholder="Digite seu nome"
                variant="outlined"
                density="comfortable"
                :rules="[regras.obrigatorio]"
                hide-details="auto"
              />
            </div>

            <!-- Campo Email/Login -->
            <div class="mb-4">
              <label class="text-body-2 text-grey-darken-2 mb-2 d-block">
                Email (Login)
              </label>
              <v-text-field
                v-model="dados.login"
                placeholder="seu@email.com"
                type="email"
                variant="outlined"
                density="comfortable"
                :rules="[regras.obrigatorio, regras.email]"
                hide-details="auto"
              />
            </div>

            <!-- Campo Matrícula (Opcional) -->
            <div class="mb-4">
              <label class="text-body-2 text-grey-darken-2 mb-2 d-block">
                Matrícula (Opcional)
              </label>
              <v-text-field
                v-model="dados.matricula"
                placeholder="Digite sua matrícula (se tiver)"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              />
            </div>

            <!-- Campo Senha -->
            <div class="mb-4">
              <label class="text-body-2 text-grey-darken-2 mb-2 d-block">
                Senha
              </label>
              <v-text-field
                v-model="dados.senha"
                placeholder="Mínimo 6 caracteres"
                :type="mostrarSenha ? 'text' : 'password'"
                variant="outlined"
                density="comfortable"
                :append-inner-icon="mostrarSenha ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="mostrarSenha = !mostrarSenha"
                :rules="[regras.obrigatorio, regras.senhaMinima]"
                hide-details="auto"
              />
            </div>

            <!-- Campo Confirmar Senha -->
            <div class="mb-8">
              <label class="text-body-2 text-grey-darken-2 mb-2 d-block">
                Confirmar senha
              </label>
              <v-text-field
                v-model="confirmarSenha"
                placeholder="Digite a senha novamente"
                :type="mostrarConfirmarSenha ? 'text' : 'password'"
                variant="outlined"
                density="comfortable"
                :append-inner-icon="mostrarConfirmarSenha ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="mostrarConfirmarSenha = !mostrarConfirmarSenha"
                :rules="[regras.obrigatorio, regras.senhasIguais]"
                hide-details="auto"
              />
            </div>

            <!-- Botão Cadastrar -->
            <v-btn
              type="submit"
              color="primary"
              size="large"
              block
              :loading="carregando"
              class="mb-4 text-none"
              prepend-icon="mdi-account-plus"
            >
              Criar Conta
            </v-btn>

            <!-- Link Login -->
            <div class="text-center">
              <span class="text-body-2 text-grey-darken-1">
                Já tem conta? 
              </span>
              <router-link 
                to="/login" 
                class="text-primary text-decoration-none font-weight-medium"
              >
                Faça login
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

          <v-alert
            v-if="sucesso"
            type="success"
            class="mt-6"
            variant="tonal"
            closable
            @click:close="sucesso = null"
          >
            {{ sucesso }}
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
import { usuarioService } from '@/services/usuarioService'

const router = useRouter()

const dados = ref({
  nome: '',
  login: '', // Mudado de email para login
  senha: '',
  matricula: '' // Campo novo
})

const confirmarSenha = ref('')
const mostrarSenha = ref(false)
const mostrarConfirmarSenha = ref(false)
const carregando = ref(false)
const erro = ref(null)
const sucesso = ref(null)
const formulario = ref(null)

const regras = {
  obrigatorio: v => !!v || 'Campo obrigatório',
  email: v => /.+@.+\..+/.test(v) || 'Email inválido',
  senhaMinima: v => v.length >= 6 || 'Senha deve ter no mínimo 6 caracteres',
  senhasIguais: v => v === dados.value.senha || 'As senhas não conferem'
}

async function cadastrar() {
  const { valid } = await formulario.value.validate()
  
  if (!valid) return
  
  carregando.value = true
  erro.value = null
  sucesso.value = null
  
  try {
    await usuarioService.solicitarAcesso({
      nome: dados.value.nome,
      login: dados.value.login,
      senha: dados.value.senha,
      matricula: dados.value.matricula || null
    })
    sucesso.value = 'Solicitação enviada com sucesso! Aguarde aprovação. Redirecionando...'
    
    setTimeout(() => {
      router.push('/login')
    }, 2500)
  } catch (e) {
    // Tratar erros de validação da API
    if (e.response?.data?.errors) {
      const erros = e.response.data.errors
      const mensagensErro = Object.values(erros).flat().join(', ')
      erro.value = mensagensErro
    } else {
      erro.value = e.response?.data?.message || e.response?.data?.title || 'Erro ao solicitar acesso'
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