import axios from 'axios';

// 创建专门用于上传的 axios 实例
const uploadInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

// 请求拦截器
uploadInstance.interceptors.request.use(
    config => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    }
);

// 响应拦截器
uploadInstance.interceptors.response.use(
    response => {
      return response.data;
    },
    error => {
      return Promise.reject(error);
    }
);

// 上传签名
export const uploadSignature = (file: File, userId: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId);
  return uploadInstance.post('/signature/upload', formData);
};