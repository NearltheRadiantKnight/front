<template>
  <div class="ai-config-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>AI评语生成配置管理</h1>
      <p class="subtitle">配置QWEN大语言模型API和评语生成提示词模板</p>
    </div>

    <!-- API配置卡片 -->
    <div class="api-config-card">
      <h2 class="section-title">
        <i class="el-icon-key"></i>
        QWEN大语言模型配置
      </h2>

      <div class="config-content">
        <el-form
            :model="aiConfig"
            ref="aiConfigForm"
            label-width="180px"
            :rules="apiRules"
            class="config-form"
        >
          <!-- API Key -->
          <el-form-item label="API Key" prop="apiKey">
            <el-input
                v-model="aiConfig.apiKey"
                type="password"
                show-password
                placeholder="请输入QWEN API Key"
                size="large"
                style="width: 500px;"
            >
              <template #append>
                <el-button
                    @click="testApiKey"
                    :loading="testingApi"
                    size="small"
                    type="primary"
                >
                  测试连接
                </el-button>
              </template>
            </el-input>
            <div class="form-tip">
              <i class="el-icon-info"></i>
              请前往
              <el-link
                  href="https://dashscope.aliyun.com/"
                  target="_blank"
                  type="primary"
              >
                阿里云百炼平台
              </el-link>
              获取API Key
            </div>
          </el-form-item>

          <!-- API端点 -->
          <el-form-item label="API端点" prop="apiEndpoint">
            <el-input
                v-model="aiConfig.apiEndpoint"
                placeholder="https://dashscope.aliyun.com/api/v1/services/aigc/text-generation/generation"
                size="large"
                style="width: 500px;"
            />
          </el-form-item>

          <!-- 模型选择 -->
          <el-form-item label="模型名称" prop="modelName">
            <el-select
                v-model="aiConfig.modelName"
                placeholder="请选择QWEN模型"
                size="large"
                style="width: 300px;"
            >
              <el-option label="QWEN-TURBO（性价比高）" value="qwen-turbo" />
              <el-option label="QWEN-PLUS（平衡性能）" value="qwen-plus" />
              <el-option label="QWEN-MAX（最强性能）" value="qwen-max" />
              <el-option label="QWEN-LONG（长文本）" value="qwen-long" />
            </el-select>
          </el-form-item>

          <!-- 温度参数 -->
          <el-form-item label="温度参数" prop="temperature">
            <el-slider
                v-model="aiConfig.temperature"
                :min="0"
                :max="1"
                :step="0.1"
                style="width: 300px;"
                show-input
            />
            <div class="form-tip">
              <i class="el-icon-info"></i>
              值越高生成内容越随机，越低越确定（推荐0.7-0.8）
            </div>
          </el-form-item>

          <!-- 最大生成长度 -->
          <el-form-item label="最大生成长度" prop="maxTokens">
            <el-input-number
                v-model="aiConfig.maxTokens"
                :min="100"
                :max="2000"
                :step="100"
                size="large"
            />
            <span class="unit">tokens</span>
            <div class="form-tip">
              <i class="el-icon-info"></i>
              控制生成评语的最大长度（建议300-500）
            </div>
          </el-form-item>

          <!-- 表单操作 -->
          <el-form-item>
            <el-button
                type="primary"
                @click="saveApiConfig"
                :loading="savingApiConfig"
                size="large"
            >
              <i class="el-icon-check"></i>
              保存API配置
            </el-button>
            <el-button
                @click="resetApiConfig"
                size="large"
            >
              <i class="el-icon-refresh"></i>
              重置配置
            </el-button>
          </el-form-item>
        </el-form>

        <!-- API状态显示 -->
        <div class="api-status" v-if="apiStatus">
          <div class="status-card" :class="apiStatus.type">
            <h3><i :class="apiStatus.icon"></i> {{ apiStatus.title }}</h3>
            <p>{{ apiStatus.message }}</p>
            <div v-if="apiStatus.details" class="status-details">
              <p><strong>模型：</strong>{{ apiStatus.details.model }}</p>
              <p><strong>延迟：</strong>{{ apiStatus.details.latency }}ms</p>
              <p><strong>测试时间：</strong>{{ apiStatus.details.time }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 评语提示词模板配置 -->
    <div class="prompt-config-card">
      <h2 class="section-title">
        <i class="el-icon-chat-line-round"></i>
        评语提示词模板配置
      </h2>

      <!-- 毕业论文评语模板 -->
      <div class="prompt-section">
        <div class="section-header">
          <h3>本科毕业论文答辩小组评语模板</h3>
          <div class="header-actions">
            <el-button
                size="small"
                @click="previewComment('thesis')"
                :loading="previewingThesis"
            >
              <i class="el-icon-view"></i>
              预览生成效果
            </el-button>
            <el-button
                type="success"
                size="small"
                @click="savePrompt('thesis')"
                :loading="savingThesisPrompt"
            >
              <i class="el-icon-check"></i>
              保存模板
            </el-button>
          </div>
        </div>

        <div class="prompt-editor">
          <el-input
              v-model="prompts.thesisCommentPrompt"
              type="textarea"
              :rows="12"
              placeholder="请输入毕业论文评语生成提示词..."
              maxlength="2000"
              show-word-limit
              class="prompt-textarea"
          />
        </div>

        <!-- 可用变量提示 -->
        <div class="variable-hint">
          <h4><i class="el-icon-collection-tag"></i> 可用变量</h4>
          <div class="variables-grid">
            <el-tag
                v-for="varName in availableVariables"
                :key="varName"
                class="variable-tag"
                @click="insertVariable(varName, 'thesis')"
            >
              {{ varName }}
            </el-tag>
          </div>
          <p class="hint-text">
            点击变量可插入到提示词中，系统会自动替换为实际值
          </p>
        </div>
      </div>

      <!-- 毕业设计评语模板 -->
      <div class="prompt-section">
        <div class="section-header">
          <h3>本科毕业设计答辩小组评语模板</h3>
          <div class="header-actions">
            <el-button
                size="small"
                @click="previewComment('design')"
                :loading="previewingDesign"
            >
              <i class="el-icon-view"></i>
              预览生成效果
            </el-button>
            <el-button
                type="success"
                size="small"
                @click="savePrompt('design')"
                :loading="savingDesignPrompt"
            >
              <i class="el-icon-check"></i>
              保存模板
            </el-button>
          </div>
        </div>

        <div class="prompt-editor">
          <el-input
              v-model="prompts.designCommentPrompt"
              type="textarea"
              :rows="12"
              placeholder="请输入毕业设计评语生成提示词..."
              maxlength="2000"
              show-word-limit
              class="prompt-textarea"
          />
        </div>

        <!-- 可用变量提示 -->
        <div class="variable-hint">
          <h4><i class="el-icon-collection-tag"></i> 可用变量</h4>
          <div class="variables-grid">
            <el-tag
                v-for="varName in availableVariables"
                :key="varName"
                class="variable-tag"
                @click="insertVariable(varName, 'design')"
            >
              {{ varName }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 评语预览对话框 -->
      <el-dialog
          title="评语生成预览"
          :visible.sync="showPreviewDialog"
          width="800px"
          @close="clearPreview"
      >
        <div v-if="previewLoading" class="preview-loading">
          <el-skeleton :rows="6" animated />
        </div>

        <div v-else class="preview-content">
          <div class="preview-meta">
            <h4>模拟学生信息：</h4>
            <div class="student-info">
              <p><strong>姓名：</strong>张三</p>
              <p><strong>学号：</strong>202101001</p>
              <p><strong>专业：</strong>计算机科学与技术</p>
              <p><strong>题目：</strong>{{ previewType === 'thesis' ? '基于深度学习的图像识别研究' : '智能家居控制系统设计' }}</p>
            </div>
          </div>

          <div class="preview-comment">
            <h4>生成的评语：</h4>
            <div class="comment-content">
              {{ previewCommentText || '未生成评语' }}
            </div>
          </div>

          <div class="preview-actions">
            <el-button type="primary" @click="regeneratePreview">
              <i class="el-icon-refresh"></i>
              重新生成
            </el-button>
            <el-button @click="copyPreviewComment">
              <i class="el-icon-document-copy"></i>
              复制评语
            </el-button>
          </div>
        </div>
      </el-dialog>
    </div>

    <!-- 系统设置 -->
    <div class="system-config-card">
      <h2 class="section-title">
        <i class="el-icon-setting"></i>
        系统设置
      </h2>

      <div class="system-config-content">
        <el-form :model="systemConfig" label-width="200px">
          <!-- 自动生成设置 -->
          <el-form-item label="自动生成评语">
            <el-switch
                v-model="systemConfig.autoGenerate"
                active-text="启用"
                inactive-text="禁用"
            />
            <div class="form-tip">
              启用后，系统会在评分完成后自动调用AI生成评语
            </div>
          </el-form-item>

          <!-- 审核设置 -->
          <el-form-item label="需要人工审核">
            <el-switch
                v-model="systemConfig.requireReview"
                active-text="需要"
                inactive-text="不需要"
            />
            <div class="form-tip">
              启用后，AI生成的评语需要经过人工审核才能使用
            </div>
          </el-form-item>

          <!-- 使用频率限制 -->
          <el-form-item label="API调用限制">
            <div class="limit-config">
              <el-input-number
                  v-model="systemConfig.apiLimit"
                  :min="10"
                  :max="1000"
                  size="medium"
              />
              <span class="limit-text">次/天</span>
            </div>
            <div class="form-tip">
              限制每天AI API的最大调用次数，防止超额费用
            </div>
          </el-form-item>

          <!-- 保存设置 -->
          <el-form-item>
            <el-button
                type="primary"
                @click="saveSystemConfig"
                :loading="savingSystemConfig"
            >
              保存系统设置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 使用帮助 -->
    <div class="help-card">
      <h3><i class="el-icon-question"></i> 使用帮助</h3>
      <div class="help-content">
        <el-collapse v-model="activeHelp">
          <el-collapse-item title="如何获取QWEN API Key？" name="1">
            <ol>
              <li>访问 <el-link href="https://dashscope.aliyun.com/" target="_blank">阿里云百炼平台</el-link></li>
              <li>注册/登录阿里云账号</li>
              <li>进入控制台，创建API Key</li>
              <li>复制API Key到此页面配置</li>
            </ol>
          </el-collapse-item>

          <el-collapse-item title="如何编写有效的提示词？" name="2">
            <ul>
              <li>明确指定角色：如"你是一位资深的毕业论文答辩评审专家"</li>
              <li>说明任务目标：如"请根据以下学生信息撰写答辩小组评语"</li>
              <li>提供结构要求：如"评语应包含：优点、不足、建议三部分"</li>
              <li>设置格式规范：如"使用正式书面语，字数300字左右"</li>
              <li>使用变量灵活插入：如"学生{student_name}的论文..."</li>
            </ul>
          </el-collapse-item>

          <el-collapse-item title="可用变量说明" name="3">
            <div class="variables-help">
              <p>以下变量可在提示词中使用，系统会自动替换：</p>
              <table class="variables-table">
                <thead>
                <tr>
                  <th>变量名</th>
                  <th>说明</th>
                  <th>示例值</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(desc, varName) in variableDescriptions" :key="varName">
                  <td><code>{{ varName }}</code></td>
                  <td>{{ desc }}</td>
                  <td><code>{{ variableExamples[varName] }}</code></td>
                </tr>
                </tbody>
              </table>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </div>
</template>

<script>
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

export default {
  name: 'AIConfigManagement',

  data() {
    return {
      // AI配置
      aiConfig: {
        apiKey: '',
        apiEndpoint: 'https://dashscope.aliyun.com/api/v1/services/aigc/text-generation/generation',
        modelName: 'qwen-turbo',
        temperature: 0.7,
        maxTokens: 500
      },

      // 提示词模板
      prompts: {
        thesisCommentPrompt: `你是一位资深的本科毕业论文答辩评审专家。请根据以下学生信息，撰写一份正式、专业、全面的答辩小组评语：

学生信息：
- 姓名：{student_name}
- 学号：{student_id}
- 专业：{major}
- 论文题目：{thesis_title}
- 指导教师：{advisor}
- 答辩成绩：{defense_score}

评语要求：
1. 开头简明介绍学生和论文基本情况
2. 客观评价论文的主要创新点和学术价值
3. 指出论文存在的不足之处（至少2-3点）
4. 针对不足提出具体改进建议
5. 结尾总结，给出综合评价
6. 字数控制在300-400字之间
7. 使用正式、专业的学术语言
8. 避免使用模板化、空洞的套话

请生成评语：`,

        designCommentPrompt: `你是一位资深的本科毕业设计答辩评审专家。请根据以下学生信息，撰写一份正式、专业、全面的答辩小组评语：

学生信息：
- 姓名：{student_name}
- 学号：{student_id}
- 专业：{major}
- 设计题目：{design_title}
- 指导教师：{advisor}
- 答辩成绩：{defense_score}

评语要求：
1. 开头简明介绍学生和设计项目基本情况
2. 评价设计的实用性、创新性和完成度
3. 分析设计的技术实现难度和技术路线合理性
4. 指出设计存在的技术问题和改进空间
5. 对学生的实践能力和解决问题能力进行评价
6. 提出具体的改进建议和后续发展方向
7. 字数控制在300-400字之间
8. 使用正式、专业的工程语言

请生成评语：`
      },

      // 系统配置
      systemConfig: {
        autoGenerate: true,
        requireReview: true,
        apiLimit: 100
      },

      // 可用变量
      availableVariables: [
        '{student_name}',
        '{student_id}',
        '{major}',
        '{thesis_title}',
        '{design_title}',
        '{advisor}',
        '{defense_score}',
        '{grade}',
        '{defense_date}',
        '{project_type}',
        '{innovation_points}',
        '{technical_difficulty}',
        '{practical_significance}'
      ],

      // 变量说明
      variableDescriptions: {
        '{student_name}': '学生姓名',
        '{student_id}': '学生学号',
        '{major}': '专业名称',
        '{thesis_title}': '毕业论文题目',
        '{design_title}': '毕业设计题目',
        '{advisor}': '指导教师姓名',
        '{defense_score}': '答辩成绩（百分制）',
        '{grade}': '成绩等级（优秀/良好/中等/及格）',
        '{defense_date}': '答辩日期',
        '{project_type}': '项目类型（理论研究/应用开发/实验研究等）',
        '{innovation_points}': '创新点描述',
        '{technical_difficulty}': '技术难度',
        '{practical_significance}': '实践意义'
      },

      variableExamples: {
        '{student_name}': '张三',
        '{student_id}': '202101001',
        '{major}': '计算机科学与技术',
        '{thesis_title}': '基于深度学习的图像识别研究',
        '{design_title}': '智能家居控制系统设计',
        '{advisor}': '李四教授',
        '{defense_score}': '85',
        '{grade}': '良好',
        '{defense_date}': '2024年5月20日',
        '{project_type}': '应用开发',
        '{innovation_points}': '提出了新的特征提取方法',
        '{technical_difficulty}': '较高',
        '{practical_significance}': '有良好的应用前景'
      },

      // 状态
      testingApi: false,
      savingApiConfig: false,
      previewingThesis: false,
      previewingDesign: false,
      savingThesisPrompt: false,
      savingDesignPrompt: false,
      savingSystemConfig: false,

      // API状态
      apiStatus: null,

      // 预览相关
      showPreviewDialog: false,
      previewLoading: false,
      previewType: 'thesis',
      previewCommentText: '',

      // 帮助面板
      activeHelp: ['1'],

      // 验证规则
      apiRules: {
        apiKey: [
          { required: true, message: '请输入API Key', trigger: 'blur' },
          { min: 20, message: 'API Key长度不正确', trigger: 'blur' }
        ],
        apiEndpoint: [
          { required: true, message: '请输入API端点', trigger: 'blur' },
          { type: 'url', message: '请输入有效的URL', trigger: 'blur' }
        ],
        modelName: [
          { required: true, message: '请选择模型', trigger: 'change' }
        ]
      }
    }
  },

  computed: {
    // 可以添加计算属性
    formattedConfig() {
      return {
        ...this.aiConfig,
        apiKey: this.aiConfig.apiKey ? '***' + this.aiConfig.apiKey.slice(-4) : ''
      }
    }
  },

  watch: {
    // 可以添加监听器
    'aiConfig.temperature'(newVal) {
      if (newVal < 0.5) {
        console.log('使用更确定的生成模式')
      } else if (newVal > 0.8) {
        console.log('使用更随机的生成模式')
      }
    }
  },

  created() {
    this.loadConfigs()
  },

  mounted() {
    // 组件挂载后执行的操作
    console.log('AIConfigManagement组件已挂载')
  },

  methods: {
    // 加载配置
    async loadConfigs() {
      try {
        console.log('加载AI配置...')

        // 从后端加载配置
        const token = localStorage.getItem('token')
        const http = axios.create({
          baseURL: 'http://localhost:8080',
          headers: { Authorization: `Bearer ${token}` }
        })

        try {
          // 加载API配置
          const apiResponse = await http.get('/api/ai/config')
          if (apiResponse.data?.data) {
            Object.assign(this.aiConfig, apiResponse.data.data)
          }

          // 加载提示词配置
          const promptsResponse = await http.get('/api/ai/prompts')
          if (promptsResponse.data?.data) {
            Object.assign(this.prompts, promptsResponse.data.data)
          }

          // 加载系统配置
          const systemResponse = await http.get('/api/ai/system-config')
          if (systemResponse.data?.data) {
            Object.assign(this.systemConfig, systemResponse.data.data)
          }

          console.log('配置加载成功')
        } catch (error) {
          console.log('使用默认配置:', error.message)
          // 如果后端没有数据，使用本地存储
          const savedApiConfig = localStorage.getItem('ai_api_config')
          const savedPrompts = localStorage.getItem('ai_prompts')
          const savedSystemConfig = localStorage.getItem('ai_system_config')

          if (savedApiConfig) {
            Object.assign(this.aiConfig, JSON.parse(savedApiConfig))
          }
          if (savedPrompts) {
            Object.assign(this.prompts, JSON.parse(savedPrompts))
          }
          if (savedSystemConfig) {
            Object.assign(this.systemConfig, JSON.parse(savedSystemConfig))
          }
        }
      } catch (error) {
        console.error('加载配置失败:', error)
        ElMessage.error('加载配置失败')
      }
    },

    // 测试API连接
    async testApiKey() {
      if (!this.aiConfig.apiKey) {
        ElMessage.warning('请输入API Key')
        return
      }

      this.testingApi = true
      this.apiStatus = null

      try {
        const startTime = Date.now()

        // 调用QWEN API进行测试
        const response = await axios.post(
            'https://dashscope.aliyun.com/api/v1/services/aigc/text-generation/generation',
            {
              model: this.aiConfig.modelName,
              input: {
                messages: [
                  {
                    role: 'user',
                    content: '你好，请简单回复"测试成功"。'
                  }
                ]
              },
              parameters: {
                result_format: 'text',
                temperature: 0.1,
                max_tokens: 10
              }
            },
            {
              headers: {
                'Authorization': `Bearer ${this.aiConfig.apiKey}`,
                'Content-Type': 'application/json'
              },
              timeout: 10000
            }
        )

        const endTime = Date.now()
        const latency = endTime - startTime

        if (response.data?.output?.text) {
          this.apiStatus = {
            type: 'success',
            icon: 'el-icon-success',
            title: 'API连接测试成功',
            message: 'QWEN API配置正确，可以正常使用',
            details: {
              model: this.aiConfig.modelName,
              latency: latency,
              time: new Date().toLocaleTimeString()
            }
          }
          ElMessage.success('API连接测试成功')
        } else {
          throw new Error('API响应格式不正确')
        }
      } catch (error) {
        console.error('API测试失败:', error)

        let errorMessage = 'API连接测试失败'
        if (error.response?.status === 401) {
          errorMessage = 'API Key无效或已过期'
        } else if (error.response?.status === 429) {
          errorMessage = 'API调用频率超限'
        } else if (error.code === 'ECONNABORTED') {
          errorMessage = '连接超时，请检查网络'
        } else if (error.message) {
          errorMessage = error.message
        }

        this.apiStatus = {
          type: 'error',
          icon: 'el-icon-error',
          title: 'API连接测试失败',
          message: errorMessage
        }

        ElMessage.error(errorMessage)
      } finally {
        this.testingApi = false
      }
    },

    // 保存API配置
    async saveApiConfig() {
      try {
        await this.$refs.aiConfigForm.validate()

        this.savingApiConfig = true

        // 保存到后端
        const token = localStorage.getItem('token')
        const http = axios.create({
          baseURL: 'http://localhost:8080',
          headers: { Authorization: `Bearer ${token}` }
        })

        try {
          await http.post('/api/ai/config/save', this.aiConfig)
          ElMessage.success('API配置保存成功')

          // 同时保存到本地存储作为备份
          localStorage.setItem('ai_api_config', JSON.stringify(this.aiConfig))
        } catch (error) {
          // 如果后端保存失败，只保存到本地
          localStorage.setItem('ai_api_config', JSON.stringify(this.aiConfig))
          ElMessage.success('API配置已保存到本地')
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error('表单验证失败:', error)
        }
      } finally {
        this.savingApiConfig = false
      }
    },

    // 重置API配置
    resetApiConfig() {
      ElMessageBox.confirm(
          '确定要重置API配置吗？所有配置将恢复为默认值。',
          '确认重置',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
      ).then(() => {
        this.aiConfig = {
          apiKey: '',
          apiEndpoint: 'https://dashscope.aliyun.com/api/v1/services/aigc/text-generation/generation',
          modelName: 'qwen-turbo',
          temperature: 0.7,
          maxTokens: 500
        }
        localStorage.removeItem('ai_api_config')
        this.apiStatus = null
        ElMessage.success('API配置已重置')
      })
    },

    // 插入变量到提示词
    insertVariable(variable, type) {
      const textarea = document.querySelector(`.prompt-textarea${type === 'thesis' ? '' : ':last-of-type'} textarea`)
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const text = type === 'thesis' ? this.prompts.thesisCommentPrompt : this.prompts.designCommentPrompt
        const newText = text.substring(0, start) + variable + text.substring(end)

        if (type === 'thesis') {
          this.prompts.thesisCommentPrompt = newText
        } else {
          this.prompts.designCommentPrompt = newText
        }

        // 保持焦点
        textarea.focus()
        // 设置光标位置在变量后
        setTimeout(() => {
          textarea.selectionStart = start + variable.length
          textarea.selectionEnd = start + variable.length
        }, 0)
      }
    },

    // 保存提示词模板
    async savePrompt(type) {
      try {
        const savingKey = type === 'thesis' ? 'savingThesisPrompt' : 'savingDesignPrompt'
        this[savingKey] = true

        const promptData = {
          type: type,
          prompt: type === 'thesis' ? this.prompts.thesisCommentPrompt : this.prompts.designCommentPrompt
        }

        // 保存到后端
        const token = localStorage.getItem('token')
        const http = axios.create({
          baseURL: 'http://localhost:8080',
          headers: { Authorization: `Bearer ${token}` }
        })

        try {
          await http.post('/api/ai/prompts/save', promptData)
          ElMessage.success(`${type === 'thesis' ? '毕业论文' : '毕业设计'}提示词保存成功`)

          // 保存到本地存储
          const savedPrompts = JSON.parse(localStorage.getItem('ai_prompts') || '{}')
          savedPrompts[type] = promptData.prompt
          localStorage.setItem('ai_prompts', JSON.stringify(savedPrompts))
        } catch (error) {
          // 如果后端保存失败，只保存到本地
          const savedPrompts = JSON.parse(localStorage.getItem('ai_prompts') || '{}')
          savedPrompts[type] = promptData.prompt
          localStorage.setItem('ai_prompts', JSON.stringify(savedPrompts))
          ElMessage.success(`${type === 'thesis' ? '毕业论文' : '毕业设计'}提示词已保存到本地`)
        }
      } catch (error) {
        console.error('保存提示词失败:', error)
        ElMessage.error('保存失败')
      } finally {
        if (type === 'thesis') {
          this.savingThesisPrompt = false
        } else {
          this.savingDesignPrompt = false
        }
      }
    },

    // 预览评语生成效果
    async previewComment(type) {
      if (!this.aiConfig.apiKey) {
        ElMessage.warning('请先配置API Key')
        return
      }

      this.previewType = type
      this.showPreviewDialog = true
      this.previewLoading = true

      try {
        // 构建测试提示词
        const prompt = type === 'thesis'
            ? this.prompts.thesisCommentPrompt
            : this.prompts.designCommentPrompt

        // 替换变量为测试值
        const testPrompt = prompt
            .replace(/{student_name}/g, '张三')
            .replace(/{student_id}/g, '202101001')
            .replace(/{major}/g, '计算机科学与技术')
            .replace(/{thesis_title}/g, '基于深度学习的图像识别研究')
            .replace(/{design_title}/g, '智能家居控制系统设计')
            .replace(/{advisor}/g, '李四教授')
            .replace(/{defense_score}/g, '85')
            .replace(/{grade}/g, '良好')
            .replace(/{defense_date}/g, '2024年5月20日')
            .replace(/{project_type}/g, '应用开发')
            .replace(/{innovation_points}/g, '提出了新的特征提取方法')
            .replace(/{technical_difficulty}/g, '较高')
            .replace(/{practical_significance}/g, '有良好的应用前景')

        // 调用API生成评语
        const response = await axios.post(
            this.aiConfig.apiEndpoint || 'https://dashscope.aliyun.com/api/v1/services/aigc/text-generation/generation',
            {
              model: this.aiConfig.modelName,
              input: {
                messages: [
                  {
                    role: 'user',
                    content: testPrompt
                  }
                ]
              },
              parameters: {
                result_format: 'text',
                temperature: this.aiConfig.temperature,
                max_tokens: this.aiConfig.maxTokens
              }
            },
            {
              headers: {
                'Authorization': `Bearer ${this.aiConfig.apiKey}`,
                'Content-Type': 'application/json'
              },
              timeout: 30000
            }
        )

        if (response.data?.output?.text) {
          this.previewCommentText = response.data.output.text
        } else {
          throw new Error('API返回格式不正确')
        }
      } catch (error) {
        console.error('预览评语失败:', error)

        // 使用模拟数据作为备用
        this.previewCommentText = this.generateMockComment(type)

        ElMessage.warning('使用模拟数据展示效果，请检查API配置')
      } finally {
        this.previewLoading = false
      }
    },

    // 生成模拟评语
    generateMockComment(type) {
      if (type === 'thesis') {
        return `该生论文《基于深度学习的图像识别研究》选题具有较好的理论意义和应用价值。论文结构完整，逻辑清晰，文献综述较为全面。

论文的主要创新点在于提出了一种新的特征提取方法，在实验数据上取得了较好的效果。技术路线合理，研究方法科学。

不足之处：1）对相关研究的对比分析不够深入；2）实验数据规模较小，结论的普适性有待验证；3）部分图表标注不够清晰。

建议：1）扩大实验数据集，增强结论的说服力；2）深入分析与其他方法的差异；3）优化论文格式和图表表达。

总体而言，该生掌握了本专业的基础理论和研究方法，具备一定的科研能力，论文达到了本科毕业论文的要求。`
      } else {
        return `该生毕业设计《智能家居控制系统设计》选题紧密结合实际需求，具有较好的应用前景。设计功能完整，界面友好，技术实现合理。

设计的主要特点：1）采用了模块化设计思想，便于扩展和维护；2）实现了基本的智能控制功能；3）用户界面简洁易用。

技术实现方面，选用了合适的技术栈，代码结构清晰。但在系统稳定性测试和异常处理方面还有提升空间。

不足之处：1）系统安全性考虑不够全面；2）部分功能响应速度有待优化；3）缺少详细的用户手册。

建议：1）加强系统安全防护措施；2）优化核心算法提升性能；3）完善项目文档和使用说明。

该生表现出较强的动手实践能力和解决问题能力，设计作品达到了本科毕业设计的要求。`
      }
    },

    // 重新生成预览
    regeneratePreview() {
      this.previewComment(this.previewType)
    },

    // 复制预览评语
    copyPreviewComment() {
      navigator.clipboard.writeText(this.previewCommentText)
          .then(() => {
            ElMessage.success('评语已复制到剪贴板')
          })
          .catch(err => {
            console.error('复制失败:', err)
            ElMessage.error('复制失败')
          })
    },

    // 清空预览
    clearPreview() {
      this.previewCommentText = ''
      this.previewLoading = false
    },

    // 保存系统设置
    async saveSystemConfig() {
      try {
        this.savingSystemConfig = true

        // 保存到后端
        const token = localStorage.getItem('token')
        const http = axios.create({
          baseURL: 'http://localhost:8080',
          headers: { Authorization: `Bearer ${token}` }
        })

        try {
          await http.post('/api/ai/system-config/save', this.systemConfig)
          ElMessage.success('系统设置保存成功')

          // 保存到本地存储
          localStorage.setItem('ai_system_config', JSON.stringify(this.systemConfig))
        } catch (error) {
          // 如果后端保存失败，只保存到本地
          localStorage.setItem('ai_system_config', JSON.stringify(this.systemConfig))
          ElMessage.success('系统设置已保存到本地')
        }
      } catch (error) {
        console.error('保存系统设置失败:', error)
        ElMessage.error('保存失败')
      } finally {
        this.savingSystemConfig = false
      }
    }
  }
}
</script>

<style scoped>
.ai-config-management {
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

/* 卡片通用样式 */
.api-config-card,
.prompt-config-card,
.system-config-card,
.help-card {
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

/* API配置卡片 */
.config-content {
  padding: 32px;
}

.config-form {
  margin-bottom: 32px;
}

.form-tip {
  margin-top: 8px;
  color: #909399;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.form-tip i {
  color: #409EFF;
}

.unit {
  margin-left: 10px;
  color: #606266;
}

/* API状态显示 */
.api-status {
  padding: 24px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e4e7ed;
}

.status-card {
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid;
}

.status-card.success {
  background: #f0f9eb;
  border-color: #67c23a;
  color: #67c23a;
}

.status-card.error {
  background: #fef0f0;
  border-color: #f56c6c;
  color: #f56c6c;
}

.status-card h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-card p {
  margin: 0 0 16px 0;
  font-size: 14px;
}

.status-details {
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.status-details p {
  margin: 4px 0;
  font-size: 13px;
}

/* 提示词配置 */
.prompt-section {
  padding: 32px;
  border-bottom: 1px solid #ebeef5;
}

.prompt-section:last-child {
  border-bottom: none;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.prompt-editor {
  margin-bottom: 24px;
}

.prompt-textarea {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
}

/* 变量提示 */
.variable-hint {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  border: 1px solid #e4e7ed;
}

.variable-hint h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.variables-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.variable-tag {
  cursor: pointer;
  user-select: none;
  transition: all 0.2s;
  font-family: 'Consolas', monospace;
}

.variable-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.hint-text {
  margin: 0;
  color: #909399;
  font-size: 13px;
}

/* 预览对话框 */
.preview-loading {
  padding: 40px 20px;
}

.preview-content {
  padding: 20px 0;
}

.preview-meta {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.student-info {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.preview-comment {
  background: #f0f9ff;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid #d9ecff;
}

.comment-content {
  white-space: pre-line;
  line-height: 1.8;
  color: #303133;
  margin-top: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.preview-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: center;
}

/* 系统配置 */
.system-config-content {
  padding: 32px;
}

.limit-config {
  display: flex;
  align-items: center;
  gap: 12px;
}

.limit-text {
  color: #606266;
  font-size: 14px;
}

/* 帮助卡片 */
.help-card {
  margin-top: 40px;
}

.help-content {
  padding: 0 24px 24px;
}

.variables-help {
  padding: 16px 0;
}

.variables-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
  font-size: 14px;
}

.variables-table th,
.variables-table td {
  padding: 12px 16px;
  border: 1px solid #e4e7ed;
  text-align: left;
}

.variables-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #303133;
}

.variables-table code {
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Consolas', monospace;
  color: #e96900;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .ai-config-management {
    max-width: 100%;
    padding: 20px;
  }

  .config-form :deep(.el-form-item__label) {
    width: 150px !important;
  }
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 24px;
  }

  .config-content,
  .prompt-section,
  .system-config-content {
    padding: 20px;
  }

  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .config-form :deep(.el-form-item__label) {
    width: 120px !important;
  }
}

@media (max-width: 480px) {
  .ai-config-management {
    padding: 16px;
  }

  .variables-grid {
    gap: 8px;
  }

  .student-info {
    grid-template-columns: 1fr;
  }
}
</style>