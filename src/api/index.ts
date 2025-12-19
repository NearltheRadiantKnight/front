import axios, {type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',  // 修改为8080
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从本地存储获取 token
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 如果是 GET 请求，添加时间戳防止缓存
    if (config.method?.toLowerCase() === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data, config } = response

    return data;
  },
  (error) => {
    // 网络错误或服务器错误
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 400:
          ElMessage.error(data?.message || '请求参数错误')
          break
        case 401:
          ElMessage.error('登录已过期，请重新登录')
          // 清除 token 并跳转到登录页
          localStorage.removeItem('token')
          sessionStorage.removeItem('token')
          localStorage.removeItem('userRole')
          sessionStorage.removeItem('userRole')
          window.location.href = '/'
          break
        case 403:
          ElMessage.error('没有权限访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(data?.message || '网络错误')
      }
    } else if (error.request) {
      // 请求发送成功但没有收到响应
      ElMessage.error('网络连接异常，请检查网络')
    } else {
      // 请求配置错误
      ElMessage.error('请求配置错误')
    }

    return Promise.reject(error)
  }
)

export default request

// 通用 GET 请求
export const get = <T>(url: string, params?: any): Promise<T> => {
  return request.get(url, { params })
}

// 通用 POST 请求
export const post = <T>(url: string, data?: any): Promise<T> => {
  return request.post(url, data)
}

// 通用 PUT 请求
export const put = <T>(url: string, data?: any): Promise<T> => {
  return request.put(url, data)
}

// 通用 DELETE 请求
export const del = <T>(url: string, params?: any): Promise<T> => {
  return request.delete(url, { params })
}

// 通用 PATCH 请求
export const patch = <T>(url: string, data?: any): Promise<T> => {
  return request.patch(url, data)
}
