import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import axios from 'axios'
import 'element-plus/dist/index.css'
const app = createApp(App)

axios.defaults.baseURL = 'http://localhost:8081'
app.config.globalProperties.$axios = axios

app.use(ElementPlus)
app.use(router)

app.mount('#app')

export default app
