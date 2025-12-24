[file name]: Dashboard.vue
[file content begin]
<template>
  <div class="inst-admin-dashboard">
    <!-- 导航栏保持不变 -->
    <el-header class="header">
      <div class="header-left">
        <span class="system-title">答辩管理系统 - 院系管理员</span>
      </div>
      <div class="header-right">
        <el-tag type="success">院系管理员</el-tag>
        <span class="welcome">欢迎，{{ adminName }}</span>

        <!-- 添加上传签名照按钮 -->
        <el-button
          type="text"
          @click="goToPhotoUpload"
          class="upload-btn"
          title="上传签名照"
        >
          <i class="el-icon-edit"></i> 上传签名照
        </el-button>

        <el-button type="text" @click="logout">退出登录</el-button>
      </div>
    </el-header>

    <!-- 主要内容 -->
    <el-container class="main-container">
      <!-- 侧边栏 -->
      <el-aside width="280px" class="sidebar">
        <div class="user-info">
          <div class="avatar">
            <!-- 使用默认头像图标，不显示签名照 -->
            <i class="el-icon-user-solid"></i>
          </div>
          <div class="info">
            <p class="name">{{ adminName }}</p>
            <p class="role">{{ instituteName }}</p>
            <p class="time">登录时间: {{ loginTime }}</p>
            <el-button
              type="text"
              size="small"
              @click="goToPhotoUpload"
              class="photo-upload-link"
            >
              <i class="el-icon-edit"></i> 管理签名照
            </el-button>
          </div>
        </div>

        <el-menu
          active-text-color="#ffd04b"
          background-color="#304156"
          text-color="#fff"
          class="sidebar-menu"
          router
          :default-active="activeMenu"
        >
          <div class="menu-title">院系管理</div>

          <!-- 首页 -->
          <el-menu-item index="/inst-admin">
            <i class="el-icon-s-home"></i>
            <span>院系概览</span>
          </el-menu-item>

          <!-- 学生管理 -->
          <el-menu-item index="/inst-admin/students">
            <i class="el-icon-user-solid"></i>
            <span>学生管理</span>
          </el-menu-item>

          <!-- 教师管理 -->
          <el-menu-item index="/inst-admin/teachers">
            <i class="el-icon-s-custom"></i>
            <span>教师管理</span>
          </el-menu-item>

          <!-- 答辩管理 -->
          <el-menu-item index="/inst-admin/defense">
            <i class="el-icon-date"></i>
            <span>答辩管理</span>
          </el-menu-item>

          <!-- 新增：签名照管理 -->
          <el-menu-item index="/inst-admin/photo-upload">
            <i class="el-icon-edit"></i>
            <span>签名照管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main class="content">
        <router-view/>
      </el-main>
    </el-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';

export default defineComponent({
  name: 'InstAdminDashboard',
  setup() {
    const router = useRouter();

    const adminName = ref('院系管理员');
    const instituteName = ref('计算机学院');
    const loginTime = ref('');

    // 计算当前激活的菜单项
    const activeMenu = computed(() => {
      const path = router.currentRoute.value.path;

      // 处理嵌套路由的激活状态
      if (path === '/inst-admin' || path === '/inst-admin/index') {
        return '/inst-admin';
      }

      return path;
    });

    onMounted(() => {
      console.log('院系管理员Dashboard已加载');
      loginTime.value = new Date().toLocaleString();

      // 从本地存储获取用户信息
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        try {
          const info = JSON.parse(userInfo);
          // 调整为常见数据库字段名
          adminName.value = info.name || info.username || info.real_name || info.realName || '院系管理员';
          instituteName.value = info.institute_name || info.department || '计算机学院';
        } catch (error) {
          console.error('解析用户信息失败:', error);
        }
      }
    });

    // 跳转到签名照上传页面
    const goToPhotoUpload = () => {
      router.push('/inst-admin/photo-upload');
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
      adminName,
      instituteName,
      loginTime,
      activeMenu,
      goToPhotoUpload,
      logout
    };
  }
});
</script>

<style scoped>
.inst-admin-dashboard {
  height: 100vh;
  background-color: #f0f2f5;
}

.header {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
  color: white;
}

.info .name {
  font-size: 16px;
  font-weight: bold;
  margin: 5px 0;
}

.info .role {
  font-size: 12px;
  color: #fff;
  margin: 3px 0;
  background: #667eea;
  padding: 2px 10px;
  border-radius: 12px;
  display: inline-block;
  font-weight: 500;
}

.info .time {
  font-size: 12px;
  color: #ccc;
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

.sidebar-menu .el-menu-item {
  transition: all 0.3s;
}

.sidebar-menu .el-menu-item:hover {
  background-color: #263445 !important;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #1f2d3d !important;
  border-left: 3px solid #667eea;
}

.content {
  padding: 20px;
  overflow-y: auto;
  background: #f0f2f5;
}

/* 菜单图标样式优化 */
.sidebar-menu i {
  margin-right: 10px;
  font-size: 16px;
  vertical-align: middle;
}

.header-right .upload-btn {
  color: #fff;
  font-size: 14px;
  padding: 0 8px;
}

.header-right .upload-btn:hover {
  color: #ffd04b;
}

.header-right .upload-btn i {
  margin-right: 5px;
}

.photo-upload-link {
  color: #ffd04b !important;
  margin-top: 5px;
  font-size: 12px;
  padding: 2px 5px;
}

.photo-upload-link:hover {
  color: #fff !important;
  background: rgba(255, 208, 75, 0.1);
  border-radius: 4px;
}

.photo-upload-link i {
  margin-right: 3px;
}
</style>
[file content end]