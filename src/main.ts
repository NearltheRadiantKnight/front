import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import axios from 'axios'
import 'element-plus/dist/index.css'
//import httpPlugin from './plugins/http.ts'
const app = createApp(App)

app.use(ElementPlus)
app.use(router)
//app.use(httpPlugin)

app.mount('#app')

export default app
