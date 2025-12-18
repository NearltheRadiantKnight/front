import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import axios from 'axios'
import 'element-plus/dist/index.css'
const app = createApp(App)

axios.defaults.baseURL = 'http://localhost:8080'

// 添加请求拦截器，处理统一响应格式
axios.interceptors.response.use(
  (response) => {
    // 如果你的后端返回的是 {code, message, data} 格式
    if (response.data && response.data.code !== undefined) {
      return response.data;
    }
    return response;
  },
  (error) => {
    console.error('API请求错误:', error);
    return Promise.reject(error);
  }
);

app.config.globalProperties.$axios = axios

app.use(ElementPlus)
app.use(router)

app.mount('#app')

export default app
