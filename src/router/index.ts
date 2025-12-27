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
    {
      path:'/common',
      name:'Common',
      children:[
        {
          path: 'passwordModify',
          name: 'InstAdminPasswordModify',
          component: () => import('@/components/common/passwordModify.vue')
        }
      ]
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
          path: 'defenseYear',
          name: 'SuperAdminDefenseYear',
          component: () => import('@/components/views/super-admin/defenseYearManagement.vue')
        },
        // 新增：模板管理页面（包含日期设置）
        {
          path: 'template',
          name: 'SuperAdminTemplate',
          component: () => import('@/components/views/super-admin/TemplateManagement.vue')
        },
        // 删除单独的日期设置路由，合并到模板管理页面
        {
          path: 'passwordModify',
          name: 'SuperAdminPasswordModify',
          component: () => import('@/components/common/passwordModify.vue')
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
        },
        // 学生管理
        {
          path: 'students',
          name: 'StudentManagement',
          component: () => import('@/components/views/inst-admin/StudentManagement.vue')
        },
        // 教师管理
        {
          path: 'teachers',
          name: 'TeacherManagement',
          component: () => import('@/components/views/inst-admin/TeacherManagement.vue')
        },
        // 答辩管理
        {
          path: 'defense',
          name: 'DefenseYearManagement',
          component: () => import('@/components/views/inst-admin/DefenseYearManagement.vue')
        },
        {
          path: 'signature-upload',
          name: 'InstAdminSignature-upload',
          component: () => import('@/components/common/SignatureUpload.vue')
        },
        {
          path: 'passwordModify',
          name: 'InstAdminPasswordModify',
          component: () => import('@/components/common/passwordModify.vue')
        }
      ]
    },

    // 答辩组长
    {
      path: '/defense-leader',
      name: 'DefenseLeaderDashboard',
      component: () => import('@/components/views/teacher/Dashboard.vue'),
      children: [
        {
          path: '',
          name: 'DefenseLeaderHome',
          component: () => import('@/components/views/teacher/Dashboard.vue')
        },
        {
          path: 'groupDefense',
          name: 'TeacherGroupDefense',
          component: () => import('@/components/views/defense-leader/GroupDefense.vue')
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
          component: () => import('@/components/views/teacher/StudentList.vue')
        },
        {
          path: 'studentList',
          name: 'TeacherStudentList',
          component: () => import('@/components/views/teacher/StudentList.vue')
        },
        {
          path: 'reviewStudent',
          name: 'TeacherReviewStudent',
          component: () => import('@/components/views/teacher/ReviewStudent.vue')
        },
          {
            path: 'passwordModify',
            name: 'TeacherPasswordModify',
            component: () => import('@/components/common/passwordModify.vue')
          },
          {
            path: 'signature-upload',
            name: 'TeacherSignature-upload',
            component: () => import('@/components/common/SignatureUpload.vue')
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

  //静态资源路径直接放行
  const isStaticResource = to.path.startsWith('/uploads/') ||
      to.path.startsWith('/signatures/') ||
      to.path.startsWith('/static/') ||
      to.path.startsWith('/assets/') ||
      to.path.startsWith('/api/uploads/')

  if (isStaticResource) {
    console.log('访问静态资源，直接放行:', to.path)
    next()
    return
  }

  // 如果是访问登录页且已登录，根据用户类型跳转到对应首页
  if (isAuthenticated && to.name === 'login') {
    console.log('已登录用户访问登录页，跳转到对应首页，userType:', userType)

    switch (userType) {
      case 'admin':
        next({name: 'SuperAdminHome'})
        break
      case 'instAdmin':
        next({name: 'InstAdminHome'})
        break
      case 'defenseLeader':
        next({name: 'DefenseLeaderHome'})
        break
      case 'teacher':
        next({name: 'TeacherHome'})
        break
      default:
        // 如果 userType 未知，清除登录状态重新登录
        localStorage.clear()
        next({name: 'login'})
    }
    return
  }



  // 如果是未登录状态访问需要登录的页面
  if (!isAuthenticated && to.name !== 'login') {
    console.log('未登录，跳转到登录页，目标路径:', to.path)
    next({name: 'login'})
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
            next({name: 'SuperAdminHome'})
            return
          }
          break
        case 'instAdmin':
          if (to.path !== '/inst-admin') {
            next({name: 'InstAdminHome'})
            return
          }
          break
        case 'defenseLeader':
          if (to.path !== '/teacher') {
            next({name: 'TeacherHome'})
            return
          }
          break
        case 'teacher':
          if (to.path !== '/teacher') {
            next({name: 'TeacherHome'})
            return
          }
          break
      }
    }

    // 检查用户是否有访问修改密码页面的权限
    if (to.path === '/passwordModify') {
      // 所有已登录用户都可以访问修改密码页面
      console.log('已登录用户访问修改密码页面，userType:', userType)
      next()
      return
    }

    // 检查用户是否有访问模板管理页面的权限
    if (to.path === '/admin/template') {
      if (userType !== 'admin') {
        console.log('非超级管理员尝试访问模板管理，跳转到首页')
        switch (userType) {
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

    let hasPermission = true

    if (!hasPermission) {
      // 没有权限，跳转到对应角色的首页
      switch (userType) {
        case 'admin':
          next({name: 'SuperAdminHome'})
          break
        case 'instAdmin':
          next({name: 'InstAdminHome'})
          break
        case 'defenseLeader':
          next({name: 'DefenseLeaderHome'})
          break
        case 'teacher':
          next({name: 'TeacherHome'})
          break
      }
      return
    }
  }

  next()
})

export default router
