import api from './api'

export const ditadoService = {
  async listarTodos() {
    try {
      const response = await api.get('/Ditados')
      return response.data
    } catch (erro) {
      console.error('Erro ao listar ditados:', erro.response?.data || erro)
      throw erro
    }
  },
  async listarMinhasTentativas(ditadoId) {
    try {
      // Rota confirmada no seu Swagger
      const response = await api.get(`/Alunos/ditados/${ditadoId}/minhas-tentativas`)
      return response.data
    } catch (erro) {
      console.error('Erro ao listar tentativas:', erro.response?.data || erro)
      throw erro
    }
  },

  // Adicione isso no ditadoService.js
  async obterDetalhesAtribuicao(turmaId, ditadoId) {
    try {
      // Tenta buscar os detalhes completos
      // ATENÇÃO: Verifique no seu Swagger qual é a URL correta que retorna 'DitadoAtribuidoDetalheDto'
      // Palpite 1:
      const response = await api.get(`/Turmas/${turmaId}/ditados/${ditadoId}`)
      return response.data
    } catch (erro) {
      console.error('Erro ao obter detalhes do ditado:', erro)
      throw erro
    }
  },

  
  async listarMeusDitados() {
    try {
      
      const response = await api.get('/Alunos/meus-ditados')
      return response.data
    } catch (erro) {
      console.error('Erro ao listar meus ditados:', erro.response?.data || erro)
      throw erro
    }
  },

  async listarMeusDitadosAtribuidos() {
    try {
      const response = await api.get("/Professores/meus-ditados-atribuidos")
      return response.data
    } catch (erro) {
      console.error("Erro ao listar meus ditados atribuidos:", erro.response?.data || erro)
      throw erro
    }
  },

  async buscarPorId(id) {
    try {
      const response = await api.get(`/Ditados/${id}`)
      return response.data
    } catch (erro) {
      console.error('Erro ao buscar ditado:', erro.response?.data || erro)
      throw erro
    }
  },

  async visualizar(id) {
    try {
      const response = await api.get(`/Ditados/${id}/visualizar`)
      return response.data
    } catch (erro) {
      console.error('Erro ao visualizar ditado:', erro.response?.data || erro)
      throw erro
    }
  },

  async criar(dados) {
    try {
      const response = await api.post('/Ditados', dados)
      return response.data
    } catch (erro) {
      console.error('Erro ao criar ditado:', erro.response?.data || erro)
      throw erro
    }
  },

  async atualizar(id, dados) {
    try {
      const response = await api.put(`/Ditados/${id}`, dados)
      return response.data
    } catch (erro) {
      console.error('Erro ao atualizar ditado:', erro.response?.data || erro)
      throw erro
    }
  },

  async deletar(id) {
    try {
      const response = await api.delete(`/Ditados/${id}`)
      return response.data
    } catch (erro) {
      console.error('Erro ao deletar ditado:', erro.response?.data || erro)
      throw erro
    }
  },

  async buscarParaRealizar(id) {
    try {
      const response = await api.get(`/Ditados/${id}/realizar`)
      return response.data
    } catch (erro) {
      console.error('Erro ao buscar ditado para realizar:', erro.response?.data || erro)
      throw erro
    }
  },

  async submeterResposta(id, respostas) {
    try {
      const response = await api.post(`/Ditados/${id}/submeter`, { respostas })
      return response.data
    } catch (erro) {
      console.error('Erro ao submeter resposta:', erro.response?.data || erro)
      throw erro
    }
  },

  async buscarResultado(respostaDitadoId) {
    try {
      const response = await api.get(`/RespostasDitados/${respostaDitadoId}`)
      return response.data
    } catch (erro) {
      console.error('Erro ao buscar resultado:', erro.response?.data || erro)
      throw erro
    }
  },

    async buscarResultadosDitadoProfessor(turmaId, ditadoId) {
    try {
      const response = await api.get(`/Professores/turmas/${turmaId}/ditados/${ditadoId}/resultados`)
      return response.data
    } catch (erro) {
      console.error("Erro ao buscar resultados do ditado para professor:", erro.response?.data || erro)
      throw erro
    }
  },

  async buscarResultadoAlunoDetalhado(turmaId, alunoId, ditadoId) {
    try {
      const response = await api.get(`/Professores/turmas/${turmaId}/alunos/${alunoId}/ditados/${ditadoId}/resultado`)
      return response.data
    } catch (erro) {
      console.error("Erro ao buscar resultado detalhado do aluno:", erro.response?.data || erro)
      throw erro
    }
  }

}
