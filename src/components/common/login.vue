<template>
  <div id="login" class="bg">
    <el-row class="main-container">
      <el-col class="login-container" :lg="8" :xs="16" :md="10" :span="16">
        <div class="top">
          <span class="title">答辩管理系统</span>
        </div>
        <div class="bottom">
          <div class="content">
            <p class="title">账号登录</p>
            <div class="login-tip">
              <p>提示：</p>
              <p>• 超级管理员/院系管理员：使用用户名登录</p>
              <p>• 教师/答辩组长：使用教师编号登录</p>
              <p>• 超级管理员默认：admin/123456</p>
            </div>
            <el-form :label-position="'left'" label-width="80px" :model="user" :rules="rules" ref="loginForm">
              <el-form-item label="用户名：" prop="username">
                <el-input v-model="user.username" placeholder="请输入用户名或教师编号" @keyup.enter="login"></el-input>
              </el-form-item>
              <el-form-item label="密码：" prop="password">
                <el-input v-model="user.password" placeholder="请输入密码" type="password" @keyup.enter="login"></el-input>
              </el-form-item>
              <el-form-item class="button-container">
                <el-button type="primary" @click="login" :loading="loading">登录</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Login',
  data() {
    return {
      user: {
        username: '',
        password: '',
      },
      loading: false,
      rules: {
        username: [
          { required: true, message: '请输入用户名或教师编号', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      }
    };
  },
  methods: {
    login() {
      (this.$refs.loginForm as any).validate((valid: boolean) => {
        if (valid) {
          this.loading = true;

          this.$axios({
            url: '/api/login',  // 修改为新的接口地址
            method: 'post',
            data: {
              ...this.user
            }
          }).then((res: any) => {
            console.log('登录响应:', res);

            if (res.data.code === 200) {
              const loginData = res.data.data;
              const userType = loginData.userType;

              // 存储用户信息到localStorage或Vuex
              localStorage.setItem('userType', userType);
              localStorage.setItem('userInfo', JSON.stringify(loginData.userInfo));

              // 根据用户类型跳转
              switch (userType) {
                case 'admin':
                  this.$router.push('/superAdminDashboard');
                  break;
                case 'instAdmin':
                  this.$router.push('/instAdminDashboard');
                  break;
                case 'defenseLeader':
                  this.$router.push('/defenseLeaderDashboard');
                  break;
                case 'teacher':
                  this.$router.push('/teacherDashboard');
                  break;
                default:
                  this.$message.error('未知用户类型');
              }
            } else {
              this.$message.error(res.data.message || '登录失败');
            }
          }).catch((error: any) => {
            console.error('登录错误:', error);
            this.$message.error('登录失败，请检查网络连接');
          }).finally(() => {
            this.loading = false;
          });
        } else {
          return false;
        }
      });
    }
  }
});
</script>

<style scoped>
#login {
  font-size: 14px;
  color: #000;
  background-color: #fff;
}

.bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  overflow-y: auto;
  height: 100%;
  background: url('../../assets/img/loginbg.png') center top / cover no-repeat;
  background-color: #b6bccdd1 !important;
}

#login .main-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

#login .main-container .login-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

#login .main-container .login-container .top {
  font-size: 28px;
  color: #409EFF;
  justify-content: center;
  display: flex;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

#login .main-container .login-container .top .title {
  font-weight: bold;
}

#login .main-container .login-container .bottom {
  padding: 30px;
}

#login .main-container .login-container .bottom .content .title {
  margin: 0 0 20px 0;
  text-align: center;
  font-size: 24px;
  color: #333;
}

.login-tip {
  background: #f0f9ff;
  border-left: 4px solid #409EFF;
  padding: 10px 15px;
  margin-bottom: 20px;
  font-size: 12px;
  color: #666;
}

.login-tip p {
  margin: 5px 0;
}

.button-container {
  text-align: center;
  margin-top: 20px;
}

.button-container .el-button {
  width: 100%;
  padding: 12px;
  font-size: 16px;
}
</style>