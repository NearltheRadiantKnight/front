import type { App } from 'vue';
import http from '@/api/http';
import { uploadTemplate, validateTemplate } from '@/api/upload';

export default {
  install: (app: App) => {
    // 注册到全局属性
    app.config.globalProperties.$http = http;
    app.config.globalProperties.$upload = {
      uploadTemplate,
      validateTemplate
    };

    // 也添加到 provide/inject
    app.provide('$http', http);
    app.provide('$upload', { uploadTemplate, validateTemplate });
  }
};