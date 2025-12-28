import axios from 'axios';
import { ElMessage } from 'element-plus';

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
    // 处理后端返回的数据格式
    if (response.data && typeof response.data === 'object') {
      if (response.data.code === 200) {
        return response.data;
      } else {
        ElMessage.error(response.data.message || '上传失败');
        return Promise.reject(response.data);
      }
    }
    return response.data;
  },
  error => {
    if (error.response) {
      ElMessage.error(`上传失败: ${error.response.data?.message || error.response.statusText}`);
    } else if (error.request) {
      ElMessage.error('网络错误，请检查网络连接');
    } else {
      ElMessage.error(`上传错误: ${error.message}`);
    }
    return Promise.reject(error);
  }
);

// 模板上传
export const uploadTemplate = (file: File, templateId: number, userId: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('templateId', templateId.toString());
  formData.append('userId', userId);
  console.log('上传模板参数:', { templateId, userId, fileName: file.name });

  // 使用正确的API路径
  return uploadInstance.post('/templates/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/// 验证模板占位符
 export const validateTemplate = (file: File, templateId: number) => {
   const formData = new FormData();
   formData.append('file', file);
   formData.append('templateId', templateId.toString());
   console.log('验证模板参数:', { templateId, fileName: file.name });

   return uploadInstance.post('/templates/validate', formData, {
     headers: {
       'Content-Type': 'multipart/form-data'
     }
   });
 };

// 上传签名
export const uploadSignature = (file: File, userId: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId);
  return uploadInstance.post('/signature/upload', formData);
};

// 导出默认实例
export default uploadInstance;