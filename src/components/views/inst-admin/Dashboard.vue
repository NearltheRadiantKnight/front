<template>
  <div class="inst-admin-dashboard">
    <el-header class="header" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
      <div class="header-left">
        <span class="system-title">答辩管理系统 - 院系管理员</span>
      </div>
      <div class="header-right">
        <span class="welcome">欢迎，计算机学院管理员</span>
        <el-button type="text" @click="logout">退出登录</el-button>
      </div>
    </el-header>

    <el-container class="main-container">
      <el-aside width="250px" class="sidebar">
        <div class="institute-info">
          <i class="el-icon-school"></i>
          <span>计算机学院</span>
          <!-- 添加上传签名按钮 -->
          <el-button type="text" @click="uploadSignatureDialogVisible = true" style="color: #ffd04b; margin-left: 10px;">
            <i class="el-icon-upload"></i>上传签名
          </el-button>
        </div>
        <el-menu
          active-text-color="#ffd04b"
          background-color="#304156"
          text-color="#fff"
          class="sidebar-menu"
        >
          <el-menu-item index="1">
            <i class="el-icon-s-home"></i>
            <span>院系概览</span>
          </el-menu-item>

          <!-- 学生管理 -->
          <el-submenu index="2">
            <template #title>
              <i class="el-icon-user-solid"></i>
              <span>学生管理</span>
            </template>
            <el-menu-item index="2-1">学生列表</el-menu-item>
            <el-menu-item index="2-2">导入学生数据</el-menu-item>
          </el-submenu>

          <!-- 教师管理 -->
          <el-submenu index="3">
            <template #title>
              <i class="el-icon-s-custom"></i>
              <span>教师管理</span>
            </template>
            <el-menu-item index="3-1">教师列表</el-menu-item>
            <el-menu-item index="3-2">添加教师</el-menu-item>
            <el-menu-item index="3-3">导入教师数据</el-menu-item>
          </el-submenu>

          <!-- 答辩分组管理 -->
          <el-submenu index="4">
            <template #title>
              <i class="el-icon-s-operation"></i>
              <span>答辩分组管理</span>
            </template>
            <el-menu-item index="4-1">答辩小组列表</el-menu-item>
            <el-menu-item index="4-2">创建答辩小组</el-menu-item>
            <el-menu-item index="4-3">分配学生到小组</el-menu-item>
            <el-menu-item index="4-4">指定答辩组长</el-menu-item>
          </el-submenu>

          <el-menu-item index="5">
            <i class="el-icon-tickets"></i>
            <span>答辩安排</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main class="content">
        <div class="page-title">
          <h2>计算机学院 - 管理控制台</h2>
          <p class="subtitle">管理本学院的学生、教师、答辩分组和答辩安排</p>
        </div>

        <el-row :gutter="20" class="stats-row">
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-icon" style="background: #36a3f7;">
                <i class="el-icon-user-solid"></i>
              </div>
              <div class="stat-content">
                <h3>120</h3>
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
                <h3>45</h3>
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
                <h3>6</h3>
                <p>答辩小组</p>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-icon" style="background: #ffb822;">
                <i class="el-icon-finished"></i>
              </div>
              <div class="stat-content">
                <h3>12</h3>
                <p>已完成答辩</p>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-card class="role-info">
          <h3><i class="el-icon-info"></i> 院系管理员权限说明</h3>
          <p>您作为计算机学院的院系管理员，拥有以下管理权限：</p>
          <ul>
            <li>管理本学院的学生信息（包含导入学生数据）</li>
            <li>管理本学院的教师信息（包含导入教师数据）</li>
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
import { defineComponent, ref } from 'vue';
import { ElMessage } from 'element-plus';

export default defineComponent({
  name: 'InstAdminDashboard',
  setup() {
    const uploadSignatureDialogVisible = ref(false);
    const currentSignature = ref(''); // 当前系主任签名图片URL

    // 模拟已有的签名图片
    currentSignature.value = '/api/signature/current.jpg';

    const handleSignatureUploadSuccess = (response: any) => {
      ElMessage.success('系主任签名上传成功');
      currentSignature.value = response.url; // 更新显示的签名图片
    };

    const handleSignatureUploadError = () => {
      ElMessage.error('系主任签名上传失败');
    };

    return {
      uploadSignatureDialogVisible,
      currentSignature,
      handleSignatureUploadSuccess,
      handleSignatureUploadError
    };
  },
  mounted() {
    console.log('院系管理员Dashboard已加载');
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
.inst-admin-dashboard {
  height: 100vh;
  background-color: #f8f9fa;
}

.institute-info {
  padding: 20px;
  background: #1f2d3d;
  color: white;
  font-size: 16px;
  text-align: center;
  border-bottom: 1px solid #2d3a4b;
  display: flex;
  align-items: center;
  justify-content: center;
}

.institute-info i {
  margin-right: 10px;
  font-size: 18px;
}

.role-info {
  margin-top: 30px;
  border-left: 4px solid #f5576c;
}

.role-info h3 {
  color: #f5576c;
}

.role-info ul {
  margin-top: 15px;
  color: #666;
}

.signature-info {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
}

.signature-upload {
  text-align: center;
}

/* 继承基础样式 */
.header, .main-container, .sidebar, .content, .stats-row, .stat-card {
  /* 复用超级管理员的基础样式 */
}
</style>