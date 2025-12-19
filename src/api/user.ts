
import { get, post, put, patch, del } from './index'

// 用户相关 API
export const userApi = {
  // 登录
  login: (data: { username: string; password: string }) => {
    return post('/api/login', data)
  },

  // 带年份登录
  loginWithYear: (data: { username: string; password: string; year: number }) => {
    return post('/api/loginWithYear', data)
  },

  // 登出
  logout: () => {
    return post('/api/logout')
  },

  // 获取答辩年份
  getDefenseYears: () => {
    return get('/api/defenseYears')
  },

  // 修改密码
  changePassword: (data: { userId: string; oldPassword: string; newPassword: string }) => {
    return post('/api/changePassword', data)
  },

  // 获取用户信息
  getUserInfo: () => {
    return get('/user/info')
  },
  //获取管理员数量
  getAdminCount() {
    return get('/admin/count')
  },
  // 创建院系管理员
  createInstituteAdmin: (data: any) => {
    return post('/admin/institute', data)
  },

  // 获取院系管理员列表
  getInstituteAdmins: (params?: any) => {
    return get('/admin/institute/list', params)
  },

  // 获取管理员详情
  getAdminDetail: (id: number) => {
    return get(`/admin/institute/${id}`)
  },

  // 更新管理员信息
  updateAdmin: (id: number, data: any) => {
    return put(`/admin/institute/${id}`, data)
  },

  // 重置密码
  resetPassword: (id: number) => {
    return post(`/admin/institute/${id}/reset-password`)
  },

  // 启用/禁用管理员
  toggleAdminStatus: (id: number, status: string) => {
    return patch(`/admin/institute/${id}/status`, { status })
  },

  // 删除管理员
  deleteAdmin: (id: number) => {
    return del(`/admin/institute/${id}`)
  },

  // 检查用户名是否可用
  checkUsername: (username: string) => {
    return get('/user/check-username', { username })
  },
  getTeacherCount: ()=>{
    return get<number>('/teacher/count')
  }
}
