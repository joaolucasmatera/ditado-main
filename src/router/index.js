import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requerAutenticacao: false }
  },
  {
    path: '/cadastro',
    name: 'Cadastro',
    component: () => import('@/views/Cadastro.vue'),
    meta: { requerAutenticacao: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/LayoutPrincipal.vue'),
    meta: { requerAutenticacao: true },
    children: [
      {
        path: '',
        name: 'Home',
        redirect: to => {
          const authStore = useAuthStore()
          if (authStore.ehAdministrador) return '/admin'
          if (authStore.ehProfessor) return '/professor'
          if (authStore.ehAluno) return '/aluno'
          return '/login'
        }
      },
      {
        path: '/admin',
        name: 'PainelAdministrador',
        component: () => import('@/views/PainelAdministrador.vue'),
        meta: { requerTipo: 'Administrador' }
      },
      {
        path: '/professor',
        name: 'PainelProfessor',
        component: () => import('@/views/PainelProfessor.vue'),
        meta: { requerTipo: 'Professor' }
      },
      {
        path: '/ditados',
        name: 'Ditados',
        component: () => import('@/views/Ditados.vue'),
        meta: { requerTipo: ['Professor', 'Administrador'] }
      },
      {
        path: '/cadastro-ditado',
        name: 'CadastroDitado',
        component: () => import('@/views/CadastroDitado.vue'),
        meta: { requerTipo: ['Professor', 'Administrador'] }
      },
      {
        path: '/turmas',
        name: 'Turmas',
        component: () => import('@/views/Turmas.vue'),
        meta: { requerTipo: ['Professor', 'Administrador'] }
      },
      {
        path: '/inseriraluno/:turmaId',
        name: 'InsertAluno',
        component: () => import('@/views/InsertAluno.vue'),
        meta: { requerTipo: ['Professor', 'Administrador'] }
      },
      {
        path: '/minhas-turmas',
        name: 'MinhasTurmas',
        component: () => import('@/views/MinhasTurmas.vue'),
        meta: { requerTipo: 'Aluno' }
      },
      {
        path: '/aluno',
        name: 'PainelAluno',
        component: () => import('@/views/PainelAluno.vue'),
        meta: { requerTipo: 'Aluno' }
      },
      {
        path: '/realizar-ditado/:id',
        name: 'RealizarDitado',
        component: () => import('@/views/RealizarDitado.vue'),
        meta: { requerTipo: 'Aluno' }
      },
      {
        path: '/resultado-aluno',
        name: 'ResultadoAluno',
        component: () => import('@/views/ResultadoAluno.vue'),
        meta: { requerTipo: 'Aluno' }
      },
      {
        path: '/perfil',
        name: 'Perfil',
        component: () => import('@/views/PerfilUsuario.vue')
      },
      {
        path: '/categorias',
        name: 'Categorias',
        component: () => import('@/views/Categorias.vue'),
        meta: { requerTipo: ['Professor', 'Administrador'] }
      },
      {
        path: '/cadastro-categoria',
        name: 'CadastroCategoria',
        component: () => import('@/views/CadastroCategoria.vue'),
        meta: { requerTipo: ['Professor', 'Administrador'] }
      },
      {
        path: '/editar-categoria/:id',
        name: 'EditarCategoria',
        component: () => import('@/views/CadastroCategoria.vue'),
        meta: { requerTipo: ['Professor', 'Administrador'] }
      },
      {
        path: '/usuarios',
        name: 'Usuarios',
        component: () => import('@/views/Usuarios.vue'),
        meta: { requerTipo: ['Professor', 'Administrador'] }
      },
      {
        path: '/turmas/:turmaId/ditados/:ditadoId/resultados',
        name: 'ResultadosDitadoProfessor',
        component: () => import('@/views/ResultadoDitado.vue'),
        meta: { requerTipo: ['Professor', 'Administrador'] }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requerAutenticacao && !authStore.estaAutenticado) {
    next('/login')
  } else if (to.path === '/login' && authStore.estaAutenticado) {
    // Redirecionar para o painel correto após login
    if (authStore.ehAdministrador) {
      next('/admin')
    } else if (authStore.ehProfessor) {
      next('/professor')
    } else if (authStore.ehAluno) {
      next('/aluno')
    } else {
      next('/')
    }
  } else if (to.meta.requerTipo) {
    // Verificar se o usuário tem permissão para acessar a rota
    const tiposPermitidos = Array.isArray(to.meta.requerTipo)
      ? to.meta.requerTipo
      : [to.meta.requerTipo]

    if (!tiposPermitidos.includes(authStore.tipoUsuario)) {
      // Usuário não tem permissão, redireciona para o painel correto
      if (authStore.ehAdministrador) {
        next('/admin')
      } else if (authStore.ehProfessor) {
        next('/professor')
      } else if (authStore.ehAluno) {
        next('/aluno')
      } else {
        next('/login')
      }
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
