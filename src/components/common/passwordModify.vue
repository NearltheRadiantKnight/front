<template>
  <div class="password-modify-page">
    <!-- 页面标题 -->
    <div class="page-title">
      <h2><i class="el-icon-lock"></i> 修改密码</h2>
      <p class="subtitle">为确保账户安全，请定期修改密码</p>
    </div>

    <!-- 修改密码表单 -->
    <div class="password-form-container">
      <el-card class="form-card">
        <el-form
            ref="passwordForm"
            :model="form"
            :rules="rules"
            label-width="120px"
            class="password-form"
        >
          <el-form-item label="当前密码" prop="oldPassword">
            <el-input
                v-model="form.oldPassword"
                type="password"
                placeholder="请输入当前密码"
                show-password
            ></el-input>
          </el-form-item>

          <el-form-item label="新密码" prop="newPassword">
            <el-input
                v-model="form.newPassword"
                type="password"
                placeholder="请输入新密码"
                show-password
            ></el-input>
            <div class="password-tips">
              <p>密码要求：</p>
              <ul>
                <li>长度6-20位字符</li>
              </ul>
            </div>
          </el-form-item>

          <el-form-item label="确认新密码" prop="confirmPassword">
            <el-input
                v-model="form.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                show-password
            ></el-input>
          </el-form-item>

          <el-form-item>
            <el-button
                type="primary"
                @click="handleSubmit"
                :loading="loading"
            >
              确认修改
            </el-button>
            <el-button @click="handleReset">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 安全提示 -->
      <el-card class="tips-card">
        <div slot="header" class="tips-header">
          <i class="el-icon-warning"></i>
          <span>安全提示</span>
        </div>
        <div class="tips-content">
          <p>1. 建议使用不同的密码管理不同系统</p>
          <p>2. 修改密码后，所有登录的设备将需要重新登录</p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { userApi } from "@/api/user.ts";

export default {
  name: 'PasswordModify',
  data() {
    return {
      form: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      rules: {
        oldPassword: [
          { required: true, message: '请输入当前密码', trigger: 'blur' },
          { min: 6, message: '密码长度至少6位', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度6-20位', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认新密码', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (value !== this.form.newPassword) {
                callback(new Error('两次输入的密码不一致'));
              } else {
                callback();
              }
            },
            trigger: 'blur'
          }
        ]
      },
      loading: false
    };
  },
  methods: {
    // 提交修改
    async handleSubmit() {
      try {
        const valid = await this.$refs.passwordForm.validate();
        if (!valid) return;

        this.loading = true;
        console.log('提交修改密码请求...');

        // 获取用户ID
        const userId = this.getCurrentUserId();
        console.log('用户ID:', userId);

        if (!userId) {
          this.$message.error('未找到用户ID，请重新登录');
          this.logout();
          return;
        }

        const requestData = {
          userId: userId,
          oldPassword: this.form.oldPassword,
          newPassword: this.form.newPassword
        };

        // 调用修改密码接口
        const response = await userApi.changePassword(requestData);

        console.log('完整响应对象:', response);
        console.log('响应类型:', typeof response);

        // 处理可能的响应结构
        let result = null;

        // 处理不同的响应结构
        if (response && typeof response === 'object') {
          // 1. 如果 response 直接是 Result 对象
          if ('code' in response && 'message' in response) {
            result = response;
          }
          // 2. 如果 response 包含 data 属性 (axios 默认包装)
          else if (response.data) {
            result = response.data;
          }
          // 3. 如果 response 是其他结构
          else {
            result = response;
          }
        } else if (response === null || response === undefined) {
          console.warn('API 返回 null 或 undefined');
          this.$message.error('服务器无响应，请检查网络连接');
          this.loading = false;
          return;
        }

        console.log('处理后的结果:', result);

        if (result && result.code === 200) {
          this.$message.success(result.message || '密码修改成功，请重新登录');
          setTimeout(() => this.logout(), 1500);
        } else if (result) {
          const errorMsg = result.message || result.msg || '密码修改失败';
          this.$message.error(errorMsg);
        } else {
          this.$message.error('服务器返回格式错误');
        }
      } catch (error) {
        console.error('修改密码失败 - 详细错误:', error);

        // 更详细的错误信息
        if (error.response) {
          // 服务器返回了错误状态码
          console.error('响应状态:', error.response.status);
          console.error('响应头:', error.response.headers);
          console.error('响应数据:', error.response.data);

          const res = error.response.data || {};
          this.$message.error(res.message || res.msg || `服务器错误 (${error.response.status})`);
        } else if (error.request) {
          // 请求已发送但无响应
          console.error('请求对象:', error.request);
          this.$message.error('服务器无响应，请检查网络连接或服务器状态');
        } else {
          // 请求配置错误
          console.error('错误信息:', error.message);
          this.$message.error('请求配置错误: ' + error.message);
        }
      } finally {
        this.loading = false;
      }
    },

    // 重置表单
    handleReset() {
      this.$refs.passwordForm.resetFields();
      this.form = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
    },

    // 获取当前用户ID
    getCurrentUserId() {
      // 方式1：从存储中获取用户ID
      let userId = localStorage.getItem('userId') ||
          sessionStorage.getItem('userId') ||
          localStorage.getItem('id') ||
          sessionStorage.getItem('id');

      // 方式2：如果没有存储ID，从用户信息对象中获取
      if (!userId) {
        try {
          const userInfoStr = localStorage.getItem('userInfo') ||
              sessionStorage.getItem('userInfo');
          if (userInfoStr) {
            const userInfo = JSON.parse(userInfoStr);
            userId = userInfo.id || userInfo.userId || userInfo.username;
          }
        } catch (e) {
          console.warn('解析用户信息失败:', e);
        }
      }

      console.log('获取到的用户ID:', userId || '未获取到');
      return userId || '';
    },

    // 退出登录
    logout() {
      localStorage.clear();
      sessionStorage.clear();
      this.$router.push('/login');
    }
  },
  mounted() {
    console.log('密码修改页面已加载');
  }
};
</script>

<style scoped>
.password-modify-page {
  height: 100%;
}

.page-title {
  margin-bottom: 30px;
}

.page-title h2 {
  color: #333;
  margin-bottom: 10px;
  font-size: 24px;
  display: flex;
  align-items: center;
}

.page-title h2 i {
  margin-right: 10px;
  color: #409EFF;
}

.subtitle {
  color: #666;
  margin: 0;
}

.password-form-container {
  display: flex;
  gap: 30px;
}

.form-card {
  flex: 2;
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.tips-card {
  flex: 1;
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.password-form {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px 0;
}

.password-tips {
  margin-top: 10px;
  padding: 10px 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.password-tips p {
  margin: 0 0 5px 0;
  font-weight: bold;
}

.password-tips ul {
  margin: 0;
  padding-left: 20px;
}

.password-tips li {
  margin-bottom: 3px;
}

.tips-header {
  font-weight: bold;
  color: #333;
}

.tips-header i {
  margin-right: 8px;
  color: #E6A23C;
}

.tips-content {
  color: #666;
  line-height: 1.8;
}

.tips-content p {
  margin: 8px 0;
}
</style>