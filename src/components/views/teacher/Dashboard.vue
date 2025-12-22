<template>
  <div class="teacher-dashboard">
    <el-header class="header" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
      <div class="header-left">
        <span class="system-title">答辩管理系统 -教师端</span>
      </div>
      <div class="header-right">
        <span class="welcome">欢迎，李老师 (教师编号: T1001)</span>
        <el-button type="text" @click="logout">退出登录</el-button>
      </div>
    </el-header>

    <el-container class="main-container">
      <el-aside width="250px" class="sidebar">
        <div class="teacher-info">
          <div class="teacher-avatar">
            <i class="el-icon-user"></i>
          </div>
          <div class="teacher-details">
            <p class="teacher-name">李老师</p>
            <p class="teacher-id">编号: T1001</p>
            <p class="teacher-dept">计算机学院</p>
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
            <span>教师工作台</span>
          </el-menu-item>
          <el-submenu index="2">
            <template #title>
              <i class="el-icon-guide"></i>
              <span>指导学生</span>
            </template>
            <el-menu-item index="2-1">我的学生</el-menu-item>
            <el-menu-item index="2-2">论文指导</el-menu-item>
            <el-menu-item index="2-3">进度跟踪</el-menu-item>
          </el-submenu>
          <el-submenu index="3">
            <template #title>
              <i class="el-icon-document-checked"></i>
              <span>答辩相关</span>
            </template>
            <el-menu-item index="3-1">答辩通知</el-menu-item>
            <el-menu-item index="3-2">评审任务</el-menu-item>
            <el-menu-item index="3-3">评分记录</el-menu-item>
          </el-submenu>
          <el-menu-item index="4">
            <i class="el-icon-data-analysis"></i>
            <span>数据统计</span>
          </el-menu-item>
          <el-menu-item index="5">
            <i class="el-icon-message"></i>
            <span>消息通知</span>
            <el-badge :value="3" class="badge-item" />
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main class="content">
        <div class="page-title">
          <h2>教师工作台</h2>
          <p class="subtitle">欢迎使用答辩管理系统教师端，查看您的教学和答辩相关任务</p>
        </div>

        <el-row :gutter="20" class="teacher-stats">
          <el-col :span="12">
            <el-card class="my-student-card">
              <div class="card-header">
                <i class="el-icon-guide"></i>
                <h3>我的学生</h3>
              </div>
              <div class="student-list">
                <div class="student-item" v-for="i in 3" :key="i">
                  <span class="student-name">学生 {{ i }}</span>
                  <span class="student-status" :class="getStatusClass(i)">{{ getStatusText(i) }}</span>
                </div>
              </div>
              <el-button type="text" class="view-all">查看全部学生 →</el-button>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="task-card">
              <div class="card-header">
                <i class="el-icon-tickets"></i>
                <h3>待办任务</h3>
              </div>
              <div class="task-list">
                <div class="task-item">
                  <el-checkbox></el-checkbox>
                  <span class="task-text">审阅学生张三的论文初稿</span>
                  <span class="task-date">今天</span>
                </div>
                <div class="task-item">
                  <el-checkbox></el-checkbox>
                  <span class="task-text">参加5月20日答辩会议</span>
                  <span class="task-date">明天</span>
                </div>
                <div class="task-item">
                  <el-checkbox></el-checkbox>
                  <span class="task-text">提交王五的答辩评分</span>
                  <span class="task-date">本周内</span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-card class="notice-card">
          <div class="notice-header">
            <i class="el-icon-message-solid" style="color: #e6a23c;"></i>
            <h3>最新通知</h3>
          </div>
          <div class="notice-list">
            <div class="notice-item" v-for="(notice, index) in notices" :key="index">
              <div class="notice-title">
                <span class="notice-icon" :class="notice.type">{{ notice.icon }}</span>
                {{ notice.title }}
              </div>
              <div class="notice-content">{{ notice.content }}</div>
              <div class="notice-time">{{ notice.time }}</div>
            </div>
          </div>
        </el-card>

        <div class="teacher-tips">
          <el-alert
            title="教师权限说明"
            type="success"
            :closable="false"
            description="您作为普通教师，可以指导自己的学生、参与答辩评审、查看相关通知等。如需成为答辩组长，请联系院系管理员。"
          />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'TeacherDashboard',
  setup() {
    const notices = ref([
      {
        type: 'important',
        icon: '⚠️',
        title: '2024年春季答辩时间安排',
        content: '本学期答辩将于5月20日-25日进行，请提前做好准备。',
        time: '2024-05-10'
      },
      {
        type: 'normal',
        icon: '📢',
        title: '论文提交截止提醒',
        content: '请指导学生于5月15日前完成论文最终版提交。',
        time: '2024-05-08'
      },
      {
        type: 'normal',
        icon: '📝',
        title: '答辩评审工作说明会',
        content: '请全体教师参加5月12日的答辩评审工作说明会。',
        time: '2024-05-05'
      }
    ]);

    const getStatusClass = (index: number) => {
      const classes = ['status-writing', 'status-reviewing', 'status-defense'];
      return classes[index % 3];
    };

    const getStatusText = (index: number) => {
      const texts = ['论文撰写中', '论文评审中', '准备答辩'];
      return texts[index % 3];
    };

    return {
      notices,
      getStatusClass,
      getStatusText
    };
  },
  mounted() {
    console.log('普通教师Dashboard已加载');
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
.teacher-dashboard {
  height: 100vh;
  background-color: #f0f2f5;
}

.teacher-info {
  padding: 20px;
  background: #1f2d3d;
  color: white;
  text-align: center;
  border-bottom: 1px solid #2d3a4b;
}

.teacher-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #43e97b;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  font-size: 28px;
}

.teacher-details .teacher-name {
  font-size: 18px;
  font-weight: bold;
  margin: 5px 0;
}

.teacher-details .teacher-id,
.teacher-details .teacher-dept {
  font-size: 12px;
  color: #ccc;
  margin: 3px 0;
}

.badge-item {
  margin-left: 10px;
}

.teacher-stats {
  margin-bottom: 20px;
}

.my-student-card,
.task-card {
  height: 300px;
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.card-header i {
  font-size: 24px;
  margin-right: 10px;
  color: #43e97b;
}

.card-header h3 {
  margin: 0;
  color: #333;
}

.student-list {
  margin-bottom: 15px;
}

.student-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.student-name {
  color: #333;
}

.student-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
}

.status-writing {
  background: #ffe8e6;
  color: #f56c6c;
}

.status-reviewing {
  background: #f0f9ff;
  color: #409eff;
}

.status-defense {
  background: #f0f9eb;
  color: #67c23a;
}

.view-all {
  display: block;
  text-align: center;
  margin-top: 10px;
  color: #409eff;
}

.task-list .task-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.task-text {
  flex: 1;
  margin-left: 10px;
  color: #333;
}

.task-date {
  font-size: 12px;
  color: #999;
}

.notice-card {
  margin-bottom: 20px;
}

.notice-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.notice-header i {
  font-size: 24px;
  margin-right: 10px;
}

.notice-header h3 {
  margin: 0;
  color: #333;
}

.notice-item {
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.notice-item:last-child {
  border-bottom: none;
}

.notice-title {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

.notice-icon {
  margin-right: 10px;
}

.notice-icon.important {
  color: #e6a23c;
}

.notice-content {
  color: #666;
  font-size: 14px;
  margin-left: 24px;
}

.notice-time {
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.teacher-tips {
  margin-top: 20px;
}
</style>