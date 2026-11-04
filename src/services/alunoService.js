import api from './api'

export const alunoService = {
  // LISTAR TODOS OS DITADOS DO ALUNO LOGADO
  async listarMeusDitados() {
    try {
      const response = await api.get('/Alunos/meus-ditados')
      return response.data || []
    } catch (erro) {
      console.error('Erro ao listar meus ditados:', erro.response?.data || erro)
      throw erro
    }
  },

  // LISTAR DITADOS DE UMA TURMA ESPECÍFICA (filtra meus ditados por turma)
  async listarDitadosDaTurma(turmaId) {
    try {
      const meusDitados = await this.listarMeusDitados()
      // Filtra apenas ditados que foram atribuídos à turma especificada
      return meusDitados.filter(ditado =>
        ditado.turmas?.some(turma => turma.turmaId === turmaId)
      )
    } catch (erro) {
      console.error('Erro ao listar ditados da turma:', erro.response?.data || erro)
      throw erro
    }
  }
}
