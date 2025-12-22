<template>
  <div class="page-content">
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
        <div class="notice-item">
          <div class="notice-title">
            <span class="notice-icon important">⚠️</span>
            2024年春季答辩时间安排
          </div>
          <div class="notice-content">本学期答辩将于5月20日-25日进行，请提前做好准备。</div>
          <div class="notice-time">2024-05-10</div>
        </div>
        <div class="notice-item">
          <div class="notice-title">
            <span class="notice-icon">📢</span>
            论文提交截止提醒
          </div>
          <div class="notice-content">请指导学生于5月15日前完成论文最终版提交。</div>
          <div class="notice-time">2024-05-08</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TeacherHome',
  data() {
    return {
      // 这里可以添加数据
    }
  },
  methods: {
    getStatusClass(index: number) {
      const classes = ['status-writing', 'status-reviewing', 'status-defense']
      return classes[index % 3]
    },
    getStatusText(index: number) {
      const texts = ['论文撰写中', '论文评审中', '准备答辩']
      return texts[index % 3]
    }
  },
  mounted() {
    console.log('普通教师首页已加载')
  }
})
</script>

<style scoped>
.page-content {
  padding: 20px;
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
</style>