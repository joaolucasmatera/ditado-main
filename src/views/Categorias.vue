<template>
  <div>
    <!-- Header -->
    <v-card class="mb-6" elevation="1">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">Categorias</h1>
            <p class="text-body-1 text-grey-darken-1">
              Crie e gerencie as categorias de ditados
            </p>
          </div>
          <v-btn
            color="success"
            size="large"
            prepend-icon="mdi-plus"
            to="/cadastro-categoria"
            class="text-none"
          >
            CATEGORIA
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Filtro e Busca -->
    <v-card class="mb-6" elevation="1">
      <v-card-text class="pa-6">
        <v-text-field
          v-model="pesquisa"
          prepend-inner-icon="mdi-magnify"
          placeholder="Filtrar categorias"
          variant="outlined"
          density="comfortable"
          @update:model-value="filtrarCategorias"
          clearable
          hide-details
        />
      </v-card-text>
    </v-card>

    <!-- Tabela de Categorias -->
    <v-card elevation="1">
      <v-card-title class="bg-grey-lighten-5 pa-4">
        <v-icon class="mr-2">mdi-tag-multiple</v-icon>
        Categorias Cadastradas
      </v-card-title>

      <v-data-table
        v-if="categoriasFiltradas.length > 0"
        :headers="headers"
        :items="categoriasFiltradas"
        :loading="carregando"
        class="elevation-0"
        density="comfortable"
      >
        <template v-slot:item.nome="{ item }">
          <div class="font-weight-bold">{{ item.nome }}</div>
        </template>

        <template v-slot:item.acoes="{ item }">
          <div class="d-flex gap-2">
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="primary"
              @click="editarCategoria(item)"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="deletarCategoria(item)"
            />
          </div>
        </template>

        <template v-slot:no-data>
          <v-row class="pa-6">
            <v-col cols="12" class="text-center">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">
                mdi-tag-multiple-outline
              </v-icon>
              <p class="text-h6 text-grey-darken-1 mb-2">Nenhuma categoria cadastrada</p>
              <p class="text-body-2 text-grey-darken-2 mb-4">
                Crie sua primeira categoria clicando no botão acima
              </p>
              <v-btn
                color="primary"
                to="/cadastro-categoria"
                prepend-icon="mdi-plus"
                class="text-none"
              >
                Criar Categoria
              </v-btn>
            </v-col>
          </v-row>
        </template>
      </v-data-table>

      <div v-else class="pa-6 text-center">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">
          mdi-tag-multiple-outline
        </v-icon>
        <p class="text-h6 text-grey-darken-1 mb-2">Nenhuma categoria encontrada</p>
        <p class="text-body-2 text-grey-darken-2">
          Nenhum resultado corresponde aos critérios de busca
        </p>
      </div>
    </v-card>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.mensagem }}
    </v-snackbar>

    <!-- Dialog de Confirmação de Exclusão -->
    <v-dialog v-model="dialogDelete" max-width="400">
      <v-card>
        <v-card-title class="bg-red-lighten-5 pa-4">
          <v-icon color="error" class="mr-2">mdi-alert</v-icon>
          Confirmar Exclusão
        </v-card-title>
        <v-card-text class="pa-6">
          <p class="text-body-1 mb-2">
            Tem certeza que deseja excluir a categoria <strong>{{ categoriaSelecionada?.nome }}</strong>?
          </p>
          <p class="text-body-2 text-grey-darken-1">
            Esta ação não pode ser desfeita.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-btn
            variant="text"
            @click="dialogDelete = false"
          >
            Cancelar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="flat"
            :loading="deletando"
            @click="confirmarDelecao"
          >
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { categoriaService } from '@/services/categoriaService'

const router = useRouter()

const categorias = ref([])
const categoriasFiltradas = ref([])
const carregando = ref(false)
const pesquisa = ref('')
const categoriaSelecionada = ref(null)
const dialogDelete = ref(false)
const deletando = ref(false)

const snackbar = ref({
  show: false,
  mensagem: '',
  color: 'success'
})

const headers = [
  { title: 'Nome', key: 'nome', sortable: true },
  { title: 'Ações', key: 'acoes', sortable: false }
]

onMounted(async () => {
  await carregarCategorias()
})

async function carregarCategorias() {
  carregando.value = true
  try {
    const dados = await categoriaService.listarTodas()
    categorias.value = dados
    filtrarCategorias()
  } catch (erro) {
    console.error('Erro ao carregar categorias:', erro)
    mostrarSnackbar('Erro ao carregar categorias', 'error')
  } finally {
    carregando.value = false
  }
}

function filtrarCategorias() {
  let resultado = [...categorias.value]

  if (pesquisa.value.trim()) {
    const termo = pesquisa.value.toLowerCase()
    resultado = resultado.filter(c =>
      c.nome.toLowerCase().includes(termo)
    )
  }

  categoriasFiltradas.value = resultado
}

function editarCategoria(categoria) {
  router.push(`/editar-categoria/${categoria.id}`)
}

function deletarCategoria(categoria) {
  categoriaSelecionada.value = categoria
  dialogDelete.value = true
}

async function confirmarDelecao() {
  deletando.value = true
  try {
    await categoriaService.deletar(categoriaSelecionada.value.id)
    categorias.value = categorias.value.filter(c => c.id !== categoriaSelecionada.value.id)
    filtrarCategorias()
    mostrarSnackbar('Categoria excluída com sucesso!', 'success')
    dialogDelete.value = false
  } catch (erro) {
    console.error('Erro ao deletar categoria:', erro)
    mostrarSnackbar('Erro ao excluir categoria', 'error')
  } finally {
    deletando.value = false
    categoriaSelecionada.value = null
  }
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
.gap-2 {
  gap: 8px;
}
</style>
