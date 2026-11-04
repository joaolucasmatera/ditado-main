import api from './api'

export const solicitacaoIngressoService = {
  // Aluno - Solicitar ingresso em turma
  async solicitarIngresso(codigo) {
    try {
      const response = await api.post('/SolicitacoesIngresso/solicitar', { codigo })
      return response.data
    } catch (erro) {
      console.error('Erro ao solicitar ingresso:', erro.response?.data || erro)
      // Retornar mock para teste
      return {
        id: Math.random(),
        codigo: codigo,
        status: 'Pendente',
        dataSolicitacao: new Date()
      }
    }
  },

  // Listar turmas do aluno (aprovadas)
  async listarMinhasTurmas() {
    try {
      const response = await api.get('/SolicitacoesIngresso/minhas-turmas')
      return response.data
    } catch (erro) {
      console.error('Erro ao listar minhas turmas:', erro.response?.data || erro)
      return []
    }
  },

  // Professor/Admin - Listar solicitações pendentes
  async listarSolicitacoesPendentes(turmaId) {
    try {
      const response = await api.get(`/SolicitacoesIngresso/turma/${turmaId}/pendentes`)
      return response.data
    } catch (erro) {
      console.error('Erro ao listar solicitações pendentes:', erro.response?.data || erro)
      return []
    }
  },

  // Professor/Admin - Aprovar solicitação
  async aprovarSolicitacao(solicitacaoId) {
    try {
      const response = await api.post(`/SolicitacoesIngresso/${solicitacaoId}/aprovar`)
      return response.data
    } catch (erro) {
      console.error('Erro ao aprovar solicitação:', erro.response?.data || erro)
      throw erro
    }
  },

  // Professor/Admin - Rejeitar solicitação
  async rejeitarSolicitacao(solicitacaoId) {
    try {
      const response = await api.post(`/SolicitacoesIngresso/${solicitacaoId}/rejeitar`)
      return response.data
    } catch (erro) {
      console.error('Erro ao rejeitar solicitação:', erro.response?.data || erro)
      throw erro
    }
  },

  // Listar todas as solicitações de um professor/admin
  async listarMinhasSolicitacoes() {
    try {
      const response = await api.get('/SolicitacoesIngresso/minhas-solicitacoes')
      return response.data
    } catch (erro) {
      console.error('Erro ao listar minhas solicitações:', erro.response?.data || erro)
      return []
    }
  }
}
