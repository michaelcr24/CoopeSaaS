import { createRouter, createWebHistory } from 'vue-router'

const LoginPage = () => import('../views/LoginPage.vue')
const DashboardLayout = () => import('../layouts/DashboardLayout.vue')
const DashboardHome = () => import('../views/DashboardHome.vue')
const PersonalView = () => import('../views/PersonalView.vue')
const AsociadosView = () => import('../views/AsociadosView.vue')
const OrganosView = () => import('../views/OrganosView.vue')
const ComitesView = () => import('../views/ComitesView.vue')
const AsambleasView = () => import('../views/AsambleasView.vue')
const VotacionesView = () => import('../views/VotacionesView.vue')
const FinanzasView = () => import('../views/FinanzasView.vue')
const CreditosView = () => import('../views/CreditosView.vue')
const RiesgosView = () => import('../views/RiesgosView.vue')
const ReportesView = () => import('../views/ReportesView.vue')
const ConfiguracionView = () => import('../views/ConfiguracionView.vue')
const RolesView = () => import('../views/RolesView.vue')

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginPage, meta: { title: 'Iniciar sesión — CoopeSaaS', public: true } },
  {
    path: '/dashboard',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', component: DashboardHome, meta: { title: 'Inicio — CoopeSaaS' } },
      { path: 'personal', component: PersonalView, meta: { title: 'Personal — CoopeSaaS', module: 'personal' } },
      { path: 'asociados', component: AsociadosView, meta: { title: 'Asociados — CoopeSaaS', module: 'asociados' } },
      { path: 'organos', component: OrganosView, meta: { title: 'Órganos Sociales — CoopeSaaS', module: 'organos' } },
      { path: 'comites', component: ComitesView, meta: { title: 'Comités — CoopeSaaS', module: 'comites' } },
      { path: 'asambleas', component: AsambleasView, meta: { title: 'Asambleas — CoopeSaaS', module: 'asambleas' } },
      { path: 'votaciones', component: VotacionesView, meta: { title: 'Votaciones — CoopeSaaS', module: 'votaciones' } },
      { path: 'finanzas', component: FinanzasView, meta: { title: 'Finanzas — CoopeSaaS', module: 'finanzas' } },
      { path: 'creditos', component: CreditosView, meta: { title: 'Créditos — CoopeSaaS', module: 'creditos' } },
      { path: 'riesgos', component: RiesgosView, meta: { title: 'Riesgos — CoopeSaaS', module: 'riesgos' } },
      { path: 'reportes', component: ReportesView, meta: { title: 'Reportes — CoopeSaaS', module: 'reportes' } },
      { path: 'configuracion', component: ConfiguracionView, meta: { title: 'Configuración — CoopeSaaS', module: 'configuracion' } },
      { path: 'configuracion/roles', component: RolesView, meta: { title: 'Roles — CoopeSaaS', module: 'configuracion' } },
    ],
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  document.title = to.meta.title || 'CoopeSaaS'
})

router.beforeEach(async (to) => {
  if (to.meta.public) return true

  const { currentUser, loading } = await import('../composables/useAuth.js').then(m => m.useAuth())

  if (loading.value) return true

  if (to.meta.requiresAuth && !currentUser.value) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (to.path === '/login' && currentUser.value) {
    return { path: '/dashboard' }
  }

  if (to.meta.module && currentUser.value) {
    const { getEnabledModules } = await import('../composables/useRolePermissions.js')
    const allowed = await getEnabledModules(currentUser.value.profile?.role)
    if (!allowed.has(to.meta.module)) {
      return { path: '/dashboard' }
    }
  }
})
