import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { turmaService } from '@/services/turmaService'
import { solicitacaoIngressoService } from '@/services/solicitacaoIngressoService'

export const useTurmaStore = defineStore('turma', () => {
  const turmas = ref([])
  const minhasTurmas = ref([])
  const solicitacoesPendentes = ref([])
  const turmaAtual = ref(null)
  const carregando = ref(false)
  const erro = ref(null)

  // Computados
  const temTurmas = computed(() => turmas.value.length > 0)
  const temMinhasTurmas = computed(() => minhasTurmas.value.length > 0)
  const temSolicitacoesPendentes = computed(() => solicitacoesPendentes.value.length > 0)

  // Turmas - CRUD
  async function listarTodas() {
    carregando.value = true
    erro.value = null
    try {
      turmas.value = await turmaService.listarTodas()
      return turmas.value
    } catch (e) {
      erro.value = e.message
      throw e
    } finally {
      carregando.value = false
    }
  }

  async function buscarPorId(id) {
    try {
      turmaAtual.value = await turmaService.buscarPorId(id)
      return turmaAtual.value
    } catch (e) {
      erro.value = e.message
      throw e
    }
  }

  async function buscarPorCodigo(codigo) {
    try {
      return await turmaService.buscarPorCodigo(codigo)
    } catch (e) {
      erro.value = e.message
      throw e
    }
  }

  async function criar(dados) {
    carregando.value = true
    erro.value = null
    try {
      const novaTurma = await turmaService.criar(dados)
      turmas.value.push(novaTurma)
      return novaTurma
    } catch (e) {
      erro.value = e.message
      throw e
    } finally {
      carregando.value = false
    }
  }

  async function atualizar(id, dados) {
    carregando.value = true
    erro.value = null
    try {
      const turmaAtualizada = await turmaService.atualizar(id, dados)
      const index = turmas.value.findIndex(t => t.id === id)
      if (index !== -1) {
        turmas.value[index] = turmaAtualizada
      }
      if (turmaAtual.value?.id === id) {
        turmaAtual.value = turmaAtualizada
      }
      return turmaAtualizada
    } catch (e) {
      erro.value = e.message
      throw e
    } finally {
      carregando.value = false
    }
  }

  async function deletar(id) {
    carregando.value = true
    erro.value = null
    try {
      await turmaService.deletar(id)
      turmas.value = turmas.value.filter(t => t.id !== id)
      if (turmaAtual.value?.id === id) {
        turmaAtual.value = null
      }
    } catch (e) {
      erro.value = e.message
      throw e
    } finally {
      carregando.value = false
    }
  }

  async function listarMinhas() {
    carregando.value = true
    erro.value = null
    try {
      minhasTurmas.value = await turmaService.listarMinhas()
      return minhasTurmas.value
    } catch (e) {
      erro.value = e.message
      throw e
    } finally {
      carregando.value = false
    }
  }

  // Ditados da turma
  async function listarDitados(turmaId) {
    try {
      return await turmaService.listarDitados(turmaId)
    } catch (e) {
      erro.value = e.message
      throw e
    }
  }

  async function adicionarDitado(turmaId, ditadoId, dataLimite) {
    carregando.value = true
    erro.value = null
    try {
      const resultado = await turmaService.atribuirDitado(turmaId, ditadoId, dataLimite)
      return resultado
    } catch (e) {
      erro.value = e.message
      throw e
    } finally {
      carregando.value = false
    }
  }

  async function removerDitado(turmaId, ditadoId) {
    carregando.value = true
    erro.value = null
    try {
      await turmaService.removerDitado(turmaId, ditadoId)
    } catch (e) {
      erro.value = e.message
      throw e
    } finally {
      carregando.value = false
    }
  }

  // Membros da turma
  async function listarMembros(turmaId) {
    try {
      return await turmaService.listarMembros(turmaId)
    } catch (e) {
      erro.value = e.message
      throw e
    }
  }

  async function removerMembro(turmaId, usuarioId) {
    carregando.value = true
    erro.value = null
    try {
      await turmaService.removerMembro(turmaId, usuarioId)
    } catch (e) {
      erro.value = e.message
      throw e
    } finally {
      carregando.value = false
    }
  }

  // Solicitações de ingresso
  async function solicitarIngresso(codigo) {
    carregando.value = true
    erro.value = null
    try {
      const resultado = await solicitacaoIngressoService.solicitarIngresso(codigo)
      return resultado
    } catch (e) {
      erro.value = e.message
      throw e
    } finally {
      carregando.value = false
    }
  }

  async function listarMinhasTurmasAluno() {
    carregando.value = true
    erro.value = null
    try {
      minhasTurmas.value = await solicitacaoIngressoService.listarMinhasTurmas()
      return minhasTurmas.value
    } catch (e) {
      erro.value = e.message
      throw e
    } finally {
      carregando.value = false
    }
  }

  async function listarSolicitacoesPendentes(turmaId) {
    carregando.value = true
    erro.value = null
    try {
      solicitacoesPendentes.value = await solicitacaoIngressoService.listarSolicitacoesPendentes(turmaId)
      return solicitacoesPendentes.value
    } catch (e) {
      erro.value = e.message
      throw e
    } finally {
      carregando.value = false
    }
  }

  async function aprovarSolicitacao(solicitacaoId) {
    carregando.value = true
    erro.value = null
    try {
      const resultado = await solicitacaoIngressoService.aprovarSolicitacao(solicitacaoId)
      // Atualizar lista de solicitações pendentes
      solicitacoesPendentes.value = solicitacoesPendentes.value.filter(s => s.id !== solicitacaoId)
      return resultado
    } catch (e) {
      erro.value = e.message
      throw e
    } finally {
      carregando.value = false
    }
  }

  async function rejeitarSolicitacao(solicitacaoId) {
    carregando.value = true
    erro.value = null
    try {
      const resultado = await solicitacaoIngressoService.rejeitarSolicitacao(solicitacaoId)
      // Atualizar lista de solicitações pendentes
      solicitacoesPendentes.value = solicitacoesPendentes.value.filter(s => s.id !== solicitacaoId)
      return resultado
    } catch (e) {
      erro.value = e.message
      throw e
    } finally {
      carregando.value = false
    }
  }

  async function listarMinhasSolicitacoes() {
    carregando.value = true
    erro.value = null
    try {
      return await solicitacaoIngressoService.listarMinhasSolicitacoes()
    } catch (e) {
      erro.value = e.message
      throw e
    } finally {
      carregando.value = false
    }
  }

  function limparErro() {
    erro.value = null
  }

  function resetar() {
    turmas.value = []
    minhasTurmas.value = []
    solicitacoesPendentes.value = []
    turmaAtual.value = null
    erro.value = null
  }

  return {
    turmas,
    minhasTurmas,
    solicitacoesPendentes,
    turmaAtual,
    carregando,
    erro,
    temTurmas,
    temMinhasTurmas,
    temSolicitacoesPendentes,
    listarTodas,
    buscarPorId,
    buscarPorCodigo,
    criar,
    atualizar,
    deletar,
    listarMinhas,
    listarDitados,
    adicionarDitado,
    removerDitado,
    listarMembros,
    removerMembro,
    solicitarIngresso,
    listarMinhasTurmasAluno,
    listarSolicitacoesPendentes,
    aprovarSolicitacao,
    rejeitarSolicitacao,
    listarMinhasSolicitacoes,
    limparErro,
    resetar
  }
})
