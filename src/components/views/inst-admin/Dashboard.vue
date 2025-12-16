<template>
  <div class="inst-admin-dashboard">
    <el-header class="header" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
      <div class="header-left">
        <span class="system-title">答辩管理系统 - 院系管理员</span>
      </div>
      <div class="header-right">
        <span class="welcome">欢迎，计算机学院管理员</span>
        <el-button type="text" @click="logout">退出登录</el-button>
      </div>
    </el-header>

    <el-container class="main-container">
      <el-aside width="250px" class="sidebar">
        <div class="institute-info">
          <i class="el-icon-school"></i>
          <span>计算机学院</span>
        </div>
        <el-menu
          active-text-color="#ffd04b"
          background-color="#304156"
          text-color="#fff"
          class="sidebar-menu"
        >
          <el-menu-item index="1">
            <i class="el-icon-s-home"></i>
            <span>院系概览</span>
          </el-menu-item>
          <el-submenu index="2">
            <template #title>
              <i class="el-icon-s-custom"></i>
              <span>教师管理</span>
            </template>
            <el-menu-item index="2-1">教师列表</el-menu-item>
            <el-menu-item index="2-2">添加教师</el-menu-item>
          </el-submenu>
          <el-submenu index="3">
            <template #title>
              <i class="el-icon-medal"></i>
              <span>答辩组长</span>
            </template>
            <el-menu-item index="3-1">设置答辩组长</el-menu-item>
            <el-menu-item index="3-2">组长列表</el-menu-item>
          </el-submenu>
          <el-menu-item index="4">
            <i class="el-icon-tickets"></i>
            <span>答辩安排</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main class="content">
        <div class="page-title">
          <h2>计算机学院 - 管理控制台</h2>
          <p class="subtitle">管理本学院的教师、答辩组长和答辩安排</p>
        </div>

        <el-row :gutter="20" class="stats-row">
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-icon" style="background: #36a3f7;">
                <i class="el-icon-s-custom"></i>
              </div>
              <div class="stat-content">
                <h3>45</h3>
                <p>本院教师</p>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-icon" style="background: #34bfa3;">
                <i class="el-icon-medal"></i>
              </div>
              <div class="stat-content">
                <h3>3</h3>
                <p>答辩组长</p>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-icon" style="background: #f4516c;">
                <i class="el-icon-date"></i>
              </div>
              <div class="stat-content">
                <h3>8</h3>
                <p>待安排答辩</p>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-icon" style="background: #ffb822;">
                <i class="el-icon-finished"></i>
              </div>
              <div class="stat-content">
                <h3>12</h3>
                <p>已完成答辩</p>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-card class="role-info">
          <h3><i class="el-icon-info"></i> 院系管理员权限说明</h3>
          <p>您作为计算机学院的院系管理员，拥有以下管理权限：</p>
          <ul>
            <li>管理本学院的教师信息</li>
            <li>为本学院教师设置答辩组长身份</li>
            <li>安排和组织本学院的答辩活动</li>
            <li>查看本学院的答辩统计数据</li>
          </ul>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'InstAdminDashboard',
  mounted() {
    console.log('院系管理员Dashboard已加载');
  },
  methods: {
    logout() {
      localStorage.clear();
      this.$router.push('/');
    }
  }
});
</script>

<style scoped>
.inst-admin-dashboard {
  height: 100vh;
  background-color: #f8f9fa;
}

.institute-info {
  padding: 20px;
  background: #1f2d3d;
  color: white;
  font-size: 16px;
  text-align: center;
  border-bottom: 1px solid #2d3a4b;
}

.institute-info i {
  margin-right: 10px;
  font-size: 18px;
}

.role-info {
  margin-top: 30px;
  border-left: 4px solid #f5576c;
}

.role-info h3 {
  color: #f5576c;
}

.role-info ul {
  margin-top: 15px;
  color: #666;
}

/* 继承基础样式 */
.header, .main-container, .sidebar, .content, .stats-row, .stat-card {
  /* 复用超级管理员的基础样式 */
}
</style>