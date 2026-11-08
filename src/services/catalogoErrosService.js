import api from './api'

export const catalogoErrosService = {
  async listar(estado = 'ativo') {
    const { data } = await api.get('/ErrosCatalogo', { params: { estado } })
    return data
  },

  async obter(id) {
    const { data } = await api.get(`/ErrosCatalogo/${id}`)
    return data
  },

  async atualizar(id, dados) {
    const { data } = await api.put(`/ErrosCatalogo/${id}`, dados)
    return data
  },

  async arquivar(id) {
    await api.post(`/ErrosCatalogo/${id}/arquivar`)
  },

  async restaurar(id) {
    await api.post(`/ErrosCatalogo/${id}/restaurar`)
  },

  async importar(arquivo) {
    const formulario = new FormData()
    formulario.append('arquivo', arquivo)
    const { data } = await api.post('/ErrosCatalogo/importar', formulario)
    return data
  }
}
