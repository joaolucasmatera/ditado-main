<template>
  <div>
    <!-- Header -->
    <v-card class="mb-6" elevation="1">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">{{ editando ? 'Editar Categoria' : 'Cadastro de Categoria' }}</h1>
            <p class="text-body-1 text-grey-darken-1">
              {{ editando ? 'Atualize os dados da categoria' : 'Crie uma nova categoria para organizar seus ditados' }}
            </p>
          </div>
          <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-view-list"
            variant="outlined"
            class="text-none"
            @click="voltarParaLista"
          >
            Ver Categorias
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Formulário de Cadastro -->
    <v-card elevation="1">
      <v-card-text class="pa-6">
        <v-form ref="formCategoria">
          <div class="mb-6">
            <label class="text-body-2 font-weight-bold text-grey-darken-2 mb-2 d-block">
              Nome da Categoria
            </label>
            <v-text-field
              v-model="formDados.nome"
              placeholder="Digite o nome da categoria"
              variant="outlined"
              density="comfortable"
              :rules="[regras.obrigatorio]"
              hide-details="auto"
            />
          </div>

          <!-- Alerta de erro -->
          <v-alert
            v-if="erroForm"
            type="error"
            class="mb-6"
            variant="tonal"
            closable
            @click:close="erroForm = null"
          >
            {{ erroForm }}
          </v-alert>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Ações -->
      <v-card-actions class="pa-6 bg-grey-lighten-5">
        <v-btn
          variant="text"
          class="text-none"
          prepend-icon="mdi-close"
          @click="cancelar"
        >
          Cancelar
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="flat"
          size="large"
          class="text-none px-8"
          prepend-icon="mdi-content-save"
          :loading="salvando"
          @click="salvarCategoria"
        >
          {{ editando ? 'Atualizar Categoria' : 'Salvar Categoria' }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.mensagem }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { categoriaService } from '@/services/categoriaService'

const router = useRouter()
const route = useRoute()

const formCategoria = ref(null)

const categoriaId = computed(() => route.params.id)
const editando = computed(() => !!categoriaId.value)

const formDados = ref({
  nome: ''
})

const salvando = ref(false)
const carregando = ref(false)
const erroForm = ref(null)

const snackbar = ref({
  show: false,
  mensagem: '',
  color: 'success'
})

const regras = {
  obrigatorio: v => (v !== null && v !== undefined && v !== '') || 'Campo obrigatório'
}

onMounted(async () => {
  if (editando.value) {
    await carregarCategoria()
  }
})

async function carregarCategoria() {
  carregando.value = true
  erroForm.value = null
  try {
    const categoria = await categoriaService.buscarPorId(categoriaId.value)
    formDados.value = {
      nome: categoria.nome || ''
    }
  } catch (erro) {
    console.error('Erro ao carregar categoria:', erro)
    const mensagemErro = erro.response?.data?.message || erro.message || 'Erro ao carregar categoria'
    erroForm.value = mensagemErro
    mostrarSnackbar(mensagemErro, 'error')
  } finally {
    carregando.value = false
  }
}

async function salvarCategoria() {
  const { valid } = await formCategoria.value.validate()
  if (!valid) {
    mostrarSnackbar('Por favor, preencha o nome da categoria', 'warning')
    return
  }

  if (!formDados.value.nome.trim()) {
    mostrarSnackbar('Por favor, preencha o nome da categoria', 'warning')
    return
  }

  salvando.value = true
  erroForm.value = null

  try {
    const dados = {
      nome: formDados.value.nome.trim()
    }

    if (editando.value) {
      await categoriaService.atualizar(categoriaId.value, dados)
      mostrarSnackbar('Categoria atualizada com sucesso!', 'success')
    } else {
      await categoriaService.criar(dados)
      mostrarSnackbar('Categoria cadastrada com sucesso!', 'success')
    }

    setTimeout(() => {
      router.push('/categorias')
    }, 1500)
  } catch (erro) {
    console.error('Erro ao salvar categoria:', erro.response?.data || erro)

    if (erro.response?.data?.errors) {
      const erros = erro.response.data.errors
      const mensagensErro = Object.values(erros).flat().join(', ')
      erroForm.value = mensagensErro
    } else {
      erroForm.value = erro.response?.data?.message || erro.response?.data?.title || 'Erro ao salvar categoria'
    }

    mostrarSnackbar('Erro ao salvar categoria', 'error')
  } finally {
    salvando.value = false
  }
}

function cancelar() {
  voltarParaLista()
}

function voltarParaLista() {
  router.push('/categorias')
}

function mostrarSnackbar(mensagem, cor = 'success') {
  snackbar.value = {
    show: true,
    mensagem,
    color: cor
  }
}
</script>

<style scoped>
</style>
