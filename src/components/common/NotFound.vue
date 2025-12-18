[file name]: NotFound.vue
[file content begin]
<template>
  <div class="not-found-container">
    <el-card class="not-found-card">
      <div class="error-content">
        <div class="error-icon">
          <i class="el-icon-warning-outline"></i>
        </div>
        <h1 class="error-code">404</h1>
        <h2 class="error-title">页面未找到</h2>
        <p class="error-message">抱歉，您访问的页面不存在或已被移除</p>
        <div class="error-actions">
          <el-button type="primary" @click="goBack">
            <i class="el-icon-back"></i> 返回上一页
          </el-button>
          <el-button @click="goHome">
            <i class="el-icon-house"></i> 返回首页
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'NotFound',
  setup() {
    const router = useRouter();

    const goBack = () => {
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push('/');
      }
    };

    const goHome = () => {
      // 检查用户是否登录，根据角色跳转到不同的首页
      const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');

      if (userRole) {
        switch (userRole) {
          case 'super_admin':
            router.push({ name: 'SuperAdminDashboard' });
            break;
          case 'institute_admin':
            router.push({ name: 'InstAdminDashboard' });
            break;
          case 'defense_leader':
            router.push({ name: 'DefenseLeaderDashboard' });
            break;
          case 'teacher':
            router.push({ name: 'TeacherDashboard' });
            break;
          default:
            router.push({ name: 'SuperAdminDashboard' });
        }
      } else {
        router.push({ name: 'login' });
      }
    };

    return {
      goBack,
      goHome
    };
  }
});
</script>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.not-found-card {
  width: 100%;
  max-width: 600px;
  text-align: center;
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.error-content {
  padding: 40px 20px;
}

.error-icon {
  font-size: 80px;
  color: #ffc107;
  margin-bottom: 20px;
}

.error-icon i {
  font-size: 80px;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: #f56c6c;
  margin: 0;
  line-height: 1;
  text-shadow: 3px 3px 0 rgba(0, 0, 0, 0.1);
}

.error-title {
  font-size: 32px;
  color: #303133;
  margin: 20px 0 10px;
  font-weight: 600;
}

.error-message {
  font-size: 18px;
  color: #606266;
  margin-bottom: 30px;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.error-actions .el-button {
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .error-code {
    font-size: 80px;
  }

  .error-title {
    font-size: 24px;
  }

  .error-message {
    font-size: 16px;
  }

  .error-actions {
    flex-direction: column;
    gap: 10px;
  }

  .error-actions .el-button {
    width: 100%;
  }
}
</style>