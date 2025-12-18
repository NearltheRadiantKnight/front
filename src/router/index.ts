
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('@/components/common/login.vue')
    },
    {
      path: '/super-admin',
      name: 'SuperAdmin',
      component: () => import('@/components/views/super-admin/Dashboard.vue'),
      children: [
              {
                path: 'dashboard',
                name: 'SuperAdminDashboard',
                component: () => import('@/components/views/super-admin/Dashboard.vue')
              },
              {
                path: 'admin-add',
                name: 'AdminAdd',
                component: () => import('@/components/views/super-admin/AdminAdd.vue')
              },
              {
                path: 'admin-list',
                name: 'AdminList',
                component: () => import('@/components/views/super-admin/AdminList.vue')
              },
              {
                path: 'institute-list',
                name: 'InstituteList',
                component: () => import('@/components/views/super-admin/InstituteList.vue')
              }
            ]
    },
    {
      path: '/inst-admin',
      name: 'InstAdmin',
      component: () => import('@/components/views/inst-admin/Dashboard.vue'),
      children: [
        {
          path: 'dashboard',
          name: 'InstAdminDashboard',
          component: () => import('@/components/views/inst-admin/Dashboard.vue')
        }
      ]
    },
    {
      path: '/defense-leader',
      name: 'DefenseLeader',
      component: () => import('@/components/views/defense-leader/Dashboard.vue'),
      children: [
        {
          path: 'dashboard',
          name: 'DefenseLeaderDashboard',
          component: () => import('@/components/views/defense-leader/Dashboard.vue')
        }
      ]
    },
    {
      path: '/teacher',
      name: 'Teacher',
      component: () => import('@/components/views/teacher/Dashboard.vue'),
      children: [
        {
          path: 'dashboard',
          name: 'TeacherDashboard',
          component: () => import('@/components/views/teacher/Dashboard.vue')
        }
      ]
    },
    // 404 页面
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/components/common/NotFound.vue')
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {

  const isAuthenticated = localStorage.getItem('token') || sessionStorage.getItem('token');

  if (!isAuthenticated && to.name !== 'login') {
    next({ name: 'login' });
  } else if (isAuthenticated && to.name === 'login') {
    const userType = localStorage.getItem('userType');

    // 修改为根据userType跳转
    switch (userType) {
      case 'admin':
        next({ name: 'SuperAdminDashboard' });
        break;
      case 'instAdmin':
        next({ name: 'InstAdminDashboard' });
        break;
      case 'defenseLeader':
        next({ name: 'DefenseLeaderDashboard' });
        break;
      case 'teacher':
        next({ name: 'TeacherDashboard' });
        break;
      default:
        next({ name: 'SuperAdminDashboard' });
    }
  } else {
    next();
  }
});

export default router