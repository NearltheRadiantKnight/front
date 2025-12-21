<template>
  <div class="inst-admin-dashboard">
    <!-- 导航栏 -->
    <el-header class="header" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
      <div class="header-left">
        <span class="system-title">答辩管理系统 - 院系管理员</span>
      </div>
      <div class="header-right">
        <el-tag type="success">院系管理员</el-tag>
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
            <i class="el-icon-school"></i>
          </div>
          <div class="info">
            <p class="name">{{ adminName }}</p>
            <p class="role">{{ instituteName }}</p>
            <p class="time">登录时间: {{ loginTime }}</p>
            <!-- 添加上传签名按钮 -->
            <el-button
                type="primary"
                size="small"
                @click="uploadSignatureDialogVisible = true"
                style="margin-top: 10px;"
            >
              <i class="el-icon-upload"></i>上传签名
            </el-button>
          </div>
        </div>

        <el-menu
            active-text-color="#ffd04b"
            background-color="#304156"
            text-color="#fff"
            class="sidebar-menu"
            router
            :default-active="$route.path"
        >
          <div class="menu-title">院系管理</div>

          <el-menu-item index="/inst-admin">
            <i class="el-icon-s-home"></i>
            <span>院系概览</span>
          </el-menu-item>

          <!-- 学生管理 -->
          <el-submenu index="student">
            <template #title>
              <i class="el-icon-user-solid"></i>
              <span>学生管理</span>
            </template>
            <el-menu-item index="/inst-admin/student-list">学生列表</el-menu-item>
            <el-menu-item index="/inst-admin/student-import">导入学生数据</el-menu-item>
          </el-submenu>

          <!-- 教师管理 -->
          <el-submenu index="teacher">
            <template #title>
              <i class="el-icon-s-custom"></i>
              <span>教师管理</span>
            </template>
            <el-menu-item index="/inst-admin/teacher-list">教师列表</el-menu-item>
            <el-menu-item index="/inst-admin/teacher-add">添加教师</el-menu-item>
            <el-menu-item index="/inst-admin/teacher-import">导入教师数据</el-menu-item>
          </el-submenu>

          <!-- 答辩分组管理 -->
          <el-submenu index="defense-group">
            <template #title>
              <i class="el-icon-s-operation"></i>
              <span>答辩分组管理</span>
            </template>
            <el-menu-item index="/inst-admin/group-list">答辩小组列表</el-menu-item>
            <el-menu-item index="/inst-admin/group-create">创建答辩小组</el-menu-item>
            <el-menu-item index="/inst-admin/group-assign">分配学生到小组</el-menu-item>
            <el-menu-item index="/inst-admin/group-leader">指定答辩组长</el-menu-item>
          </el-submenu>

          <el-menu-item index="/inst-admin/defense-arrangement">
            <i class="el-icon-tickets"></i>
            <span>答辩安排</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main class="content">
        <router-view/>
      </el-main>
    </el-container>

    <!-- 上传系主任签名对话框 -->
    <el-dialog
        title="上传系主任签名图片"
        v-model="uploadSignatureDialogVisible"
        width="400px"
        center
    >
      <el-upload
          class="signature-upload"
          drag
          action="/api/upload/signature"
          :on-success="handleSignatureUploadSuccess"
          :on-error="handleSignatureUploadError"
          :show-file-list="false"
          accept=".jpg,.jpeg,.png,.gif"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将签名图片拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip" slot="tip">只能上传jpg/png/gif文件，且不超过2MB</div>
      </el-upload>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadSignatureDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="uploadSignatureDialogVisible = false">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

export default defineComponent({
  name: 'InstAdminDashboard',
  data() {
    return {
      adminName: '院系管理员',
      instituteName: '计算机学院',
      loginTime: '',
      uploadSignatureDialogVisible: false,
    };
  },
  methods: {
    // 退出登录
    logout() {
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        localStorage.clear();
        window.location.href = '/';
      }).catch(() => {
        // 取消操作
      });
    },

    // 上传签名成功
    handleSignatureUploadSuccess(response: any) {
      ElMessage.success('系主任签名上传成功');
    },

    // 上传签名失败
    handleSignatureUploadError() {
      ElMessage.error('系主任签名上传失败');
    }
  },
  mounted() {
    console.log('院系管理员Dashboard已加载');
    this.loginTime = new Date().toLocaleString();
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
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
  background: #f5576c;
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

.signature-upload {
  text-align: center;
}
</style>