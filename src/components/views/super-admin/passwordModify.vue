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
                <li>长度8-20位字符</li>
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
          { min: 8, max: 20, message: '密码长度8-20位', trigger: 'blur' }
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
    handleSubmit() {
      this.$refs.passwordForm.validate(async (valid) => {
        if (valid) {
          try {
            this.loading = true;

            // 调用修改密码接口
            const response = await userApi.changePassword({
              userId: this.getCurrentUserId(),
              oldPassword: this.form.oldPassword,
              newPassword: this.form.newPassword
            });

            if (response.data.code === 200) {
              this.$message.success('密码修改成功，请重新登录');

              // 延迟跳转
              setTimeout(() => {
                this.logout();
              }, 1500);
            } else {
              this.$message.error(response.data.message || '密码修改失败');
            }
          } catch (error) {
            console.error('修改密码失败:', error);
            if (error.response && error.response.data) {
              this.$message.error(error.response.data.message || '密码修改失败');
            } else {
              this.$message.error('网络错误，请重试');
            }
          } finally {
            this.loading = false;
          }
        }
      });
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
      return localStorage.getItem('userId') || sessionStorage.getItem('userId') || '';
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