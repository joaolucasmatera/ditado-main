import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usuarioService } from '@/services/usuarioService'

function normalizarTipoUsuario(tipo) {
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

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const usuario = ref(JSON.parse(localStorage.getItem('usuario') || 'null'))

  if (token.value) {
    console.log('[Auth] Token carregado do localStorage:', token.value.substring(0, 20) + '...')
  } else {
    console.warn('[Auth] ⚠️ Nenhum token no localStorage')
  }

  const estaAutenticado = computed(() => !!token.value)
  const tipoUsuario = computed(() => normalizarTipoUsuario(usuario.value?.tipo))
  const ehAdministrador = computed(() => tipoUsuario.value === 'Administrador')
  const ehProfessor = computed(() => tipoUsuario.value === 'Professor')
  const ehAluno = computed(() => tipoUsuario.value === 'Aluno')

  async function login(login, senha) {
    try {
      const resposta = await usuarioService.login(login, senha)
      token.value = resposta.token
      usuario.value = resposta.usuario
      
      localStorage.setItem('token', resposta.token)
      localStorage.setItem('usuario', JSON.stringify(resposta.usuario))
      
      return true
    } catch (erro) {
      console.error('Erro no login:', erro)
      throw erro
    }
  }

  function logout() {
    token.value = null
    usuario.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
  }

  async function atualizarUsuario(id, dados) {
    try {
      const usuarioAtualizado = await usuarioService.atualizar(id, dados)
      usuario.value = usuarioAtualizado
      localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado))
      return usuarioAtualizado
    } catch (erro) {
      console.error('Erro ao atualizar usuário:', erro)
      throw erro
    }
  }

  function definirUsuario(novoUsuario, novoToken) {
    usuario.value = novoUsuario
    token.value = novoToken
    localStorage.setItem('token', novoToken)
    localStorage.setItem('usuario', JSON.stringify(novoUsuario))
  }

  return {
    token,
    usuario,
    estaAutenticado,
    tipoUsuario,
    ehAdministrador,
    ehProfessor,
    ehAluno,
    login,
    logout,
    atualizarUsuario,
    definirUsuario
  }
})