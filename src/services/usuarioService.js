import api from './api'

const TIPO_USUARIO_ENUM = {
  Administrador: 1,
  Professor: 2,
  Aluno: 3,
  AcessoSolicitado: 4
}

function tipoParaEnum(tipo) {
  if (tipo === null || tipo === undefined || tipo === '') return tipo

  if (typeof tipo === 'number') return tipo

  const valorNormalizado = String(tipo).trim()
  if (Object.prototype.hasOwnProperty.call(TIPO_USUARIO_ENUM, valorNormalizado)) {
    return TIPO_USUARIO_ENUM[valorNormalizado]
  }

  const mapa = {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    Admin: 1,
    Administrador: 1,
    Professor: 2,
    Aluno: 3,
    AcessoSolicitado: 4
  }

  return mapa[valorNormalizado] ?? tipo
}

function normalizarTipoUsuario(tipo) {
  if (tipo === null || tipo === undefined || tipo === '') return tipo

  const mapa = {
    1: 'Administrador',
    2: 'Professor',
    3: 'Aluno',
    4: 'AcessoSolicitado',
    '1': 'Administrador',
    '2': 'Professor',
    '3': 'Aluno',
    '4': 'AcessoSolicitado',
    Admin: 'Administrador',
    Administrador: 'Administrador',
    Professor: 'Professor',
    Aluno: 'Aluno',
    AcessoSolicitado: 'AcessoSolicitado'
  }

  return mapa[String(tipo)] ?? tipo
}

function normalizarUsuario(usuario) {
  if (!usuario) return usuario

  return {
    ...usuario,
    tipo: normalizarTipoUsuario(usuario.tipo)
  }
}

export const usuarioService = {
  // LOGIN
  async login(login, senha) {
    try {
      const response = await api.post('/Usuarios/login', { login, senha })
      const dados = response.data || {}

      if (dados.usuario) {
        dados.usuario = normalizarUsuario(dados.usuario)
      }

      return dados
    } catch (erro) {
      console.error('Erro no login:', erro.response?.data || erro)
      throw erro
    }
  },

  async loginAluno(matriculaOuCodigo, pin) {
    const response = await api.post('/Usuarios/login-aluno', { matriculaOuCodigo, pin })
    const dados = response.data || {}
    if (dados.usuario) dados.usuario = normalizarUsuario(dados.usuario)
    return dados
  },

  async configurarPrimeiroAcessoAluno(matriculaOuCodigo, pin) {
    const response = await api.post('/Usuarios/primeiro-acesso-aluno', { matriculaOuCodigo, pin })
    return response.data
  },

  async verificarPrimeiroAcessoAluno(matriculaOuCodigo) {
    const response = await api.post('/Usuarios/primeiro-acesso-aluno/verificar', { matriculaOuCodigo })
    return response.data
  },


  // CADASTRO - Auto-cadastro como Aluno
  async solicitarAcesso(dados) {
    try {
      // Enviar para solicitar-acesso (novo cadastro público)
      const response = await api.post('/Usuarios/solicitar-acesso', {
        nome: dados.nome,
        login: dados.login,
        senha: dados.senha,
        matricula: dados.matricula || null
      })
      return response.data
    } catch (erro) {
      console.error('Erro ao solicitar acesso:', erro.response?.data || erro)
      throw erro
    }
  },

  async cadastrarProfessor(dados) {
    const response = await api.post('/Usuarios/cadastro-professor', dados)
    return response.data
  },

  async solicitarAcessoAluno(dados) {
    const response = await api.post('/Usuarios/solicitar-acesso-aluno', dados)
    return response.data
  },

  async cadastrarAlunoManual(dados) {
    const response = await api.post('/Usuarios/alunos-manual', dados)
    return response.data
  },

  async importarAlunosPreview(arquivo) {
    const form = new FormData()
    form.append('arquivo', arquivo)
    const response = await api.post('/Usuarios/importar-alunos/preview', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    return response.data
  },

  // CRIAR USUÁRIO (Admin only)
  async criar(dados) {
    try {
      const payload = { ...dados }
      if (payload.tipo !== undefined && payload.tipo !== null && payload.tipo !== '') {
        payload.tipo = tipoParaEnum(payload.tipo)
      }

      const response = await api.post('/Usuarios', payload)
      return response.data
    } catch (erro) {
      console.error('Erro ao criar usuário:', erro.response?.data || erro)
      throw erro
    }
  },

  // LISTAR TODOS (Admin only)
  async listarTodos() {
    try {
      const response = await api.get('/Usuarios')
      const dados = response.data || []
      return Array.isArray(dados) ? dados.map(normalizarUsuario) : []
    } catch (erro) {
      console.error('Erro ao listar usuários:', erro.response?.data || erro)
      throw erro
    }
  },

  // BUSCAR POR ID
  async buscarPorId(id) {
    try {
      const response = await api.get(`/Usuarios/${id}`)
      return normalizarUsuario(response.data)
    } catch (erro) {
      console.error('Erro ao buscar usuário:', erro.response?.data || erro)
      throw erro
    }
  },

  // ATUALIZAR USUÁRIO
  async atualizar(id, dados) {
    try {
      const payload = { ...dados }
      if (payload.tipo !== undefined && payload.tipo !== null && payload.tipo !== '') {
        payload.tipo = tipoParaEnum(payload.tipo)
      }

      const response = await api.put(`/Usuarios/${id}`, payload)
      return response.data
    } catch (erro) {
      console.error('Erro ao atualizar usuário:', erro.response?.data || erro)
      throw erro
    }
  },

  // LISTAR SOLICITAÇÕES PENDENTES (Admin/Professor)
  async listarSolicitacoesPendentes() {
    try {
      const response = await api.get('/Usuarios/solicitacoes-pendentes')
      const dados = response.data

      if (Array.isArray(dados)) return dados
      if (dados && Array.isArray(dados.data)) return dados.data
      if (dados && Array.isArray(dados.items)) return dados.items

      return []
    } catch (erro) {
      console.warn('Solicitações pendentes indisponíveis no backend:', erro.response?.data || erro.message || erro)
      return []
    }
  },

  // APROVAR ACESSO (Admin/Professor)
  async aprovarAcesso(id, novoTipo) {
    try {
      const tipo = typeof novoTipo === 'number' ? novoTipo : tipoParaEnum(novoTipo)
      const response = await api.post(`/Usuarios/${id}/aprovar-acesso`, {
        novoTipo: tipo
      })
      return response.data
    } catch (erro) {
      console.error('Erro ao aprovar acesso:', erro.response?.data || erro)
      throw erro
    }
  },

  // BLOQUEAR USUÁRIO (Admin only)
  async bloquear(id) {
    try {
      const response = await api.patch(`/Usuarios/${id}/bloquear`)
      return response.data
    } catch (erro) {
      console.error('Erro ao bloquear usuário:', erro.response?.data || erro)
      throw erro
    }
  },

  // DESBLOQUEAR USUÁRIO (Admin only)
  async desbloquear(id) {
    try {
      const response = await api.patch(`/Usuarios/${id}/desbloquear`)
      return response.data
    } catch (erro) {
      console.error('Erro ao desbloquear usuário:', erro.response?.data || erro)
      throw erro
    }
  },

  // DELETAR USUÁRIO (Admin only)
  async deletar(id) {
    try {
      const response = await api.delete(`/Usuarios/${id}`)
      return response.data
    } catch (erro) {
      console.error('Erro ao deletar usuário:', erro.response?.data || erro)
      throw erro
    }
  }
}
