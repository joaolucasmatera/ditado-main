import api from './api'

export const marketplaceService = {
  async publicar(dados) {
    const { data } = await api.post('/ErrosCatalogo', dados)
    return data
  }
}
