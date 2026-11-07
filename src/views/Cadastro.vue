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

          <v-form v-if="!confirmacaoEnviada" @submit.prevent="cadastrar" ref="formulario">
            <template>
            <!-- Campo Nome -->
            <div class="mb-4">
              <label class="text-body-2 text-grey-darken-2 mb-2 d-block">
                Nome completo
              </label>
              <v-text-field
                v-model="dados.nome"
                aria-label="Nome completo"
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
                aria-label="E-mail"
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
                aria-label="Matrícula"
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
                aria-label="Senha"
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
                aria-label="Confirmar senha"
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

            <div class="mb-6">
              <label class="text-body-2 text-grey-darken-2 mb-2 d-block">Escola</label>
              <v-radio-group v-model="escola.opcao" inline>
                <v-radio label="Criar nova escola" value="CriarNova" />
                <v-radio label="Selecionar escola existente" value="SelecionarExistente" />
              </v-radio-group>
              <v-text-field v-if="escola.opcao === 'CriarNova'" v-model="escola.nome" aria-label="Nome da nova escola" label="Nome da nova escola" variant="outlined" :rules="[regras.obrigatorio]" />
              <v-text-field v-else v-model.number="escola.id" aria-label="ID da escola existente" label="ID da escola existente" type="number" variant="outlined" :rules="[regras.obrigatorio]" />
              <p class="text-caption text-grey-darken-1">Escola nova: vínculo ativo como administrador da escola. Escola existente: cadastro pendente até aprovação.</p>
            </div>

            </template>
            <!-- Botão Cadastrar -->
            <v-btn
              type="submit"
              color="primary"
              size="large"
              block
              :loading="carregando"
              :disabled="carregando"
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
            <div class="text-center mt-3">
              <span class="text-body-2 text-grey-darken-1">Aluno já pré-cadastrado?</span>
              <router-link to="/login" class="text-primary text-decoration-none font-weight-medium ml-1">Cadastre-se como aluno</router-link>
            </div>
          </v-form>

          <div v-else class="text-center py-8" role="status" aria-live="polite">
            <v-icon color="success" size="56" class="mb-4">mdi-check-circle</v-icon>
            <h2 class="text-h5 mb-3">Solicitação enviada com sucesso!</h2>
            <p class="text-body-1 text-grey-darken-1 mb-6">Aguarde aprovação para acessar o Ditado.</p>
            <v-btn color="primary" @click="irParaLogin">Ir para login</v-btn>
          </div>

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
import { ref, watch } from 'vue'
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
const confirmacaoEnviada = ref(false)
const formulario = ref(null)
const perfil = ref('professor')
const escola = ref({ opcao: 'CriarNova', nome: '', id: null })

const regras = {
  obrigatorio: v => !!v || 'Campo obrigatório',
  email: v => /.+@.+\..+/.test(v) || 'Email inválido',
  senhaMinima: v => v.length >= 6 || 'Senha deve ter no mínimo 6 caracteres',
  senhasIguais: v => v === dados.value.senha || 'As senhas não conferem'
}

async function cadastrar() {
  if (sucesso.value) return
  if (perfil.value === 'professor' && confirmarSenha.value !== dados.value.senha) {
    erro.value = confirmarSenha.value ? 'As senhas não conferem.' : 'Confirme sua senha antes de continuar.'
    return
  }
  const { valid } = await formulario.value.validate()
  
  if (!valid) return
  
  carregando.value = true
  erro.value = null
  sucesso.value = null
  
  try {
    await usuarioService.cadastrarProfessor({
      nome: dados.value.nome,
      login: dados.value.login,
      senha: dados.value.senha,
      opcaoEscola: escola.value.opcao,
      escolaId: escola.value.opcao === 'SelecionarExistente' ? escola.value.id : null,
      nomeNovaEscola: escola.value.opcao === 'CriarNova' ? escola.value.nome : null
    })
    sucesso.value = 'Solicitação enviada com sucesso! Aguarde aprovação.'
    // Nunca manter senha em memória após o envio; os demais dados permanecem
    // visíveis para que a confirmação não pareça um reset do formulário.
    dados.value.senha = ''
    confirmarSenha.value = ''
    confirmacaoEnviada.value = true
  } catch (e) {
    // Tratar erros de validação da API
    if (e.response?.data?.mensagem) {
      erro.value = e.response.data.mensagem
    } else if (e.response?.data?.errors) {
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

function irParaLogin() {
  router.push('/login')
}
</script>

<style scoped>
.gap-4 {
  gap: 16px;
}
</style>
