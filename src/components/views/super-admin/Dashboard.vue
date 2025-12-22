<template>
  <div class="super-admin-dashboard">
    <!-- 导航栏 -->
    <el-header class="header">
      <div class="header-left">
        <span class="system-title">答辩管理系统 - 超级管理员</span>
      </div>
      <div class="header-right">
        <el-tag type="success">超级管理员</el-tag>
        <span class="welcome">欢迎，{{ adminName }}</span>
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
            <p class="name">{{ adminName }}</p>
            <p class="role">超级管理员</p>
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
        <div class="menu-title">系统管理</div>

        <el-menu-item index="/admin">
          <i class="el-icon-s-home"></i>
          <span>首页概览</span>
        </el-menu-item>

        <el-menu-item index="/admin/institute">
          <i class="el-icon-office-building"></i>
          <span>院系管理</span>
        </el-menu-item>

        <el-menu-item index="/admin/adminlist">
          <i class="el-icon-user"></i>
          <span>管理员管理</span>
        </el-menu-item>

        <el-menu-item index="/admin/evaluation">
          <i class="el-icon-edit"></i>
          <span>评价指标管理</span>
        </el-menu-item>

          <el-menu-item index="/year">
            <i class="el-icon-date"></i>
            <span>答辩年份管理</span>
          </el-menu-item>

          <el-menu-item index="/template">
            <i class="el-icon-document"></i>
            <span>文档模板管理</span>
          </el-menu-item>

          <el-menu-item index="/date">
            <i class="el-icon-time"></i>
            <span>日期设置</span>
          </el-menu-item>

          <el-menu-item index="/ai">
            <i class="el-icon-cpu"></i>
            <span>AI配置</span>
          </el-menu-item>

          <el-menu-item index="/system">
            <i class="el-icon-setting"></i>
            <span>系统设置</span>
          </el-menu-item>
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
  name: 'SuperAdminDashboard',
  computed: {
  },
  components: {
  },
  setup() {

    const adminName = ref('超级管理员');
    const loginTime = ref('');

    onMounted(() => {
      console.log('超级管理员Dashboard已加载');
      loginTime.value = new Date().toLocaleString();
      // loadStats(); 加载数据
    });

    const logout = () => {
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        localStorage.clear();
        window.location.href = '/';
      });
    };

    return {
      adminName,
      loginTime,
      logout
    };
  }
});
</script>

<style scoped>
.super-admin-dashboard {
  height: 100vh;
  background-color: #f0f2f5;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  background: #409EFF;
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-block;
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

.page-content {
  height: 100%;
}

.page-title h2 {
  color: #333;
  margin-bottom: 10px;
  font-size: 24px;
}

.subtitle {
  color: #666;
  margin-bottom: 30px;
}

.stats-row {
  margin-bottom: 30px;
}

.stat-card {
  text-align: center;
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  transition: transform 0.3s;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  color: white;
  font-size: 24px;
}

.stat-content h3 {
  font-size: 28px;
  margin: 0 0 5px 0;
  color: #333;
}

.stat-content p {
  color: #666;
  margin: 0;
}

.quick-actions {
  margin-bottom: 30px;
}

.quick-card {
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  text-align: center;
  padding: 30px 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.quick-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0,0,0,0.15);
}

.quick-card i {
  font-size: 36px;
  margin-bottom: 15px;
}

.quick-card h3 {
  margin: 10px 0;
  color: #333;
}

.quick-card p {
  color: #666;
  margin: 0;
}

.todo-card {
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.todo-header {
  font-weight: bold;
  color: #333;
}

.todo-header i {
  margin-right: 8px;
  color: #409EFF;
}
</style>
