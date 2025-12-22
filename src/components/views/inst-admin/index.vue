<script lang="ts">
import { defineComponent } from 'vue';
import { ElMessage } from 'element-plus';

export default defineComponent({
  name: 'InstAdminIndex',
  data() {
    return {
      studentCount: 0,
      teacherCount: 0,
      defenseGroupCount: 0,
      completedDefenseCount: 0,
      currentSignature: '/api/signature/current.jpg',
      todos: [
        {
          content: '审核新加入的教师申请',
          time: '2024-01-15 10:30'
        },
        {
          content: '确认答辩分组名单',
          time: '2024-01-14 16:45'
        },
        {
          content: '上传本学期系主任签名',
          time: '2024-01-13 09:20'
        },
        {
          content: '安排下周期答辩时间',
          time: '2024-01-12 14:10'
        }
      ]
    }
  },
  methods: {
    // 加载统计数据
    loadStats() {
      // 这里可以调用对应的API接口
      // 暂时使用模拟数据
      this.studentCount = 120
      this.teacherCount = 45
      this.defenseGroupCount = 6
      this.completedDefenseCount = 12

      // 示例API调用（请根据实际API调整）
      // instituteApi.getInstituteStats().then((res: any) => {
      //   this.studentCount = res.data.studentCount
      //   this.teacherCount = res.data.teacherCount
      //   this.defenseGroupCount = res.data.defenseGroupCount
      //   this.completedDefenseCount = res.data.completedDefenseCount
      // })
    },

    // 处理待办事项
    handleTodo(row: any) {
      console.log('处理待办事项:', row)
      ElMessage.info(`正在处理: ${row.content}`)
    },

    // 导航到不同页面
    navigateTo(path: string) {
      this.$router.push(path)
    }
  },
  mounted() {
    this.loadStats()
  }
})
</script>

<template>
  <div class="page-content">
    <div class="page-title">
      <h2>计算机学院 - 管理控制台</h2>
      <p class="subtitle">管理本学院的学生、教师、答辩分组和答辩安排</p>
    </div>

    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card" @click="navigateTo('/inst-admin/student-list')">
          <div class="stat-icon" style="background: #36a3f7;">
            <i class="el-icon-user-solid"></i>
          </div>
          <div class="stat-content">
            <h3>{{ studentCount }}</h3>
            <p>本院学生</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" @click="navigateTo('/inst-admin/teacher-list')">
          <div class="stat-icon" style="background: #34bfa3;">
            <i class="el-icon-s-custom"></i>
          </div>
          <div class="stat-content">
            <h3>{{ teacherCount }}</h3>
            <p>本院教师</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" @click="navigateTo('/inst-admin/group-list')">
          <div class="stat-icon" style="background: #f4516c;">
            <i class="el-icon-s-operation"></i>
          </div>
          <div class="stat-content">
            <h3>{{ defenseGroupCount }}</h3>
            <p>答辩小组</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" @click="navigateTo('/inst-admin/defense-arrangement')">
          <div class="stat-icon" style="background: #ffb822;">
            <i class="el-icon-finished"></i>
          </div>
          <div class="stat-content">
            <h3>{{ completedDefenseCount }}</h3>
            <p>已完成答辩</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快速操作 -->
    <el-row :gutter="20" class="quick-actions">
      <el-col :span="8">
        <el-card class="quick-card" @click="navigateTo('/inst-admin/student-import')">
          <i class="el-icon-upload" style="color: #36a3f7;"></i>
          <h3>导入学生</h3>
          <p>批量导入学生数据</p>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="quick-card" @click="navigateTo('/inst-admin/teacher-import')">
          <i class="el-icon-user-add" style="color: #34bfa3;"></i>
          <h3>导入教师</h3>
          <p>批量导入教师数据</p>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="quick-card" @click="navigateTo('/inst-admin/group-create')">
          <i class="el-icon-plus" style="color: #f4516c;"></i>
          <h3>创建小组</h3>
          <p>创建答辩小组</p>
        </el-card>
      </el-col>
    </el-row>

    <!-- 待办事项 -->
    <el-card class="todo-card">
      <template #header>
        <span class="todo-header"><i class="el-icon-alarm-clock"></i> 待处理事项</span>
      </template>
      <el-table :data="todos" style="width: 100%">
        <el-table-column prop="content" label="事项内容" />
        <el-table-column prop="time" label="创建时间" width="180" />
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button type="text" size="small" @click="handleTodo(scope.row)">处理</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 权限说明 -->
    <el-card class="role-info">
      <h3><i class="el-icon-info"></i> 院系管理员权限说明</h3>
      <p>您作为计算机学院的院系管理员，拥有以下管理权限：</p>
      <ul>
        <li>管理本学院的学生信息（包含导入学生数据）</li>
        <li>管理本学院的教师信息（包含导入学生数据）</li>
        <li>进行答辩分组，分配学生到不同的答辩小组</li>
        <li>指定答辩小组组长（每个教师只能参加一个答辩小组）</li>
        <li>上传和管理系主任签名图片</li>
        <li>安排和组织本学院的答辩活动</li>
        <li>查看本学院的答辩统计数据</li>
      </ul>
      <div class="signature-info" v-if="currentSignature">
        <p><strong>当前系主任签名：</strong></p>
        <img :src="currentSignature" alt="系主任签名" style="max-width: 200px; border: 1px solid #ddd; padding: 5px;"/>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
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
  margin-bottom: 30px;
}

.todo-header {
  font-weight: bold;
  color: #333;
}

.todo-header i {
  margin-right: 8px;
  color: #f4516c;
}

.role-info {
  margin-top: 30px;
  border-left: 4px solid #f4516c;
}

.role-info h3 {
  color: #f4516c;
}

.role-info ul {
  margin-top: 15px;
  color: #666;
  padding-left: 20px;
}

.role-info ul li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.signature-info {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
}

.signature-info p {
  margin-bottom: 10px;
  font-weight: bold;
}

.signature-info img {
  border-radius: 4px;
}
</style>