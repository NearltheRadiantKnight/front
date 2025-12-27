<template>
  <div id="login" class="bg">
    <el-row class="main-container">
      <el-col class="login-container" :lg="8" :xs="16" :md="10" :span="16">
        <div class="top">
          <span class="title">答辩管理系统</span>
        </div>
        <div class="bottom">
          <div class="content">
            <!-- 登录类型选择 -->
            <div class="login-type-selector">
              <el-radio-group v-model="loginType" @change="handleLoginTypeChange">
                <el-radio-button label="admin">管理员登录</el-radio-button>
                <el-radio-button label="teacher">教师登录</el-radio-button>
              </el-radio-group>
            </div>

            <div class="login-tip">
              <p>提示：</p>
              <p v-if="loginType === 'admin'">
                • 超级管理员/院系管理员：使用用户名登录<br>
                • 超级管理员默认：admin/123456
              </p>
              <p v-else>
                • 教师/答辩组长：使用教师编号登录<br>
                • 教师登录必须选择答辩年份
              </p>
            </div>

            <!-- 管理员登录表单 -->
            <div v-if="loginType === 'admin'">
              <el-form :label-position="'left'" label-width="80px" :model="adminForm" :rules="adminRules"
                       ref="adminFormRef">
                <el-form-item label="用户名：" prop="username">
                  <el-input v-model="adminForm.username" placeholder="请输入用户名"
                            @keyup.enter="handleAdminLogin"></el-input>
                </el-form-item>
                <el-form-item label="密码：" prop="password">
                  <el-input v-model="adminForm.password" placeholder="请输入密码" type="password"
                            @keyup.enter="handleAdminLogin"></el-input>
                </el-form-item>
                <el-form-item class="button-container">
                  <el-button type="primary" @click="handleAdminLogin" :loading="loading">
                    登录
                  </el-button>
                </el-form-item>
              </el-form>
            </div>

            <!-- 教师登录表单 -->
            <div v-else>
              <el-form :label-position="'left'" label-width="100px" :model="teacherForm" :rules="teacherRules"
                       ref="teacherFormRef">
                <el-form-item label="教师编号：" prop="username">
                  <el-input
                      v-model="teacherForm.username"
                      placeholder="请输入教师编号"
                      @keyup.enter="handleTeacherLogin"
                      @blur="handleTeacherIdBlur"
                      :disabled="yearLoading"
                  >
                    <template #append>
                      <el-button
                          @click="fetchTeacherDefenseYears"
                          :loading="yearLoading"
                          :disabled="!teacherForm.username || !/^\d+$/.test(teacherForm.username)"
                      >
                        <el-icon><Refresh /></el-icon>
                      </el-button>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item label="密码：" prop="password">
                  <el-input v-model="teacherForm.password" placeholder="请输入密码" type="password"
                            @keyup.enter="handleTeacherLogin"></el-input>
                </el-form-item>
                <el-form-item label="答辩年份：" prop="year">
                  <el-select
                      v-model="teacherForm.year"
                      placeholder="请先输入教师编号获取可用年份"
                      style="width: 100%"
                      :loading="yearLoading"
                      :disabled="yearOptions.length === 0 || yearLoading"
                      filterable
                  >
                    <el-option
                        v-for="year in yearOptions"
                        :key="year"
                        :label="`${year}年`"
                        :value="year"
                    ></el-option>
                  </el-select>
                  <div v-if="yearOptions.length === 0 && teacherForm.username" class="form-tip error">
                    该教师暂无可用答辩年份，请联系管理员
                  </div>
                  <div v-else-if="yearOptions.length > 0" class="form-tip success">
                    可用答辩年份：{{ yearOptions.join('年、') }}年
                  </div>
                </el-form-item>
                <el-form-item class="button-container">
                  <el-button
                      type="primary"
                      @click="handleTeacherLogin"
                      :loading="loading"
                      :disabled="yearOptions.length === 0"
                  >
                    登录
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';
import request from '@/api';
import {userApi} from "@/api/user.ts";

// 定义接口
interface AdminForm {
  username: string;
  password: string;
}

interface TeacherForm {
  username: string;
  password: string;
  defenseYear: number | null;
}

export default defineComponent({
  name: 'Login',
  components: {
    Refresh
  },
  setup() {
    const router = useRouter();

    // 登录类型
    const loginType = ref('admin');

    // 管理员表单
    const adminFormRef = ref();
    const adminForm = ref<AdminForm>({
      username: '',
      password: ''
    });

    // 教师表单
    const teacherFormRef = ref();
    const teacherForm = ref<TeacherForm>({
      username: '',
      password: '',
      defenseYear: null
    });

    // 加载状态
    const loading = ref(false);
    const yearLoading = ref(false);

    // 年份选项
    const yearOptions = ref<number[]>([]);

    // 验证规则
    const adminRules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' }
      ]
    };

    const teacherRules = {
      username: [
        { required: true, message: '请输入教师编号', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' }
      ],
      defenseYear: [
        { required: true, message: '请选择答辩年份', trigger: 'change' }
      ]
    };

    // 教师编号失去焦点时获取年份
    const handleTeacherIdBlur = () => {
      if (teacherForm.value.username && /^\d+$/.test(teacherForm.value.username)) {
        fetchTeacherDefenseYears();
      }
    };

    // 获取教师可用的答辩年份
    const fetchTeacherDefenseYears = async () => {
      const teacherId = teacherForm.value.username.trim();

      if (!teacherId || !/^\d+$/.test(teacherId)) {
        return;
      }

      try {
        yearLoading.value = true;
        yearOptions.value = [];
        teacherForm.value.year = null;

        const response = await request.get(`/defenseYears/${teacherId}`);

        if (response.code === 200 && response.data && response.data.length > 0) {
          // 降序排列年份
          yearOptions.value = response.data.sort((a: number, b: number) => b - a);
          // 默认选中最新年份
          teacherForm.value.defenseYear = yearOptions.value[0];

          if (yearOptions.value.length === 1) {
            ElMessage.success(`获取到1个可用年份：${yearOptions.value[0]}年`);
          } else {
            ElMessage.success(`获取到${yearOptions.value.length}个可用年份`);
          }
        } else {
          yearOptions.value = [];
          ElMessage.warning('该教师暂无可用答辩年份');
        }
      } catch (error: any) {
        console.error('获取答辩年份失败:', error);
        yearOptions.value = [];
        let errorMessage = '获取答辩年份失败';

        if (error.response) {
          const errorData = error.response.data;
          errorMessage = errorData?.message || `获取失败，状态码: ${error.response.status}`;
        } else if (error.request) {
          errorMessage = '网络连接异常，请检查服务器是否运行';
        }

        ElMessage.error(errorMessage);
      } finally {
        yearLoading.value = false;
      }
    };

    // 登录类型切换处理
    const handleLoginTypeChange = () => {
      // 清空表单
      adminForm.value = { username: '', password: '' };
      teacherForm.value = { username: '', password: '', year: null };
      yearOptions.value = [];
    };

    // 管理员登录
    const handleAdminLogin = () => {
      if (!adminFormRef.value) return;

      adminFormRef.value.validate((valid: boolean) => {
        if (!valid) return;

        loading.value = true;

        // 管理员登录接口
        userApi.login({
          username: adminForm.value.username,
          password: adminForm.value.password,
        })
            .then((res: any) => {
              if (res.code === 200) {
                handleLoginSuccess(res.data);
              } else {
                ElMessage.error(res.message || '管理员登录失败');
              }
            })
            .catch((error: any) => {
              console.error('管理员登录错误:', error);
              ElMessage.error(error.response?.data?.message || '管理员登录失败');
            })
            .finally(() => {
              loading.value = false;
            });
      });
    };

    // 教师登录
    const handleTeacherLogin = () => {
      if (!teacherFormRef.value) return;

      teacherFormRef.value.validate((valid: boolean) => {
        if (!valid) return;

        // 确保已选择年份
        if (!teacherForm.value.year) {
          ElMessage.error('请选择答辩年份');
          return;
        }

        // 确保有可用年份
        if (yearOptions.value.length === 0) {
          ElMessage.error('请先获取可用答辩年份');
          return;
        }

        loading.value = true;

        // 教师登录接口
        userApi.loginWithYear({
          username: teacherForm.value.username,
          password: teacherForm.value.password,
          defenseYear: teacherForm.value.year
        })
            .then((res: any) => {
              if (res.code === 200) {
                handleLoginSuccess(res.data);
              } else {
                ElMessage.error(res.message || '教师登录失败');
              }
            })
            .catch((error: any) => {
              console.error('教师登录错误:', error);
              ElMessage.error(error.response?.data?.message || '教师登录失败');
            })
            .finally(() => {
              loading.value = false;
            });
      });
    };

    // 登录成功处理
    const handleLoginSuccess = (data: any) => {
      // 添加调试日志
      console.log('登录成功数据:', data);
      console.log('用户类型:', data.userType);
      console.log('用户信息:', data.userInfo); // 查看用户信息详情

      // 存储登录信息
      localStorage.setItem('token', data.token || `mock-token-${Date.now()}`);
      localStorage.setItem('userType', data.userType);

      // 如果是答辩组长，存储组号
      if (data.userType === 'defenseLeader' && data.userInfo && data.userInfo.groupId) {
        localStorage.setItem('groupId', data.userInfo.groupId.toString());
        console.log('答辩组长组号:', data.userInfo.groupId, '类型:', typeof data.userInfo.groupId);
      } else {
        // 普通教师，没有组号
        localStorage.removeItem('groupId');
      }

      // 如果是教师登录，存储答辩年份
      if (loginType.value === 'teacher' && teacherForm.value.year) {
        localStorage.setItem('year', teacherForm.value.year.toString());
      }

      if (data.userInfo) {
        // 显示组号信息（如果存在）
        if (data.userInfo.groupId) {
          ElMessage.success(`登录成功！您的组号为: ${data.userInfo.groupId}`);
        } else {
          ElMessage.success('登录成功！');
        }

        localStorage.setItem('userInfo', JSON.stringify(data.userInfo));
      }

      // 跳转到对应页面
      const routeMap: Record<string, string> = {
        'admin': 'SuperAdminHome',
        'instAdmin': 'InstAdminHome',
        'defenseLeader': 'DefenseLeaderHome',
        'teacher': 'TeacherHome'
      };

      const routeName = routeMap[data.userType];
      console.log('尝试跳转到路由:', routeName, '用户类型:', data.userType, '组号:', data.userInfo?.groupId);
      if (routeName) {
        router.push({ name: routeName });
      } else {
        console.error('未找到匹配的路由，UserType:', data.userType);
        ElMessage.error(`未知用户类型: ${data.userType}，请检查后端返回数据`);
      }
    };

    // 初始化
    onMounted(() => {
      // 页面加载时可以选择清空本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      localStorage.removeItem('year');
      localStorage.removeItem('userInfo');
    });

    return {
      loginType,
      adminFormRef,
      adminForm,
      teacherFormRef,
      teacherForm,
      loading,
      yearLoading,
      yearOptions,
      adminRules,
      teacherRules,
      handleTeacherIdBlur,
      fetchTeacherDefenseYears,
      handleLoginTypeChange,
      handleAdminLogin,
      handleTeacherLogin
    };
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

.login-type-selector {
  text-align: center;
  margin-bottom: 20px;
}

.login-type-selector .el-radio-group {
  width: 100%;
}

.login-type-selector .el-radio-button {
  width: 50%;
}

.login-type-selector .el-radio-button__inner {
  width: 100%;
}

.login-tip {
  background: #f0f9ff;
  border-left: 4px solid #409EFF;
  padding: 10px 15px;
  margin-bottom: 20px;
  font-size: 12px;
  color: #666;
  line-height: 1.6;
}

.login-tip p {
  margin: 5px 0;
}

.form-tip {
  font-size: 12px;
  margin-top: 5px;
}

.form-tip.success {
  color: #67c23a;
}

.form-tip.error {
  color: #f56c6c;
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

/* 年份选择器样式 */
.el-select {
  width: 100%;
}

/* 教师编号输入框样式 */
:deep(.el-input-group__append) {
  padding: 0 10px;
}
</style>
