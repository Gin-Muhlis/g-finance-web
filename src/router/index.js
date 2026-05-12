import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/app',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: { name: 'app-dashboard' },
        },
        {
          path: 'dashboard',
          name: 'app-dashboard',
          component: () => import('@/views/app/DashboardView.vue'),
          meta: { title: 'Dashboard' },
        },
        {
          path: 'categories',
          name: 'app-categories',
          component: () => import('@/views/app/CategoriesView.vue'),
          meta: { title: 'Kelola kategori' },
        },
        {
          path: 'wallets',
          name: 'app-wallets',
          component: () => import('@/views/app/WalletsView.vue'),
          meta: { title: 'Kelola wallet' },
        },
        {
          path: 'transactions',
          name: 'app-transactions',
          component: () => import('@/views/app/TransactionsView.vue'),
          meta: { title: 'Kelola transaksi' },
        },
        {
          path: 'budget',
          name: 'app-budget',
          component: () => import('@/views/app/BudgetView.vue'),
          meta: { title: 'Kelola budget' },
        },
        {
          path: 'allocations',
          name: 'app-allocations',
          component: () => import('@/views/app/AllocationView.vue'),
          meta: { title: 'Kelola alokasi' },
        },
        {
          path: 'profile',
          name: 'app-profile',
          component: () => import('@/views/app/ProfileView.vue'),
          meta: { title: 'Profil' },
        },
      ],
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.bootstrap()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'app-dashboard' }
  }

  return true
})

export default router
