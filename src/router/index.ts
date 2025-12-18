import {createRouter, createWebHistory} from 'vue-router'

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
          path: '/dashboard',
          name:'dashboard',
          component:()=>import('@/components/views/super-admin/index.vue')
        },
        {
          path:'/institute',
          name:'institute',
          component:()=>import('@/components/views/super-admin/InstituteList.vue')
        },
        {
          path: '/admin-add',
          name: 'AdminAdd',
          component: () => import('@/components/views/super-admin/AdminAdd.vue')
        },
        {
          path: '/admin',
          name:'admin',
          component: () => import('@/components/views/super-admin/AdminList.vue')
        },
        {
          path: '/evaluation',
          name:'evaluation',
          component:()=>import('@/components/views/super-admin/Evaluation.vue')
        },
        {
          path: '/admin-list',
          name: 'AdminList',
          component: () => import('@/components/views/super-admin/AdminList.vue')
        },
        {
          path: '/institute-list',
          name: 'InstituteList',
          component: () => import('@/components/views/super-admin/InstituteList.vue')
        },
        {
          path: '/instituteadd',
          name:'instituteadd',
          component:()=>import('@/components/views/super-admin/InstituteAdd.vue')
        },
        {
          path: '/adminadd',
          name:'adminadd',
          component:()=>import('@/components/views/super-admin/AdminAdd.vue')
        },
        {
          path: '/:pathMatch(.*)*',
          name:'notdone',
          component:()=>import('@/components/views/super-admin/Other.vue')
        }
      ]
    },
    {
      path: '/inst-admin',
      name: 'InstAdmin',
      component: () => import('@/components/views/inst-admin/Dashboard.vue'),
      children: [
      ]
    },
    {
      path: '/defense-leader',
      name: 'DefenseLeader',
      component: () => import('@/components/views/defense-leader/Dashboard.vue'),
      children: [
      ]
    },
    {
      path: '/teacher',
      name: 'Teacher',
      component: () => import('@/components/views/teacher/Dashboard.vue'),
      children: [
      ]
    },
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
    next({name: 'login'});
  } else if (isAuthenticated && to.name === 'login') {
    const userType = localStorage.getItem('userType');

    // 修改为根据userType跳转
    switch (userType) {
      case 'admin':
        next({name: 'SuperAdmin'});
        break;
      case 'instAdmin':
        next({name: 'InstAdmin'});
        break;
      case 'defenseLeader':
        next({name: 'DefenseLeader'});
        break;
      case 'teacher':
        next({name: 'Teacher'});
        break;
      default:
        next({name: 'SuperAdmin'});
    }
  } else {
    next();
  }
});

export default router
