<template>
  <div class="template-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>毕业设计（论文）管理系统 - 模板管理</h1>
      <p class="subtitle">超级管理员可以在此上传和管理文档模板</p>
    </div>

    <!-- 日期设置卡片 -->
    <div class="date-config-card">
      <h2 class="section-title">
        <i class="el-icon-date"></i>
        日期设置
      </h2>
      <div class="date-config-container">
        <div class="date-group">
          <h3>答辩成绩表日期</h3>
          <p class="date-description">应用于所有答辩成绩相关表格</p>
          <div class="date-picker-group">
            <el-date-picker
              v-model="defenseDate"
              type="date"
              placeholder="选择日期"
              format="YYYY年MM月DD日"
              value-format="YYYY-MM-DD"
              size="large"
              :disabled-date="disabledDate"
            />
            <div class="date-info">
              <span class="current-label">当前设置：</span>
              <span class="current-date">{{ formatDate(defenseDate) || '未设置' }}</span>
            </div>
          </div>
        </div>

        <div class="date-group">
          <h3>成绩评定表日期</h3>
          <p class="date-description">应用于所有成绩评定相关表格</p>
          <div class="date-picker-group">
            <el-date-picker
              v-model="evaluationDate"
              type="date"
              placeholder="选择日期"
              format="YYYY年MM月DD日"
              value-format="YYYY-MM-DD"
              size="large"
              :disabled-date="disabledDate"
            />
            <div class="date-info">
              <span class="current-label">当前设置：</span>
              <span class="current-date">{{ formatDate(evaluationDate) || '未设置' }}</span>
            </div>
          </div>
        </div>

        <div class="date-actions">
          <el-button type="primary" @click="saveDates" :loading="savingDates">
            <i class="el-icon-check"></i>
            保存日期设置
          </el-button>
          <el-button @click="resetDates">
            <i class="el-icon-refresh"></i>
            重置为当前日期
          </el-button>
          <el-button
            type="success"
            @click="applyDatesToAllTemplates"
            :disabled="!defenseDate || !evaluationDate"
            :loading="applyingDates"
          >
            <i class="el-icon-finished"></i>
            应用到所有相关模板
          </el-button>
        </div>
      </div>
    </div>

    <!-- 模板管理卡片 -->
    <div class="template-management-card">
      <div class="card-header">
        <h2 class="section-title">
          <i class="el-icon-document"></i>
          文档模板管理
        </h2>
        <div class="template-count">
          共 {{ templates.length }} 个模板，其中 {{ uploadedCount }} 个已上传
        </div>
      </div>

      <!-- 模板列表 -->
      <div class="template-list">
        <div
          v-for="template in templates"
          :key="template.id"
          class="template-item"
          :class="{ 'has-template': template.hasTemplate }"
        >
          <!-- 模板信息区域 -->
          <div class="template-info">
            <div class="template-header">
              <h3 class="template-title">{{ template.name }}</h3>
              <el-tag
                :type="template.hasTemplate ? 'success' : 'warning'"
                size="small"
              >
                {{ template.hasTemplate ? '已上传' : '未上传' }}
              </el-tag>
            </div>

            <p class="template-description">{{ template.description }}</p>

            <div class="template-meta">
              <div class="meta-item">
                <i class="el-icon-time"></i>
                <span>最后更新：{{ formatUpdateTime(template) }}</span>
              </div>
              <div class="meta-item">
                <i class="el-icon-user"></i>
                <span>更新人：{{ template.updatedBy || '暂无' }}</span>
              </div>
              <div v-if="template.fileSize" class="meta-item">
                <i class="el-icon-document"></i>
                <span>文件大小：{{ formatFileSize(template.fileSize) }}</span>
              </div>
              <div class="meta-item" v-if="template.requiredPlaceholders">
                <i class="el-icon-collection-tag"></i>
                <span>必需占位符：{{ template.requiredPlaceholders.length }}个</span>
              </div>
            </div>

            <!-- 占位符预览 -->
            <el-collapse v-model="template.activePlaceholders">
              <el-collapse-item :title="`查看必需占位符（${template.requiredPlaceholders?.length || 0}个）`" :name="template.id">
                <div class="placeholders-preview">
                  <div v-for="placeholder in template.requiredPlaceholders" :key="placeholder" class="placeholder-tag">
                    <el-tag size="small" type="info">{{ placeholder }}</el-tag>
                  </div>
                  <div v-if="!template.requiredPlaceholders || template.requiredPlaceholders.length === 0" class="empty-placeholders">
                    <i class="el-icon-info"></i>
                    暂无必需占位符配置
                  </div>
                </div>
                <div class="placeholder-notice">
                  <i class="el-icon-info"></i>
                  请确保上传的Word文档中包含所有必需占位符
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>

          <!-- 模板操作区域 -->
          <div class="template-actions-container">
            <div class="template-actions">
              <div class="button-group">
                <template v-if="template.hasTemplate">
                  <el-button
                    class="template-button"
                    type="success"
                    @click="downloadTemplate(template)"
                    size="small"
                  >
                    <i class="el-icon-download"></i>
                    下载
                  </el-button>
                </template>

                <!-- 上传/更新按钮 -->
                <el-upload
                  class="upload-button-wrapper"
                  :action="uploadApi"
                  :headers="uploadHeaders"
                  :data="{ templateId: template.id }"
                  :show-file-list="false"
                  :before-upload="(file) => beforeTemplateUpload(file, template)"
                  :on-success="(res) => onUploadSuccess(res, template)"
                  :on-error="onUploadError"
                  accept=".doc,.docx"
                  :disabled="uploadingTemplate === template.id"
                >
                  <el-button
                    class="template-button"
                    :type="template.hasTemplate ? 'primary' : 'primary'"
                    :loading="uploadingTemplate === template.id"
                    size="small"
                  >
                    <i class="el-icon-upload"></i>
                    {{ template.hasTemplate ? '更新' : '上传' }}
                  </el-button>
                </el-upload>

                <!-- 删除按钮 -->
                <el-button
                  v-if="template.hasTemplate"
                  class="template-button"
                  type="danger"
                  @click="deleteTemplate(template)"
                  size="small"
                  :loading="deletingTemplate === template.id"
                >
                  <i class="el-icon-delete"></i>
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 占位符帮助 -->
    <div class="placeholder-help">
      <h3><i class="el-icon-info"></i> 占位符使用说明</h3>
      <div class="help-content">
        <p>在Word模板中使用以下格式插入占位符：</p>
        <div class="placeholder-examples">
          <div class="example-group">
            <h4>方案A：双花括号格式（推荐）</h4>
            <code v-text="'{{student_name}}'"></code>
            <code v-text="'{{student_id}}'"></code>
            <code v-text="'{{date_year}}'"></code>
            <code v-text="'{{signature_judge}}'"></code>
          </div>
          <div class="example-group">
            <h4>方案B：美元符号格式</h4>
            <code v-text="'${student_name}'"></code>
            <code v-text="'${student_id}'"></code>
            <code v-text="'${year}'"></code>
            <code v-text="'${signature_judge}'"></code>
          </div>
        </div>
        <p class="help-tip">
          <i class="el-icon-warning"></i>
          系统会自动验证模板中是否包含所有必需的占位符。签名位置请使用图片占位符。
        </p>
      </div>
    </div>

    <!-- 上传进度对话框 -->
    <el-dialog
      title="上传中"
      :visible.sync="showUploadDialog"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="upload-progress">
        <el-progress
          :percentage="uploadPercentage"
          :status="uploadStatus"
          :stroke-width="16"
        />
        <p class="upload-message">{{ uploadMessage }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { uploadTemplate, validateTemplate } from '@/api/upload'
import { templateApi } from '@/api/template'

export default {
  name: 'TemplateManagement',

  data() {
    // 创建HTTP实例的函数 - 修复版
    const createHttpInstance = () => {
      // 使用固定的开发环境URL
      const baseURL = 'http://localhost:8080';
      console.log('使用基础URL:', baseURL);

      const instance = axios.create({
        baseURL: baseURL,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // 添加请求拦截器
      instance.interceptors.request.use(config => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('请求配置:', config.method, config.url);
        return config;
      });

      // 添加响应拦截器
      instance.interceptors.response.use(
        response => {
          console.log('响应成功:', response.config.url, response.data);
          return response.data;
        },
        error => {
          console.error('请求错误:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data
          });

          if (error.response) {
            const status = error.response.status;
            if (status === 404) {
              console.warn('API不存在，使用默认数据');
            } else if (status === 500) {
              console.error('服务器内部错误:', error.response.data);
            } else {
              ElMessage.error(`请求失败: ${status}`);
            }
          } else if (error.request) {
            console.error('网络错误，请求未发送');
          } else {
            console.error('请求配置错误:', error.message);
          }
          return Promise.reject(error);
        }
      );

      return instance;
    };

    return {
      // HTTP实例
      http: createHttpInstance(),

      // 日期设置
      defenseDate: '',
      evaluationDate: '',
      savingDates: false,
      applyingDates: false,

      // 模板数据
      templates: [],
      uploadingTemplate: null,
      deletingTemplate: null,

      // 上传相关
      uploadApi: 'http://localhost:8080/api/templates/upload', // 完整URL
      uploadHeaders: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`
      },

      // 上传进度
      showUploadDialog: false,
      uploadPercentage: 0,
      uploadStatus: '',
      uploadMessage: '正在上传...'
    }
  },

  computed: {
    uploadedCount() {
      return this.templates.filter(t => t.hasTemplate).length;
    }
  },

  created() {
    console.log('TemplateManagement组件创建');
    this.loadDates();
    this.loadTemplates();
  },

  methods: {
    // 加载日期设置 - 简化版
    async loadDates() {
      try {
        console.log('正在加载日期设置...');

        // 使用 templateApi 获取日期配置
        try {
          const response = await templateApi.getDateConfig();
          console.log('日期设置响应:', response);

          if (response && response.code === 200 && response.data) {
            this.defenseDate = response.data.defense_date || '';
            this.evaluationDate = response.data.evaluation_date || '';
            console.log('从后端加载日期成功');
          } else {
            this.setDefaultDates();
          }
        } catch (error) {
          console.log('后端日期加载失败，使用默认日期:', error.message);
          this.setDefaultDates();
        }

      } catch (error) {
        console.error('加载日期设置失败:', error);
        this.setDefaultDates();
      }
    },

    // 新增辅助方法
    setDefaultDates() {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      this.defenseDate = todayStr;
      this.evaluationDate = todayStr;
      console.log('使用默认日期:', todayStr);
    },

    // 保存日期设置
    async saveDates() {
      try {
        this.savingDates = true;
        console.log('保存日期:', {
          defenseDate: this.defenseDate,
          evaluationDate: this.evaluationDate
        });

        // 使用 templateApi 保存日期配置
        const response = await templateApi.saveDateConfig(this.defenseDate, this.evaluationDate);
        console.log('保存日期响应:', response);

        if (response && response.code === 200) {
          ElMessage.success('日期设置保存成功');
        } else {
          ElMessage.error(response?.message || '保存失败');
        }
      } catch (error) {
        console.error('保存日期设置失败:', error);
        ElMessage.error('保存失败: ' + (error.message || '网络错误'));
      } finally {
        this.savingDates = false;
      }
    },

    // 重置日期为当前日期
    async resetDates() {
      try {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        this.defenseDate = todayStr;
        this.evaluationDate = todayStr;
        ElMessage.success('日期已重置为当前日期');

        // 可选：保存到后端
        // await this.saveDates();
      } catch (error) {
        console.error('重置日期失败:', error);
        ElMessage.error('重置失败');
      }
    },

    // 应用到所有模板
    async applyDatesToAllTemplates() {
      try {
        this.applyingDates = true;
        console.log('应用日期到模板:', {
          defenseDate: this.defenseDate,
          evaluationDate: this.evaluationDate
        });

        // 使用 templateApi 应用日期
        const response = await templateApi.applyDatesToAllTemplates(
          this.defenseDate,
          this.evaluationDate
        );
        console.log('应用日期响应:', response);

        if (response.code === 200) {
          ElMessage.success('日期已应用到所有相关模板');
        } else {
          ElMessage.error(response.message || '应用失败');
        }
      } catch (error) {
        console.error('应用日期失败:', error);
        ElMessage.error('应用失败: ' + (error.message || '网络错误'));
      } finally {
        this.applyingDates = false;
      }
    },

    formatDate(date) {
      if (!date) return '';
      try {
        const d = new Date(date);
        return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
      } catch (e) {
        return date;
      }
    },

    // 格式化更新时间
    formatUpdateTime(template) {
      if (template.updatedAt) {
        try {
          const date = new Date(template.updatedAt);
          return date.toLocaleString('zh-CN');
        } catch (e) {
          return template.updatedAt;
        }
      }
      return '暂无';
    },

    disabledDate(time) {
      return time.getTime() > Date.now();
    },

    // 加载模板数据
    async loadTemplates() {
      try {
        console.log('正在加载模板数据...');

        // 使用 templateApi 获取模板列表
        const response = await templateApi.getTemplates();
        console.log('完整的模板响应:', response);

        if (response && response.code === 200 && response.data) {
          console.log('模板数据详情:');
          response.data.forEach((template, index) => {
            console.log(`模板 ${index + 1} (${template.name}):`, {
              id: template.id,
              name: template.name,
              placeholderKeys: template.placeholderKeys,
              placeholderKeys类型: typeof template.placeholderKeys,
              placeholderKeys长度: template.placeholderKeys?.length,
              rawData: template
            });
          });

          this.templates = response.data.map(template => {
            const processedTemplate = {
              ...template,
              activePlaceholders: [],
              // 调试占位符处理
              _debug: {
                rawKeys: template.placeholderKeys,
                rawType: typeof template.placeholderKeys
              }
            };

            // 处理占位符字符串
            let placeholders = [];

            if (template.placeholderKeys) {
              console.log(`处理模板 ${template.name} 的占位符:`, template.placeholderKeys);

              // 尝试不同分隔符处理
              if (typeof template.placeholderKeys === 'string') {
                // 方法1: 尝试逗号分隔
                placeholders = template.placeholderKeys.split(',').filter(p => p && p.trim());

                if (placeholders.length === 0) {
                  // 方法2: 尝试分号分隔
                  placeholders = template.placeholderKeys.split(';').filter(p => p && p.trim());
                }

                if (placeholders.length === 0 && template.placeholderKeys.includes('{')) {
                  // 方法3: 如果包含花括号，尝试解析为JSON数组
                  try {
                    const parsed = JSON.parse(template.placeholderKeys);
                    if (Array.isArray(parsed)) {
                      placeholders = parsed;
                    }
                  } catch (e) {
                    // 不是JSON格式
                  }
                }
              } else if (Array.isArray(template.placeholderKeys)) {
                // 如果已经是数组，直接使用
                placeholders = template.placeholderKeys;
              }

              console.log(`处理后占位符:`, placeholders);
            }

            processedTemplate.requiredPlaceholders = placeholders;
            return processedTemplate;
          });

          console.log('处理后的模板列表:', this.templates);
          console.log('加载模板成功，共', this.templates.length, '个模板');
        } else {
          console.warn('模板响应格式异常，使用默认模板:', response);
          this.loadDefaultTemplates();
        }
      } catch (error) {
        console.error('加载模板失败:', error);
        this.loadDefaultTemplates();
      }
    },

    loadDefaultTemplates() {
      console.log('使用默认模板数据');
      this.templates = [
        {
          id: 1,
          name: '本科毕业设计答辩成绩表',
          description: '用于记录毕业设计答辩成绩的表格',
          type: 1,
          hasTemplate: false,
          requiredPlaceholders: [
            '{{student_name}}', '{{student_id}}', '{{date_year}}',
            '{{date_month}}', '{{date_day}}', '{{thesis_title}}',
            '{{design_quality_score1}}', '{{design_quality_score2}}',
            '{{design_quality_score3}}', '{{defense_report_score}}',
            '{{response_score1}}', '{{response_score2}}', '{{total_score}}',
            '{{signature_judge}}'
          ],
          updatedAt: null,
          updatedBy: null,
          fileSize: null,
          activePlaceholders: []
        },
        {
          id: 2,
          name: '本科毕业设计成绩评定表',
          description: '用于评定毕业设计成绩的表格',
          type: 2,
          hasTemplate: false,
          requiredPlaceholders: [
            '{{student_name}}', '{{student_id}}', '{{date_year}}',
            '{{date_month}}', '{{date_day}}', '{{thesis_title}}',
            '{{advisor_score}}', '{{reviewer_score}}', '{{defense_score}}',
            '{{advisor_calculated}}', '{{reviewer_calculated}}',
            '{{defense_calculated}}', '{{final_score}}',
            '{{signature_department_head}}'
          ],
          updatedAt: null,
          updatedBy: null,
          fileSize: null,
          activePlaceholders: []
        },
        {
          id: 3,
          name: '本科毕业论文答辩成绩表',
          description: '用于记录毕业论文答辩成绩的表格',
          type: 3,
          hasTemplate: false,
          requiredPlaceholders: [
            '{{student_name}}', '{{student_id}}', '{{date_year}}',
            '{{date_month}}', '{{date_day}}', '{{thesis_title}}',
            '{{paper_quality_score}}', '{{defense_report_score}}',
            '{{response_score}}', '{{total_score}}', '{{defense_comment}}',
            '{{signature_group_leader}}'
          ],
          updatedAt: null,
          updatedBy: null,
          fileSize: null,
          activePlaceholders: []
        },
        {
          id: 4,
          name: '本科毕业论文成绩评定表',
          description: '用于评定毕业论文成绩的表格',
          type: 4,
          hasTemplate: false,
          requiredPlaceholders: [
            '{{student_name}}', '{{student_id}}', '{{date_year}}',
            '{{date_month}}', '{{date_day}}', '{{thesis_title}}',
            '{{advisor_score}}', '{{reviewer_score}}', '{{defense_score}}',
            '{{advisor_calculated}}', '{{reviewer_calculated}}',
            '{{defense_calculated}}', '{{final_score}}',
            '{{signature_department_head}}'
          ],
          updatedAt: null,
          updatedBy: null,
          fileSize: null,
          activePlaceholders: []
        },
        {
          id: 5,
          name: '毕业论文(设计)答辩小组统分表',
          description: '答辩小组使用的统分表格',
          type: 5,
          hasTemplate: false,
          requiredPlaceholders: [
            '{{student_name}}', '{{student_id}}', '{{date_year}}',
            '{{date_month}}', '{{date_day}}', '{{thesis_title}}',
            '{{total_score}}', '{{signature_judge}}'
          ],
          updatedAt: null,
          updatedBy: null,
          fileSize: null,
          activePlaceholders: []
        },
        {
          id: 6,
          name: '毕业论文答辩成绩无评语过程表',
          description: '毕业论文答辩无评语过程记录表',
          type: 6,
          hasTemplate: false,
          requiredPlaceholders: [
            '{{student_name}}', '{{student_id}}', '{{date_year}}',
            '{{date_month}}', '{{date_day}}', '{{thesis_title}}',
            '{{paper_quality_score}}', '{{defense_report_score}}',
            '{{response_score}}', '{{total_score}}', '{{signature_judge}}'
          ],
          updatedAt: null,
          updatedBy: null,
          fileSize: null,
          activePlaceholders: []
        },
        {
          id: 7,
          name: '毕业设计答辩成绩无评语过程表',
          description: '毕业设计答辩无评语过程记录表',
          type: 7,
          hasTemplate: false,
          requiredPlaceholders: [
            '{{student_name}}', '{{student_id}}', '{{date_year}}',
            '{{date_month}}', '{{date_day}}', '{{thesis_title}}',
            '{{design_quality_score1}}', '{{design_quality_score2}}',
            '{{design_quality_score3}}', '{{defense_report_score}}',
            '{{response_score1}}', '{{response_score2}}', '{{total_score}}',
            '{{signature_judge}}'
          ],
          updatedAt: null,
          updatedBy: null,
          fileSize: null,
          activePlaceholders: []
        }
      ];
    },

    formatFileSize(bytes) {
      if (!bytes) return '0 B';
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // 上传前验证
    async beforeTemplateUpload(file, template) {
      console.log('开始上传验证，模板:', template.name, '文件:', file.name);

      // 文件大小限制（10MB）
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        ElMessage.error('文件大小不能超过10MB');
        return false;
      }

      // 文件类型验证
      const isWordFile = file.name.toLowerCase().endsWith('.doc') ||
                         file.name.toLowerCase().endsWith('.docx');
      if (!isWordFile) {
        ElMessage.error('只支持上传Word文档 (.doc/.docx)');
        return false;
      }

      // 验证占位符
      try {
        console.log('验证占位符，templateId:', template.id);

        // 使用 templateApi 验证模板
        const validateResult = await templateApi.validateTemplate(file, template.id);
        console.log('占位符验证结果:', validateResult);

        if (validateResult.code !== 200) {
          const missing = validateResult.data?.missingPlaceholders;
          if (missing && missing.length > 0) {
            ElMessage.error(`模板缺少必需占位符: ${missing.join(', ')}`);
          } else {
            ElMessage.error(validateResult.message || '模板验证失败');
          }
          return false;
        }
      } catch (error) {
        console.error('验证占位符失败:', error);
        ElMessage.error('模板验证失败: ' + (error.message || '未知错误'));
        return false;
      }

      // 获取当前用户ID
      const userInfo = localStorage.getItem('userInfo');
      let userId = '';
      if (userInfo) {
        try {
          const info = JSON.parse(userInfo);
          userId = info.id || '';
        } catch (e) {
          console.error('解析用户信息失败:', e);
          userId = 'unknown';
        }
      }

      // 开始上传
      this.uploadingTemplate = template.id;
      this.showUploadDialog = true;
      this.uploadPercentage = 0;
      this.uploadStatus = '';
      this.uploadMessage = '正在上传...';

      // 模拟上传进度
      const progressInterval = setInterval(() => {
        if (this.uploadPercentage < 90) {
          this.uploadPercentage += 10;
        }
      }, 300);

      try {
        // 使用 templateApi 上传模板
        const result = await templateApi.uploadTemplate(file, template.id, userId);
        clearInterval(progressInterval);

        this.uploadPercentage = 100;
        this.uploadStatus = 'success';
        this.uploadMessage = '上传成功';

        setTimeout(() => {
          this.showUploadDialog = false;
          if (result.code === 200) {
            ElMessage.success(`模板"${template.name}"上传成功`);
            // 重新加载模板列表
            this.loadTemplates();
          } else {
            ElMessage.error(result.message || '上传失败');
          }
          this.uploadingTemplate = null;
        }, 1000);

      } catch (error) {
        clearInterval(progressInterval);
        this.showUploadDialog = false;
        this.uploadingTemplate = null;
        ElMessage.error('上传失败: ' + (error.message || '未知错误'));
      }

      // 返回false阻止默认上传
      return false;
    },

    // 上传成功
    async onUploadSuccess(response, template) {
      console.log('上传成功响应:', response);

      this.uploadPercentage = 100;
      this.uploadStatus = 'success';
      this.uploadMessage = '上传成功';

      setTimeout(() => {
        this.showUploadDialog = false;
        if (response.code === 200) {
          ElMessage.success(`模板"${template.name}"上传成功`);
          // 重新加载模板列表
          this.loadTemplates();
        } else {
          ElMessage.error(response.message || '上传失败');
        }
      }, 1000);

      this.uploadingTemplate = null;
    },

    async onUploadError(error) {
      console.error('上传错误:', error);
      this.showUploadDialog = false;
      this.uploadingTemplate = null;
      ElMessage.error('上传失败：' + (error.message || '网络错误'));
    },

    // 下载模板
    async downloadTemplate(template) {
      try {
        // 使用 templateApi 获取下载链接
        const downloadUrl = templateApi.downloadTemplate(template.id);

        // 创建隐藏的链接元素
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', template.fileName || template.name + '.docx');
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        ElMessage.success('开始下载模板');
      } catch (error) {
        console.error('下载失败:', error);
        ElMessage.error('下载失败: ' + error.message);
      }
    },

    // 删除模板
    async deleteTemplate(template) {
      try {
        await ElMessageBox.confirm(
          `确定要删除"${template.name}"模板吗？`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        );

        this.deletingTemplate = template.id;
        console.log('删除模板:', template.id);

        // 使用 templateApi 删除模板
        const response = await templateApi.deleteTemplate(template.id);
        console.log('删除响应:', response);

        if (response.code === 200) {
          ElMessage.success('模板删除成功');
          // 重新加载模板列表
          this.loadTemplates();
        } else {
          ElMessage.error(response.message || '删除失败');
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error);
          ElMessage.error('删除失败: ' + error.message);
        }
      } finally {
        this.deletingTemplate = null;
      }
    }
  }
}
</script>

<style scoped>
.template-management {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 40px;
  text-align: center;
}

.page-header h1 {
  color: #303133;
  margin-bottom: 12px;
  font-size: 28px;
  font-weight: 600;
}

.subtitle {
  color: #909399;
  font-size: 16px;
  font-weight: 400;
}

/* 日期设置卡片样式 */
.date-config-card,
.template-management-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 32px;
  overflow: hidden;
  border: 1px solid #e4e7ed;
}

.section-title {
  padding: 24px;
  margin: 0;
  font-size: 20px;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(90deg, #f8fafc 0%, #ffffff 100%);
}

.section-title i {
  font-size: 22px;
  color: #409EFF;
}

.date-config-container {
  padding: 24px;
}

.date-group {
  margin-bottom: 28px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 10px;
  border-left: 4px solid #409EFF;
}

.date-group h3 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.date-description {
  margin: 0 0 18px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.date-picker-group {
  display: flex;
  gap: 24px;
  align-items: center;
  flex-wrap: wrap;
}

.date-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f0f9ff;
  border-radius: 8px;
  border: 1px solid #d9ecff;
}

.current-label {
  color: #409EFF;
  font-size: 14px;
  font-weight: 500;
}

.current-date {
  color: #409EFF;
  font-weight: 600;
  font-size: 15px;
}

.date-actions {
  display: flex;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}

/* 模板管理卡片样式 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #ebeef5;
  background: linear-gradient(90deg, #f8fafc 0%, #ffffff 100%);
}

.template-count {
  color: #909399;
  font-size: 14px;
}

.template-list {
  padding: 0 24px 24px;
}

.template-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  border: 1px solid #e4e7ed;
  border-radius: 10px;
  margin-top: 20px;
  transition: all 0.3s ease;
  background: #fff;
  gap: 32px;
}

.template-item:hover {
  border-color: #409EFF;
  box-shadow: 0 6px 25px rgba(64, 158, 255, 0.12);
  transform: translateY(-2px);
}

.template-item.has-template {
  background: linear-gradient(135deg, #f0f9ff 0%, #f8fdff 100%);
  border-color: #d9ecff;
}

.template-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  max-width: 800px;
}

.template-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.template-title {
  margin: 0;
  font-size: 18px;
  color: #303133;
  font-weight: 600;
  line-height: 1.4;
}

.template-description {
  margin: 0 0 20px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  flex-grow: 1;
}

.template-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #909399;
  padding: 6px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  white-space: nowrap;
}

.meta-item i {
  font-size: 14px;
  color: #409EFF;
}

/* 占位符预览区域 */
.placeholders-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  margin-top: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.placeholder-tag {
  flex: 0 0 auto;
}

.placeholder-tag .el-tag {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 4px;
  background: #fff;
  border: 1px solid #dcdfe6;
  margin: 2px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-placeholders {
  text-align: center;
  padding: 20px;
  color: #909399;
  font-size: 14px;
  width: 100%;
}

.empty-placeholders i {
  font-size: 24px;
  margin-bottom: 10px;
  color: #c0c4cc;
}

.placeholder-notice {
  background: #f0f9ff;
  border: 1px solid #d9ecff;
  border-radius: 6px;
  padding: 12px;
  margin-top: 10px;
  color: #409EFF;
  font-size: 13px;
}

.placeholder-notice i {
  margin-right: 8px;
}

/* 展开/收起样式 */
.el-collapse-item__header {
  font-weight: 600;
  color: #409EFF;
}

.el-collapse-item__header i {
  transition: transform 0.3s;
}

.el-collapse-item__wrap {
  background-color: transparent;
}

.template-actions-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 520px;
  padding-left: 20px;
  border-left: 1px solid #f0f0f0;
}

.template-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: flex-end;
}

.template-button {
  width: 120px !important;
  height: 40px !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  border-radius: 6px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 12px !important;
  margin: 0 !important;
  min-width: 120px !important;
}

.template-button i {
  font-size: 14px;
  margin-right: 6px;
}

.upload-button-wrapper {
  display: inline-block;
}

.upload-button-wrapper .el-button {
  width: 120px !important;
  height: 40px !important;
}

/* 占位符帮助 */
.placeholder-help {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 28px;
  margin-top: 32px;
  border: 1px solid #e4e7ed;
}

.placeholder-help h3 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
}

.placeholder-help h3 i {
  color: #409EFF;
  font-size: 22px;
}

.help-content {
  color: #606266;
  font-size: 15px;
  line-height: 1.7;
}

.placeholder-examples {
  display: flex;
  gap: 40px;
  margin: 20px 0;
}

.example-group {
  flex: 1;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.example-group h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.example-group code {
  display: block;
  background: #fff;
  padding: 12px 16px;
  margin: 8px 0;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  color: #e96900;
  font-size: 14px;
  border: 1px solid #e4e7ed;
}

.help-tip {
  background: linear-gradient(90deg, #f0f9ff 0%, #e6f7ff 100%);
  border-left: 4px solid #409EFF;
  padding: 16px;
  margin-top: 20px;
  border-radius: 6px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.help-tip i {
  color: #409EFF;
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.help-tip p {
  margin: 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

/* 上传进度对话框 */
.upload-progress {
  text-align: center;
  padding: 20px 0;
}

.upload-message {
  margin-top: 15px;
  color: #606266;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .template-management {
    max-width: 100%;
    padding: 20px;
  }

  .template-item {
    flex-direction: column;
    gap: 24px;
  }

  .template-actions-container {
    min-width: 100%;
    padding-left: 0;
    border-left: none;
    border-top: 1px solid #f0f0f0;
    padding-top: 20px;
  }

  .button-group {
    justify-content: flex-start;
    gap: 10px;
  }
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 24px;
  }

  .template-item {
    padding: 20px;
  }

  .placeholders-preview {
    max-height: 150px;
  }

  .placeholder-tag .el-tag {
    font-size: 11px;
    padding: 3px 8px;
    max-width: 150px;
  }

  .button-group {
    flex-direction: column;
    gap: 10px;
  }

  .template-button {
    width: 100% !important;
  }

  .upload-button-wrapper .el-button {
    width: 100% !important;
  }

  .template-meta {
    flex-direction: column;
    gap: 12px;
  }

  .meta-item {
    width: 100%;
  }

  .date-picker-group {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .placeholder-examples {
    flex-direction: column;
    gap: 20px;
  }
}

@media (max-width: 480px) {
  .template-management {
    padding: 16px;
  }

  .card-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .date-actions {
    flex-direction: column;
  }

  .date-group {
    padding: 16px;
  }
}
</style>