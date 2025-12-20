import { ComponentCustomProperties } from 'vue'
import { AxiosStatic } from 'axios'
import { ElMessage } from 'element-plus'
import { Router } from 'vue-router'

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $axios: AxiosStatic;
        $message: typeof ElMessage;
        $router: Router;
    }
}

