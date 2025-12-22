import {createRouter, createWebHistory} from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 登录页
    {
      path: '/',
      name: 'login',
      component: () => import('@/components/common/login.vue')
    },

    // 超级管理员
    {
      path: '/admin',
      name: 'SuperAdminDashboard',
      component: () => import('@/components/views/super-admin/Dashboard.vue'),
      children: [
        {
          path: '',
          name: 'SuperAdminHome',
          component: () => import('@/components/views/super-admin/index.vue')
        },
        {
          path: 'index',
          name: 'SuperAdminIndex',
          component: () => import('@/components/views/super-admin/index.vue')
        },
        {
          path: 'institute',
          name: 'SuperAdminInstituteList',
          component: () => import('@/components/views/super-admin/InstituteList.vue')
        },
        {
          path: 'adminadd',
          name: 'SuperAdminAdminAdd',
          component: () => import('@/components/views/super-admin/AdminAdd.vue')
        },
        {
          path: 'evaluation',
          name: 'SuperAdminEvaluation',
          component: () => import('@/components/views/super-admin/Evaluation.vue')
        },
        {
          path: 'adminlist',
          name: 'SuperAdminAdminList',
          component: () => import('@/components/views/super-admin/AdminList.vue')
        },
        {
          path: 'instituteadd',
          name: 'SuperAdminInstituteAdd',
          component: () => import('@/components/views/super-admin/InstituteAdd.vue')
        },
        {
          path: '/:pathMatch(.*)*',
          name:'SuperAdminNotFound',
          component:()=>import('@/components/views/super-admin/Other.vue')
        }
      ]
    },

    // 院系管理员
    {
      path: '/inst-admin',
      name: 'InstAdminDashboard',
      component: () => import('@/components/views/inst-admin/Dashboard.vue'),
      children: [
        {
          path: '',
          name: 'InstAdminHome',
          component: () => import('@/components/views/inst-admin/index.vue')
        },
        {
          path: 'index',
          name: 'InstAdminIndex',
          component: () => import('@/components/views/inst-admin/index.vue')
        }
      ]
    },

    // 答辩组长
    {
      path: '/defense-leader',
      name: 'DefenseLeaderDashboard',
      component: () => import('@/components/views/defense-leader/Dashboard.vue'),
      children: [
        {
          path: '',
          name: 'DefenseLeaderHome',
          component: () => import('@/components/views/defense-leader/index.vue')
        },
        {
          path: 'index',
          name: 'DefenseLeaderIndex',
          component: () => import('@/components/views/defense-leader/index.vue')
        }
      ]
    },

    // 普通教师
    {
      path: '/teacher',
      name: 'TeacherDashboard',
      component: () => import('@/components/views/teacher/Dashboard.vue'),
      children: [
        {
          path: '',
          name: 'TeacherHome',
          component: () => import('@/components/views/teacher/index.vue')
        },
        {
          path: 'index',
          name: 'TeacherIndex',
          component: () => import('@/components/views/teacher/index.vue')
        }
      ]
    },

    // 404页面
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/components/common/NotFound.vue')
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  const userType = localStorage.getItem('userType')

  // 如果是访问登录页且已登录，根据用户类型跳转到对应首页
  if (isAuthenticated && to.name === 'login') {
    console.log('已登录用户访问登录页，跳转到对应首页，userType:', userType)

    switch (userType) {
      case 'admin':
        next({ name: 'SuperAdminHome' })
        break
      case 'instAdmin':
        next({ name: 'InstAdminHome' })
        break
      case 'defenseLeader':
        next({ name: 'DefenseLeaderHome' })
        break
      case 'teacher':
        next({ name: 'TeacherHome' })
        break
      default:
        // 如果 userType 未知，清除登录状态重新登录
        localStorage.clear()
        next({ name: 'login' })
    }
    return
  }

  // 如果是未登录状态访问需要登录的页面
  if (!isAuthenticated && to.name !== 'login') {
    console.log('未登录，跳转到登录页，目标路径:', to.path)
    next({ name: 'login' })
    return
  }

  // 已登录用户访问其他页面
  if (isAuthenticated) {
    console.log('已登录用户访问:', to.path, 'userType:', userType)

    // 特别处理：如果是访问根路径，根据用户类型跳转
    if (to.path === '/' || to.path === '/admin' || to.path === '/inst-admin' ||
        to.path === '/defense-leader' || to.path === '/teacher') {
      switch (userType) {
        case 'admin':
          if (to.path !== '/admin') {
            next({ name: 'SuperAdminHome' })
            return
          }
          break
        case 'instAdmin':
          if (to.path !== '/inst-admin') {
            next({ name: 'InstAdminHome' })
            return
          }
          break
        case 'defenseLeader':
          if (to.path !== '/defense-leader') {
            next({ name: 'DefenseLeaderHome' })
            return
          }
          break
        case 'teacher':
          if (to.path !== '/teacher') {
            next({ name: 'TeacherHome' })
            return
          }
          break
      }
    }

    // 权限检查：确保用户只能访问自己角色的路径
    const currentPath = to.path
    let hasPermission = true

    switch (userType) {
      case 'admin':
        if (!currentPath.startsWith('/admin')) {
          console.log('管理员尝试访问非管理员路径，重定向')
          hasPermission = false
        }
        break
      case 'instAdmin':
        if (!currentPath.startsWith('/inst-admin')) {
          console.log('院系管理员尝试访问非授权路径，重定向')
          hasPermission = false
        }
        break
      case 'defenseLeader':
        if (!currentPath.startsWith('/defense-leader')) {
          console.log('答辩组长尝试访问非授权路径，重定向')
          hasPermission = false
        }
        break
      case 'teacher':
        if (!currentPath.startsWith('/teacher')) {
          console.log('教师尝试访问非授权路径，重定向')
          hasPermission = false
        }
        break
      default:
        // 未知用户类型，清除登录状态
        localStorage.clear()
        next({ name: 'login' })
        return
    }

    if (!hasPermission) {
      // 没有权限，跳转到对应角色的首页
      switch (userType) {
        case 'admin':
          next({ name: 'SuperAdminHome' })
          break
        case 'instAdmin':
          next({ name: 'InstAdminHome' })
          break
        case 'defenseLeader':
          next({ name: 'DefenseLeaderHome' })
          break
        case 'teacher':
          next({ name: 'TeacherHome' })
          break
      }
      return
    }
  }

  // 所有检查通过，允许访问
  console.log('允许访问:', to.path)
  next()
})

export default router