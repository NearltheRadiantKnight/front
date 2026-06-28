// template.ts (新增)
import { get, post, del } from './index';
import { uploadTemplate, validateTemplate } from './upload';

export const templateApi = {
  // 获取模板列表
  getTemplates: () => {
    return get('/templates');
  },

  // 上传模板
  uploadTemplate: (file: File, templateId: number, userId: string) => {
    return uploadTemplate(file, templateId, userId);
  },

  // 验证模板
  validateTemplate: (file: File, templateId: number) => {
    return validateTemplate(file, templateId);
  },

  // 删除模板
  deleteTemplate: (templateId: number) => {
    return del(`/templates/${templateId}`);
  },

  // 下载模板
  downloadTemplate: (templateId: number) => {
    // 注意：下载文件需要特殊处理
    const token = localStorage.getItem('token');
    const baseURL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
    const url = `${baseURL}/templates/download/${templateId}`;
    if (token) {
      return `${url}?token=${encodeURIComponent(token)}`;
    }
    return url;
  },

  // 保存日期配置
  saveDateConfig: (defenseDate: string, evaluationDate: string) => {
    return post('/templates/date-config/save', { defenseDate, evaluationDate });
  },

  // 获取日期配置
  getDateConfig: () => {
    return get('/templates/date-config');
  },

  // 应用日期到所有模板
  applyDatesToAllTemplates: (defenseDate: string, evaluationDate: string) => {
    return post('/templates/apply-dates', { defenseDate, evaluationDate });
  }
};
