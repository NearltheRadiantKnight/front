
import { get, post, put, del } from './index'

// 院系相关 API
export const instituteApi = {
  getInstituteCount:()=> {
    return get('/institute/count')
  },
  // 获取院系列表
  getInstitutes: (params?: any) => {
    return get('/institute/list', params)
  },

  // 获取所有院系（不分页）
  getAllInstitutes: () => {
    return get('/institute/all')
  },

  // 创建院系
  createInstitute: (data: any) => {
    return post('/institute', data)
  },

  // 获取院系详情
  getInstituteDetail: (id: number) => {
    return get(`/institute/${id}`)
  },

  // 更新院系
  updateInstitute: (id: number, data: any) => {
    return put(`/institute/${id}`, data)
  },

  // 删除院系
  deleteInstitute: (id: number) => {
    return del(`/institute/${id}`)
  },

  // 检查院系名称是否可用
  checkInstituteName: (name: string) => {
    return get('/institute/check-name', { name })
  }
}
