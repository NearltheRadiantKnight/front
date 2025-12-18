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
          :default-active="activeMenu"
          @select="handleMenuSelect"
        >
          <div class="menu-title">系统管理</div>

          <el-menu-item index="dashboard">
            <i class="el-icon-s-home"></i>
            <span>首页概览</span>
          </el-menu-item>

          <el-menu-item index="institute">
            <i class="el-icon-office-building"></i>
            <span>院系管理</span>
          </el-menu-item>

          <el-menu-item index="admin">
            <i class="el-icon-user"></i>
            <span>管理员管理</span>
          </el-menu-item>

          <el-menu-item index="evaluation">
            <i class="el-icon-edit"></i>
            <span>评价指标管理</span>
          </el-menu-item>

          <el-menu-item index="year">
            <i class="el-icon-date"></i>
            <span>答辩年份管理</span>
          </el-menu-item>

          <el-menu-item index="template">
            <i class="el-icon-document"></i>
            <span>文档模板管理</span>
          </el-menu-item>

          <el-menu-item index="date">
            <i class="el-icon-time"></i>
            <span>日期设置</span>
          </el-menu-item>

          <el-menu-item index="ai">
            <i class="el-icon-cpu"></i>
            <span>AI配置</span>
          </el-menu-item>

          <el-menu-item index="system">
            <i class="el-icon-setting"></i>
            <span>系统设置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 内容区域 -->
      <el-main class="content">
        <!-- 首页概览 -->
        <div v-if="activeMenu === 'dashboard'" class="page-content">
          <div class="page-title">
            <h2>超级管理员控制台</h2>
            <p class="subtitle">您拥有系统的最高权限，可以管理所有数据和配置</p>
          </div>

          <el-row :gutter="20" class="stats-row">
            <el-col :span="6">
              <el-card class="stat-card">
                <div class="stat-icon" style="background: #409EFF;">
                  <i class="el-icon-office-building"></i>
                </div>
                <div class="stat-content">
                  <h3>{{ stats.instituteCount }}</h3>
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
                  <h3>{{ stats.adminCount }}</h3>
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
                  <h3>{{ stats.teacherCount }}</h3>
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
                  <h3>{{ stats.leaderCount }}</h3>
                  <p>答辩组长</p>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <!-- 快速操作 -->
          <el-row :gutter="20" class="quick-actions">
            <el-col :span="8">
              <el-card class="quick-card" @click="navigateTo('institute')">
                <i class="el-icon-plus" style="color: #409EFF;"></i>
                <h3>创建院系</h3>
                <p>添加新的院系信息</p>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card class="quick-card" @click="navigateTo('admin')">
                <i class="el-icon-user-add" style="color: #67C23A;"></i>
                <h3>添加管理员</h3>
                <p>创建院系管理员账号</p>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card class="quick-card" @click="navigateTo('year')">
                <i class="el-icon-date" style="color: #E6A23C;"></i>
                <h3>设置年份</h3>
                <p>配置答辩年份</p>
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
        </div>

        <!-- 院系管理 -->
        <div v-else-if="activeMenu === 'institute'" class="page-content">
          <InstituteList />
        </div>

        <!-- 管理员管理 -->
        <div v-else-if="activeMenu === 'admin'" class="page-content">
          <AdminList />
        </div>

        <!-- 评价指标管理 -->
        <div v-else-if="activeMenu === 'evaluation'" class="page-content">
          <div class="evaluation-manage">
            <el-card>
              <template #header>
                <span>评价指标管理</span>
              </template>

              <el-tabs v-model="activeTab" type="border-card">
                <el-tab-pane label="本科毕业论文答辩成绩表" name="thesis">
                  <EvaluationThesis />
                </el-tab-pane>
                <el-tab-pane label="本科毕业设计答辩成绩表" name="design">
                  <EvaluationDesign />
                </el-tab-pane>
              </el-tabs>
            </el-card>
          </div>
        </div>

        <!-- 其他菜单项的内容占位符 -->
        <div v-else class="page-content">
          <el-card>
            <template #header>
              <span>{{ getMenuTitle() }}</span>
            </template>
            <div style="text-align: center; padding: 100px 0; color: #909399;">
              <i class="el-icon-setting" style="font-size: 48px; margin-bottom: 20px;"></i>
              <p>功能正在开发中...</p>
            </div>
          </el-card>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import InstituteList from './InstituteList.vue';
import AdminList from './AdminList.vue';
import EvaluationThesis from './EvaluationThesis.vue';
import EvaluationDesign from './EvaluationDesign.vue';

export default defineComponent({
  name: 'SuperAdminDashboard',
  components: {
    InstituteList,
    AdminList,
    EvaluationThesis,
    EvaluationDesign
  },
  setup() {
    const activeMenu = ref('dashboard');
    const activeTab = ref('thesis');
    const adminName = ref('超级管理员');
    const loginTime = ref('');

    const stats = ref({
      instituteCount: 0,
      adminCount: 0,
      teacherCount: 0,
      leaderCount: 0
    });

    const todos = ref([
      { id: 1, content: '审核计算机学院新增教师申请', time: '2024-05-15 10:30' },
      { id: 2, content: '配置2024年答辩评价指标', time: '2024-05-14 14:20' },
      { id: 3, content: '上传新版毕业论文模板', time: '2024-05-13 09:15' }
    ]);

    const menuTitles: Record<string, string> = {
      'dashboard': '首页概览',
      'institute': '院系管理',
      'admin': '管理员管理',
      'evaluation': '评价指标管理',
      'year': '答辩年份管理',
      'template': '文档模板管理',
      'date': '日期设置',
      'ai': 'AI配置',
      'system': '系统设置'
    };

    onMounted(() => {
      console.log('超级管理员Dashboard已加载');
      loginTime.value = new Date().toLocaleString();
      loadStats();
    });

    const loadStats = async () => {
      // 模拟加载数据
      stats.value = {
        instituteCount: 10,
        adminCount: 25,
        teacherCount: 150,
        leaderCount: 15
      };
    };

    const handleMenuSelect = (key: string) => {
      activeMenu.value = key;
    };

    const navigateTo = (menu: string) => {
      activeMenu.value = menu;
    };

    const handleTodo = (todo: any) => {
      ElMessage.info(`处理待办事项: ${todo.content}`);
      todos.value = todos.value.filter(item => item.id !== todo.id);
    };

    const getMenuTitle = () => {
      return menuTitles[activeMenu.value] || '功能页面';
    };

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
      activeMenu,
      activeTab,
      adminName,
      loginTime,
      stats,
      todos,
      handleMenuSelect,
      navigateTo,
      handleTodo,
      getMenuTitle,
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