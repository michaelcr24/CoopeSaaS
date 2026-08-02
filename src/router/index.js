import { createRouter, createWebHistory } from 'vue-router'

const LandingPage = () => import('../views/LandingPage.vue')
const LoginPage = () => import('../views/LoginPage.vue')
const PricingView = () => import('../views/PricingView.vue')
const AboutView = () => import('../views/AboutView.vue')
const ModuleSelectorView = () => import('../views/ModuleSelectorView.vue')
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
  { path: '/', component: LandingPage, meta: { title: 'CoopeSaaS — Gestión Cooperativa', public: true } },
  { path: '/planes', component: PricingView, meta: { title: 'Planes — CoopeSaaS', public: true } },
  { path: '/precios', redirect: '/planes' },
  { path: '/nosotros', component: AboutView, meta: { title: 'Nosotros — CoopeSaaS', public: true } },
  { path: '/login', component: LoginPage, meta: { title: 'Iniciar sesión — CoopeSaaS', public: true } },
  { path: '/modulos', component: ModuleSelectorView, meta: { title: 'Configurar módulos — CoopeSaaS' } },
  {
    path: '/dashboard',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', component: DashboardHome, meta: { title: 'Inicio — CoopeSaaS' } },
      { path: 'personal', component: PersonalView, meta: { title: 'Personal — CoopeSaaS' } },
      { path: 'asociados', component: AsociadosView, meta: { title: 'Asociados — CoopeSaaS' } },
      { path: 'organos', component: OrganosView, meta: { title: 'Órganos Sociales — CoopeSaaS' } },
      { path: 'comites', component: ComitesView, meta: { title: 'Comités — CoopeSaaS' } },
      { path: 'asambleas', component: AsambleasView, meta: { title: 'Asambleas — CoopeSaaS' } },
      { path: 'votaciones', component: VotacionesView, meta: { title: 'Votaciones — CoopeSaaS' } },
      { path: 'finanzas', component: FinanzasView, meta: { title: 'Finanzas — CoopeSaaS' } },
      { path: 'creditos', component: CreditosView, meta: { title: 'Créditos — CoopeSaaS' } },
      { path: 'riesgos', component: RiesgosView, meta: { title: 'Riesgos — CoopeSaaS' } },
      { path: 'reportes', component: ReportesView, meta: { title: 'Reportes — CoopeSaaS' } },
      { path: 'configuracion', component: ConfiguracionView, meta: { title: 'Configuración — CoopeSaaS' } },
      { path: 'configuracion/roles', component: RolesView, meta: { title: 'Roles — CoopeSaaS' } },
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
})
