<template>
  <div class="defense-leader-dashboard">
    <el-header class="header" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
      <div class="header-left">
        <span class="system-title">答辩管理系统 - 答辩组长</span>
      </div>
      <div class="header-right">
        <div class="leader-badge">
          <i class="el-icon-medal"></i>
          <span>答辩组长 (2024年度)</span>
        </div>
        <span class="welcome">欢迎，张教授</span>
        <el-button type="text" @click="logout">退出登录</el-button>
      </div>
    </el-header>

    <el-container class="main-container">
      <el-aside width="250px" class="sidebar">
        <div class="leader-info">
          <div class="avatar">
            <i class="el-icon-user-solid"></i>
          </div>
          <div class="info">
            <p class="name">张教授</p>
            <p class="department">计算机学院</p>
            <p class="year">2024年度答辩组长</p>
          </div>
        </div>
        <el-menu
          active-text-color="#ffd04b"
          background-color="#304156"
          text-color="#fff"
          class="sidebar-menu"
        >
          <el-menu-item index="1">
            <i class="el-icon-s-home"></i>
            <span>答辩工作台</span>
          </el-menu-item>
          <el-menu-item index="2">
            <i class="el-icon-notebook-2"></i>
            <span>学生分组</span>
          </el-menu-item>
          <el-submenu index="3">
            <template #title>
              <i class="el-icon-document"></i>
              <span>答辩评审</span>
            </template>
            <el-menu-item index="3-1">待评审论文</el-menu-item>
            <el-menu-item index="3-2">评审记录</el-menu-item>
            <el-menu-item index="3-3">评分汇总</el-menu-item>
          </el-submenu>
          <el-menu-item index="4">
            <i class="el-icon-chat-line-round"></i>
            <span>答辩会议</span>
          </el-menu-item>
          <el-menu-item index="5">
            <i class="el-icon-finished"></i>
            <span>结果提交</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main class="content">
        <div class="page-title">
          <h2>答辩组长工作台</h2>
          <p class="subtitle">作为2024年度答辩组长，负责组织和管理本年度答辩工作</p>
        </div>

        <div class="alert-card">
          <el-alert
            title="答辩组长职责"
            type="info"
            description="您作为答辩组长，需要负责组织答辩小组、分配评审任务、主持答辩会议、审核答辩结果等工作。"
            show-icon
            :closable="false"
          />
        </div>

        <el-row :gutter="20" class="stats-row">
          <el-col :span="8">
            <el-card class="task-card">
              <div class="task-header">
                <i class="el-icon-bell" style="color: #ff9800;"></i>
                <span>待办事项</span>
              </div>
              <div class="task-content">
                <p><span class="task-count">5</span> 个待分组学生</p>
                <p><span class="task-count">3</span> 场待安排答辩</p>
                <p><span class="task-count">8</span> 份待评审论文</p>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="task-card">
              <div class="task-header">
                <i class="el-icon-timer" style="color: #2196f3;"></i>
                <span>进行中</span>
              </div>
              <div class="task-content">
                <p><span class="task-count">2</span> 个答辩小组</p>
                <p><span class="task-count">15</span> 名答辩学生</p>
                <p><span class="task-count">4</span> 位评审教师</p>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="task-card">
              <div class="task-header">
                <i class="el-icon-circle-check" style="color: #4caf50;"></i>
                <span>已完成</span>
              </div>
              <div class="task-content">
                <p><span class="task-count">3</span> 场答辩会议</p>
                <p><span class="task-count">20</span> 份已评审论文</p>
                <p><span class="task-count">18</span> 个答辩结果</p>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-card class="quick-action">
          <h3>快速操作</h3>
          <el-row :gutter="20" class="action-buttons">
            <el-col :span="6">
              <el-button type="primary" icon="el-icon-plus" class="action-btn">创建答辩小组</el-button>
            </el-col>
            <el-col :span="6">
              <el-button type="success" icon="el-icon-date" class="action-btn">安排答辩时间</el-button>
            </el-col>
            <el-col :span="6">
              <el-button type="warning" icon="el-icon-document" class="action-btn">开始论文评审</el-button>
            </el-col>
            <el-col :span="6">
              <el-button type="info" icon="el-icon-finished" class="action-btn">提交答辩结果</el-button>
            </el-col>
          </el-row>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DefenseLeaderDashboard',
  mounted() {
    console.log('答辩组长Dashboard已加载');
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
.defense-leader-dashboard {
  height: 100vh;
  background-color: #f5f7fa;
}

.leader-info {
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
  background: #4facfe;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  font-size: 28px;
}

.info .name {
  font-size: 18px;
  font-weight: bold;
  margin: 5px 0;
}

.info .department, .info .year {
  font-size: 12px;
  color: #ccc;
  margin: 3px 0;
}

.leader-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  padding: 5px 10px;
  border-radius: 20px;
  margin-right: 20px;
}

.leader-badge i {
  margin-right: 5px;
  color: gold;
}

.alert-card {
  margin-bottom: 20px;
}

.task-card {
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  height: 180px;
}

.task-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.task-header i {
  font-size: 20px;
  margin-right: 10px;
}

.task-content p {
  margin: 12px 0;
  color: #666;
}

.task-count {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-right: 10px;
}

.quick-action {
  margin-top: 30px;
}

.action-buttons {
  margin-top: 20px;
}

.action-btn {
  width: 100%;
  height: 80px;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.action-btn i {
  font-size: 24px;
  margin-bottom: 8px;
}
</style>