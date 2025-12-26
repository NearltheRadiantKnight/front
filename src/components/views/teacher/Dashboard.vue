<template>
  <div class="teacher-dashboard">
    <!-- 导航栏 -->
    <el-header class="header">
      <div class="header-left">
        <span class="system-title">答辩管理系统 - 教师端</span>
      </div>
      <div class="header-right">
        <el-tag type="success">教师</el-tag>
        <span class="welcome">欢迎，{{ teacherInfo.name }}</span>
        <el-button type="text" @click="logout">退出登录</el-button>
      </div>
    </el-header>

    <!-- 主要内容 -->
    <el-container class="main-container">
      <!-- 侧边栏 -->
      <el-aside width="280px" class="sidebar">
        <div class="user-info">
          <div class="avatar">
            <i class="el-icon-user-solid"></i>
          </div>
          <div class="info">
            <p class="name">{{ teacherInfo.name }}</p>
            <p class="dept">{{ teacherInfo.department }}</p>
            <p class="time">登录时间: {{ loginTime }}</p>
          </div>
        </div>

        <el-menu
            active-text-color="#ffd04b"
            background-color="#304156"
            text-color="#fff"
            class="sidebar-menu"
            router
            :default-active="$route.path"
        >
          <div class="menu-title">教师工作台</div>

          <el-submenu index="1">
            <el-menu-item index="/teacher/studentList">
              <i class="el-icon-user"></i>
              <span>指导学生列表</span>
            </el-menu-item>
            <el-menu-item index="/teacher/reviewStudent">
              <i class="el-icon-user"></i>
              <span>答辩组学生</span>
            </el-menu-item>
            <el-menu-item index="/teacher/signature-upload">
              <i class="el-icon-picture"></i>
              <span>上传签名</span>
            </el-menu-item>
            <el-menu-item index="/teacher/passwordModify">
              <i class="el-icon-setting"></i>
              <span>修改密码</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>

      <el-main class="content">
        <router-view/>
      </el-main>
    </el-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { ElMessageBox } from 'element-plus';

export default defineComponent({
  name: 'TeacherDashboard',
  setup() {
    const teacherInfo = ref({
      name: '李老师',
      department: '计算机科学与技术学院',
      teacherId: 'T1001'
    });

    const loginTime = ref('');

    onMounted(() => {
      console.log('教师Dashboard已加载');
      loginTime.value = new Date().toLocaleString();
      // 从API加载教师信息
      // loadTeacherInfo();
    });

    const logout = () => {
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        localStorage.clear();
        window.location.href = '/login';
      });
    };

    return {
      teacherInfo,
      loginTime,
      logout
    };
  }
});
</script>

<style scoped>
.teacher-dashboard {
  height: 100vh;
  background-color: #f0f2f5;
}

.header {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.system-title {
  font-size: 20px;
  font-weight: bold;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.welcome {
  font-size: 14px;
}

.main-container {
  height: calc(100vh - 60px);
}

.sidebar {
  background-color: #304156;
  box-shadow: 2px 0 6px rgba(0,21,41,.35);
  overflow-y: auto;
}

.user-info {
  padding: 20px;
  background: #1f2d3d;
  color: white;
  text-align: center;
  border-bottom: 1px solid #2d3a4b;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  font-size: 28px;
}

.info .name {
  font-size: 16px;
  font-weight: bold;
  margin: 5px 0;
}

.info .role {
  font-size: 12px;
  color: #ccc;
  margin: 3px 0;
  background: #67C23A;
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-block;
}

.info .dept {
  font-size: 12px;
  color: #ccc;
  margin: 5px 0;
}

.info .time {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.menu-title {
  color: #fff;
  padding: 20px;
  font-size: 16px;
  font-weight: bold;
  border-bottom: 1px solid #1f2d3d;
  background: #2d3a4b;
}

.sidebar-menu {
  border-right: none;
}

.content {
  padding: 20px;
  overflow-y: auto;
}
</style>