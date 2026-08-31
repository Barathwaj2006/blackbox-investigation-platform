import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store/auth';

import Login from '../views/Login.vue';
import MainLayout from '../layouts/MainLayout.vue';
import Dashboard from '../views/Dashboard.vue';
import Cases from '../views/Cases.vue';
import CaseDetail from '../views/CaseDetail.vue';
import Audit from '../views/Audit.vue';
import Admin from '../views/Admin.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: Dashboard
        },
        {
          path: 'cases',
          name: 'Cases',
          component: Cases
        },
        {
          path: 'cases/:id',
          name: 'CaseDetail',
          component: CaseDetail
        },
        {
          path: 'audit',
          name: 'Audit',
          component: Audit
        },
        {
          path: 'admin',
          name: 'Admin',
          component: Admin
        }
      ]
    }
  ]
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login' });
  } else if (to.name === 'Login' && authStore.isAuthenticated) {
    next({ name: 'Dashboard' });
  } else {
    next();
  }
});

router.onError((error, to) => {
  if (
    error?.message?.includes('Failed to fetch dynamically imported module') ||
    error?.message?.includes('Importing a module script failed') ||
    error?.name === 'ChunkLoadError'
  ) {
    window.location.reload();
  }
});

export default router;
