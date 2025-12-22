<script lang="ts">
import { useRouter } from 'vue-router'
import {instituteApi} from '@/api/institute.ts'
import {userApi} from "@/api/user.ts";

const router = useRouter()

export default {
  data(){
    return{
      instituteCount: 0,
      adminCount: 0,
      teacherCount: 0,
      leaderCount: 0
    }
  },
  methods:{
    getInstituteCount(){
      instituteApi.getInstituteCount().then((res:any)=>{ this.instituteCount = res.data});
    },
    getAdminCount(){
      userApi.getAdminCount().then((res:any)=>{ this.adminCount = res.data});
    },
    getTeacherCount(){
      userApi.getTeacherCount().then((res:any)=>{ this.teacherCount = res.data});
    },
    navigateTo(path:string){
        this.$router.push(path);
    }
  },
  mounted(): any {
    this.getInstituteCount();
    this.getTeacherCount();
  }
}

</script>

<template>
  <div class="page-content">
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
            <h3>{{ instituteCount }}</h3>
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
            <h3>{{ adminCount }}</h3>
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
            <h3>{{ teacherCount }}</h3>
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
            <h3>{{ leaderCount }}</h3>
            <p>答辩组长</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快速操作 -->
    <el-row :gutter="20" class="quick-actions">
      <el-col :span="8">
        <el-card class="quick-card" @click="navigateTo('instituteadd')">
          <i class="el-icon-plus" style="color: #409EFF;"></i>
          <h3>创建院系</h3>
          <p>添加新的院系信息</p>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="quick-card" @click="navigateTo('adminadd')">
          <i class="el-icon-user-add" style="color: #67C23A;"></i>
          <h3>添加管理员</h3>
          <p>创建院系管理员账号</p>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="quick-card" @click="navigateTo('yearset')">
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
</template>

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
