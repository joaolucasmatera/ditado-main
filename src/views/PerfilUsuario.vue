<template>
  <div>
    <v-card elevation="1" class="mx-auto" max-width="900">
      <v-card-title class="pa-4 pa-md-6 bg-grey-lighten-5 border-b">
        <div class="d-flex align-center">
          <v-icon class="mr-2 mr-md-3" color="grey-darken-2">mdi-account-edit</v-icon>
          <span class="text-body-1 text-md-h6 font-weight-bold">Editar Perfil</span>
        </div>
      </v-card-title>
      
      <v-card-text class="pa-4 pa-md-8">
        <v-form @submit.prevent="salvar" ref="formulario">
          <v-row>
            <!-- Avatar -->
            <v-col cols="12" class="text-center mb-2 mb-md-4">
              <v-avatar color="primary" size="100" size-md="120">
                <span class="text-h3 text-md-h2 text-white font-weight-bold">{{ iniciais }}</span>
              </v-avatar>
            </v-col>

            <!-- Nome -->
            <v-col cols="12">
              <label class="text-body-2 text-grey-darken-2 mb-2 d-block">
                Nome completo
              </label>
              <v-text-field
                v-model="dadosUsuario.nome"
                placeholder="Digite seu nome"
                variant="outlined"
                density="comfortable"
                :rules="[regras.obrigatorio]"
                hide-details="auto"
                :disabled="authStore.ehAluno"
                :hint="authStore.ehAluno ? 'Para alterar seu nome, peça para um professor ou administrador' : ''"
                :persistent-hint="authStore.ehAluno"
              />
            </v-col>

            <!-- Email -->
            <v-col cols="12">
              <label class="text-body-2 text-grey-darken-2 mb-2 d-block">
                Email
              </label>
              <v-text-field
                v-model="dadosUsuario.email"
                placeholder="seu@email.com"
                type="email"
                variant="outlined"
                density="comfortable"
                :rules="[regras.obrigatorio, regras.email]"
                hide-details="auto"
              />
            </v-col>

            <!-- Divisor -->
            <v-col cols="12">
              <v-divider class="my-2 my-md-4"></v-divider>
              <h3 class="text-body-1 text-md-h6 font-weight-bold mb-3 mb-md-4">Alterar Senha</h3>
            </v-col>

            <!-- Nova Senha -->
            <v-col cols="12" md="6">
              <label class="text-body-2 text-grey-darken-2 mb-2 d-block">
                Nova senha
              </label>
              <v-text-field
                v-model="novaSenha"
                placeholder="Deixe em branco para não alterar"
                :type="mostrarSenha ? 'text' : 'password'"
                variant="outlined"
                density="comfortable"
                :append-inner-icon="mostrarSenha ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="mostrarSenha = !mostrarSenha"
                :rules="novaSenha ? [regras.senhaMinima] : []"
                hide-details="auto"
              />
            </v-col>

            <!-- Confirmar Senha -->
            <v-col cols="12" md="6">
              <label class="text-body-2 text-grey-darken-2 mb-2 d-block">
                Confirmar nova senha
              </label>
              <v-text-field
                v-model="confirmarNovaSenha"
                placeholder="Confirme a nova senha"
                :type="mostrarConfirmarSenha ? 'text' : 'password'"
                variant="outlined"
                density="comfortable"
                :append-inner-icon="mostrarConfirmarSenha ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="mostrarConfirmarSenha = !mostrarConfirmarSenha"
                :rules="novaSenha ? [regras.senhasIguais] : []"
                hide-details="auto"
              />
            </v-col>
          </v-row>

          <v-divider class="my-4 my-md-6"></v-divider>

          <!-- Botões -->
          <v-row>
            <v-col cols="12" class="d-flex flex-column flex-sm-row justify-end gap-2">
              <v-btn
                type="submit"
                color="primary"
                :loading="carregando"
                class="text-none"
                prepend-icon="mdi-content-save"
              >
                Salvar Alterações
              </v-btn>
            </v-col>
          </v-row>
        </v-form>

        <!-- Alertas -->
        <v-alert
          v-if="erro"
          type="error"
          class="mt-4"
          variant="tonal"
          closable
          @click:close="erro = null"
        >
          {{ erro }}
        </v-alert>

        <v-alert
          v-if="sucesso"
          type="success"
          class="mt-4"
          variant="tonal"
          closable
          @click:close="sucesso = null"
        >
          {{ sucesso }}
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- Dialog de confirmação de exclusão -->
    <v-dialog v-model="dialogExclusao" max-width="500">
      <v-card>
        <v-card-title class="pa-4 pa-md-6 bg-error text-white">
          <span class="text-body-1 text-md-h6 font-weight-bold">Confirmar Exclusão</span>
        </v-card-title>
        <v-card-text class="pa-4 pa-md-6">
          <p class="text-body-2 text-md-body-1 mb-4">
            Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.
          </p>
          <v-alert type="warning" variant="tonal" density="compact">
            Todos os seus dados serão permanentemente removidos.
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn 
            color="grey" 
            variant="text" 
            @click="dialogExclusao = false"
            class="text-none"
          >
            Cancelar
          </v-btn>
          <v-btn 
            color="error" 
            variant="flat"
            :loading="carregandoExclusao"
            @click="excluirConta"
            class="text-none"
          >
            Excluir Conta
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usuarioService } from '@/services/usuarioService'

const router = useRouter()
const authStore = useAuthStore()

const dadosUsuario = ref({
  nome: '',
  email: ''
})

const novaSenha = ref('')
const confirmarNovaSenha = ref('')
const mostrarSenha = ref(false)
const mostrarConfirmarSenha = ref(false)
const carregando = ref(false)
const carregandoExclusao = ref(false)
const erro = ref(null)
const sucesso = ref(null)
const formulario = ref(null)
const dialogExclusao = ref(false)

const regras = {
  obrigatorio: v => !!v || 'Campo obrigatório',
  email: v => /.+@.+\..+/.test(v) || 'Email inválido',
  senhaMinima: v => !v || v.length >= 6 || 'Senha deve ter no mínimo 6 caracteres',
  senhasIguais: v => v === novaSenha.value || 'As senhas não conferem'
}

const iniciais = computed(() => {
  const nome = dadosUsuario.value.nome || 'AT'
  return nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
})

onMounted(() => {
  if (authStore.usuario) {
    dadosUsuario.value = {
      nome: authStore.usuario.nome,
      email: authStore.usuario.login
    }
  }
})

async function salvar() {
  const { valid } = await formulario.value.validate()
  
  if (!valid) return
  
  carregando.value = true
  erro.value = null
  sucesso.value = null
  
  try {
    const dados = {
      ...dadosUsuario.value
    }
    
    if (novaSenha.value) {
      dados.senha = novaSenha.value
    }
    
    await authStore.atualizarUsuario(authStore.usuario.id, dados)
    
    sucesso.value = 'Perfil atualizado com sucesso!'
    novaSenha.value = ''
    confirmarNovaSenha.value = ''
  } catch (e) {
    erro.value = e.response?.data?.message || 'Erro ao atualizar perfil'
  } finally {
    carregando.value = false
  }
}

function abrirDialogExclusao() {
  dialogExclusao.value = true
}

async function excluirConta() {
  carregandoExclusao.value = true
  
  try {
    await usuarioService.deletar(authStore.usuario.id)
    authStore.logout()
    router.push('/login')
  } catch (e) {
    erro.value = e.response?.data?.message || 'Erro ao excluir conta'
    dialogExclusao.value = false
  } finally {
    carregandoExclusao.value = false
  }
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>