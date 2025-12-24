<template>
  <div class="page-content">
    <div class="page-title">
      <h2>{{ instituteName }} - 管理控制台</h2>
      <p class="subtitle">管理本院系的学生、教师和答辩活动</p>
    </div>

    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card" @click="navigateTo('/inst-admin/students')">
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
        <el-card class="stat-card" @click="navigateTo('/inst-admin/teachers')">
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
        <el-card class="stat-card" @click="navigateTo('/inst-admin/defense')">
          <div class="stat-icon" style="background: #f4516c;">
            <i class="el-icon-s-operation"></i>
          </div>
          <div class="stat-content">
            <h3>{{ defenseYearCount }}</h3>
            <p>答辩年份</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" @click="navigateTo('/inst-admin/defense')">
          <div class="stat-icon" style="background: #ffb822;">
            <i class="el-icon-finished"></i>
          </div>
          <div class="stat-content">
            <h3>{{ groupCount }}</h3>
            <p>答辩小组</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快速操作 -->
    <el-row :gutter="20" class="quick-actions">
      <el-col :span="8">
        <el-card class="quick-card" @click="navigateTo('/inst-admin/students')">
          <i class="el-icon-edit" style="color: #36a3f7;"></i>
          <h3>管理学生</h3>
          <p>查看、编辑学生信息</p>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="quick-card" @click="navigateTo('/inst-admin/teachers')">
          <i class="el-icon-edit" style="color: #34bfa3;"></i>
          <h3>管理教师</h3>
          <p>查看、编辑教师信息</p>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="quick-card" @click="navigateTo('/inst-admin/defense')">
          <i class="el-icon-edit" style="color: #f4516c;"></i>
          <h3>答辩管理</h3>
          <p>管理答辩年份和小组</p>
        </el-card>
      </el-col>
    </el-row>

    <!-- 待办事项 -->
    <el-card class="todo-card" v-if="todos.length > 0">
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
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import request from '@/api';

export default defineComponent({
  name: 'InstAdminIndex',
  setup() {
    const router = useRouter();

    const instituteName = ref('计算机学院');
    const studentCount = ref(0);
    const teacherCount = ref(0);
    const defenseYearCount = ref(0);
    const groupCount = ref(0);
    const todos = ref([] as any[]);

    // 加载统计数据
    const loadStats = async () => {
      try {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
          const info = JSON.parse(userInfo);
          instituteName.value = info.institute_name || info.department || '计算机学院';

          // 加载统计数据
          const response = await request.get('/inst-admin/stats', {
            params: { institute_id: info.institute_id || info.instId || 1 }
          });

          if (response.code === 200) {
            const data = response.data;
            studentCount.value = data.student_count || data.studentCount || 0;
            teacherCount.value = data.teacher_count || data.teacherCount || 0;
            defenseYearCount.value = data.defense_year_count || data.defenseYearCount || 0;
            groupCount.value = data.group_count || data.groupCount || 0;
            todos.value = data.todos || [];
          }
        }
      } catch (error) {
        console.error('加载统计数据失败:', error);
        studentCount.value = 120;
        teacherCount.value = 45;
        defenseYearCount.value = 3;
        groupCount.value = 6;
        todos.value = [
          { content: '审核新加入的教师申请', time: new Date().toLocaleDateString() },
          { content: '确认答辩分组名单', time: new Date().toLocaleDateString() }
        ];
      }
    };

    // 处理待办事项
    const handleTodo = (row: any) => {
      console.log('处理待办事项:', row);
      ElMessage.info(`正在处理: ${row.content}`);
    };

    // 导航到不同页面
    const navigateTo = (path: string) => {
      router.push(path);
    };

    onMounted(() => {
      loadStats();
    });

    return {
      instituteName,
      studentCount,
      teacherCount,
      defenseYearCount,
      groupCount,
      todos,
      handleTodo,
      navigateTo
    };
  }
});
</script>

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
</style>