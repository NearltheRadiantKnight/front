<template>
  <div class="page-content">
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
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DefenseLeaderHome',
  data() {
    return {
      // 这里可以添加数据
    }
  },
  methods: {
    // 这里可以添加方法
  },
  mounted() {
    console.log('答辩组长首页已加载')
  }
})
</script>

<style scoped>
.page-content {
  padding: 20px;
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
</style>