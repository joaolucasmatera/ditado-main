import api from './api'

export const categoriaService = {
  // LISTAR TODAS AS CATEGORIAS
  async listarTodas() {
    try {
      const response = await api.get('/Categorias')
      return response.data || []
    } catch (erro) {
      console.error('Erro ao listar categorias:', erro.response?.data || erro)
      throw erro
    }
  },

  // BUSCAR CATEGORIA POR ID
  async buscarPorId(id) {
    try {
      const response = await api.get(`/Categorias/${id}`)
      return response.data
    } catch (erro) {
      console.error('Erro ao buscar categoria:', erro.response?.data || erro)
      throw erro
    }
  },

  // CRIAR CATEGORIA
  async criar(dados) {
    try {
      const response = await api.post('/Categorias', dados)
      return response.data
    } catch (erro) {
      console.error('Erro ao criar categoria:', erro.response?.data || erro)
      throw erro
    }
  },

  // ATUALIZAR CATEGORIA
  async atualizar(id, dados) {
    try {
      const response = await api.put(`/Categorias/${id}`, dados)
      return response.data
    } catch (erro) {
      console.error('Erro ao atualizar categoria:', erro.response?.data || erro)
      throw erro
    }
  },

  // DELETAR CATEGORIA
  async deletar(id) {
    try {
      const response = await api.delete(`/Categorias/${id}`)
      return response.data
    } catch (erro) {
      console.error('Erro ao deletar categoria:', erro.response?.data || erro)
      throw erro
    }
  }
}
