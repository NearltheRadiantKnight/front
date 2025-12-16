import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: ()=>import('@/components/common/login.vue')
    },
    {
         path: '/superAdminDashboard',
         name: 'SuperAdminDashboard',
         component: () => import('@/components/views/super-admin/Dashboard.vue')
       },
       {
         path: '/instAdminDashboard',
         name: 'InstAdminDashboard',
         component: () => import('@/components/views/inst-admin/Dashboard.vue')
       },
       {
         path: '/defenseLeaderDashboard',
         name: 'DefenseLeaderDashboard',
         component: () => import('@/components/views/defense-leader/Dashboard.vue')
       },
       {
         path: '/teacherDashboard',
         name: 'TeacherDashboard',
         component: () => import('@/components/views/teacher/Dashboard.vue')
       }
  ],
})

export default router
