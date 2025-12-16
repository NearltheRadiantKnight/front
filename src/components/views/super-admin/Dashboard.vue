<template>
  <div class="super-admin-dashboard">
    <!-- 导航栏 -->
    <el-header class="header">
      <div class="header-left">
        <span class="system-title">答辩管理系统 - 超级管理员</span>
      </div>
      <div class="header-right">
        <span class="welcome">欢迎，超级管理员</span>
        <el-button type="text" @click="logout">退出登录</el-button>
      </div>
    </el-header>

    <!-- 主要内容 -->
    <el-container class="main-container">
      <!-- 侧边栏 -->
      <el-aside width="250px" class="sidebar">
        <el-menu
          active-text-color="#ffd04b"
          background-color="#304156"
          text-color="#fff"
          class="sidebar-menu"
          default-active="1"
        >
          <div class="menu-title">管理功能</div>
          <el-menu-item index="1">
            <i class="el-icon-s-home"></i>
            <span>首页概览</span>
          </el-menu-item>
          <el-submenu index="2">
            <template #title>
              <i class="el-icon-office-building"></i>
              <span>院系管理</span>
            </template>
            <el-menu-item index="2-1">创建院系</el-menu-item>
            <el-menu-item index="2-2">院系列表</el-menu-item>
          </el-submenu>
          <el-submenu index="3">
            <template #title>
              <i class="el-icon-user"></i>
              <span>管理员管理</span>
            </template>
            <el-menu-item index="3-1">创建院系管理员</el-menu-item>
            <el-menu-item index="3-2">管理员列表</el-menu-item>
          </el-submenu>
          <el-menu-item index="4">
            <i class="el-icon-setting"></i>
            <span>系统设置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 内容区域 -->
      <el-main class="content">
        <div class="page-title">
          <h2>超级管理员控制台</h2>
          <p class="subtitle">您拥有系统的最高权限，可以管理所有院系和管理员</p>
        </div>

        <el-row :gutter="20" class="stats-row">
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-icon" style="background: #409EFF;">
                <i class="el-icon-office-building"></i>
              </div>
              <div class="stat-content">
                <h3>10</h3>
                <p>院系数量</p>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-icon" style="background: #67C23A;">
                <i class="el-icon-user"></i>
              </div>
              <div class="stat-content">
                <h3>25</h3>
                <p>院系管理员</p>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-icon" style="background: #E6A23C;">
                <i class="el-icon-s-custom"></i>
              </div>
              <div class="stat-content">
                <h3>150</h3>
                <p>教师总数</p>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-icon" style="background: #F56C6C;">
                <i class="el-icon-medal"></i>
              </div>
              <div class="stat-content">
                <h3>15</h3>
                <p>答辩组长</p>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-card class="welcome-card">
          <h3>欢迎使用答辩管理系统</h3>
          <p>您作为超级管理员，可以执行以下操作：</p>
          <ul>
            <li>创建和管理院系</li>
            <li>设置院系管理员账号</li>
            <li>查看系统整体运行情况</li>
            <li>进行系统级配置</li>
          </ul>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ElMessageBox } from 'element-plus';

export default defineComponent({
  name: 'SuperAdminDashboard',
  mounted() {
    console.log('超级管理员Dashboard已加载');
  },
  methods: {
    logout() {
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        localStorage.clear();
        this.$router.push('/');
      });
    }
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

.welcome {
  margin-right: 20px;
}

.main-container {
  height: calc(100vh - 60px);
}

.sidebar {
  background-color: #304156;
  box-shadow: 2px 0 6px rgba(0,21,41,.35);
}

.menu-title {
  color: #fff;
  padding: 20px;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #1f2d3d;
}

.sidebar-menu {
  border-right: none;
}

.content {
  padding: 20px;
}

.page-title h2 {
  color: #333;
  margin-bottom: 10px;
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

.welcome-card {
  margin-top: 20px;
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.welcome-card h3 {
  color: #333;
  margin-bottom: 15px;
}

.welcome-card ul {
  margin: 15px 0 0 20px;
  color: #666;
}

.welcome-card li {
  margin-bottom: 8px;
}
</style>