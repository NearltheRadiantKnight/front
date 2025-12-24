<template>
  <div class="page-content">
    <div class="page-title">
      <h2>{{ instituteName }} - 管理控制台</h2>
      <p class="subtitle">管理本院系的学生、教师和答辩活动</p>
    </div>

    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
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
        <el-card class="stat-card">
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
        <el-card class="stat-card">
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
        <el-card class="stat-card">
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
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
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

    // 定时器ID
    let refreshTimer: number | null = null;

    // 加载统计数据
    const loadStats = async () => {
      try {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
          const info = JSON.parse(userInfo);
          instituteName.value = info.institute_name || info.department || '计算机学院';

          // 获取院系ID
          const instituteId = info.institute_id || info.instId || 1;

          // 尝试使用专用统计接口
          try {
            const statsRes = await request.get('/api/inst-admin/stats/simple', {
              params: { institute_id: instituteId }
            });

            if (statsRes.code === 200) {
              const data = statsRes.data;
              studentCount.value = data.studentCount || 0;
              teacherCount.value = data.teacherCount || 0;
              defenseYearCount.value = data.defenseYearCount || 0;
              groupCount.value = data.groupCount || 0;

              // 保存到本地存储
              saveToLocalStorage();
              return;
            }
          } catch (statsError) {
            console.log('专用统计接口不可用，尝试备用方案');
          }

          // 备用方案：分别请求各个数据
          await loadBackupStats(instituteId);
        }
      } catch (error) {
        console.error('加载统计数据失败:', error);
        loadFromLocalStorage();
      }
    };

    // 备用方案：分别加载各个统计数据
    const loadBackupStats = async (instituteId: number) => {
      try {
        // 并行请求所有数据
        const [studentRes, teacherRes] = await Promise.all([
          // 学生数量
          request.get('/api/students/list', {
            params: {
              institute_id: instituteId,
              page: 1,
              size: 1,
              search: ''
            }
          }).catch(() => ({ code: 500, data: { total: 0 } })),

          // 教师数量
          request.get('/api/teachers/count', {
            params: { institute_id: instituteId }
          }).catch(() => ({ code: 500, data: 0 }))
        ]);

        // 设置统计数据
        if (studentRes.code === 200 && studentRes.data) {
          studentCount.value = studentRes.data.total || 0;
        }

        if (teacherRes.code === 200) {
          teacherCount.value = teacherRes.data || 0;
        }

        // 答辩相关数据暂时设为0（如果没有对应接口）
        defenseYearCount.value = 0;
        groupCount.value = 0;

        // 保存到本地存储
        saveToLocalStorage();

      } catch (error) {
        console.error('备用方案加载失败:', error);
        loadFromLocalStorage();
      }
    };

    // 从本地存储加载数据
    const loadFromLocalStorage = () => {
      const storedData = localStorage.getItem('dashboard_stats');
      if (storedData) {
        const data = JSON.parse(storedData);
        studentCount.value = data.studentCount || 0;
        teacherCount.value = data.teacherCount || 0;
        defenseYearCount.value = data.defenseYearCount || 0;
        groupCount.value = data.groupCount || 0;
      } else {
        // 默认数据
        studentCount.value = 0;
        teacherCount.value = 0;
        defenseYearCount.value = 0;
        groupCount.value = 0;
      }
    };

    // 保存到本地存储
    const saveToLocalStorage = () => {
      localStorage.setItem('dashboard_stats', JSON.stringify({
        studentCount: studentCount.value,
        teacherCount: teacherCount.value,
        defenseYearCount: defenseYearCount.value,
        groupCount: groupCount.value,
        lastUpdate: new Date().toISOString()
      }));
    };

    // 导航到不同页面
    const navigateTo = (path: string) => {
      router.push(path);
    };

    // 开始自动刷新
    const startAutoRefresh = () => {
      // 每10分钟刷新一次数据
      refreshTimer = window.setInterval(() => {
        loadStats();
      }, 10 * 60 * 1000);
    };

    // 停止自动刷新
    const stopAutoRefresh = () => {
      if (refreshTimer) {
        window.clearInterval(refreshTimer);
        refreshTimer = null;
      }
    };

    onMounted(() => {
      loadStats();
      startAutoRefresh();
    });

    onUnmounted(() => {
      stopAutoRefresh();
    });

    return {
      instituteName,
      studentCount,
      teacherCount,
      defenseYearCount,
      groupCount,
      navigateTo
    };
  }
});
</script>

<style scoped>
.page-content {
  height: 100%;
  padding: 20px;
  background-color: #f5f7fa;
}

.page-title h2 {
  color: #303133;
  margin-bottom: 10px;
  font-size: 28px;
  font-weight: 500;
}

.subtitle {
  color: #909399;
  margin-bottom: 30px;
  font-size: 14px;
}

.stats-row {
  margin-bottom: 30px;
}

.stat-card {
  text-align: center;
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  padding: 20px 0;
  cursor: default;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.12);
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
  font-size: 32px;
  margin: 0 0 5px 0;
  color: #303133;
  font-weight: 600;
}

.stat-content p {
  color: #606266;
  margin: 0;
  font-size: 14px;
}

.quick-actions {
  margin-top: 30px;
}

.quick-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  text-align: center;
  padding: 30px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.quick-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}

.quick-card i {
  font-size: 40px;
  margin-bottom: 15px;
}

.quick-card h3 {
  margin: 10px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 500;
}

.quick-card p {
  color: #909399;
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .el-col {
    margin-bottom: 15px;
  }

  .stat-card, .quick-card {
    height: auto;
  }
}
</style>