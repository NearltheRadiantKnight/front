<template>
  <div class="year-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>答辩年份管理</h2>
      <p class="subtitle">管理系统中的答辩年份及对应答辩组配置</p>
    </div>

    <!-- 操作栏 -->
    <el-card class="operation-card" shadow="never">
      <div class="operation-bar">
        <el-button type="primary" @click="handleAddYear">
          <i class="el-icon-plus"></i> 新增答辩年份
        </el-button>
      </div>
    </el-card>

    <!-- 年份列表 -->
    <YearList
        :years="filteredYears"
        :loading="loading"
        @manage-groups="handleManageGroups"
        @edit-year="handleEditYear"
        @toggle-status="handleToggleYearStatus"
        @delete="handleDeleteYear"
    />

    <!-- 年份表单对话框 -->
    <YearFormDialog
        v-model="yearDialogVisible"
        :form-data="yearForm"
        :is-edit="isEditingYear"
        :years="years"
        @submit="handleSubmitYear"
    />

    <!-- 答辩组管理对话框 -->
    <GroupManager
        v-model="groupManagerVisible"
        :year="selectedYear"
        @refresh="fetchYears"
    />
  </div>
</template>

<script>
import YearList from './YearList.vue'
import YearFormDialog from './YearForm.vue'
import GroupManager from './GroupManager.vue'
import request from "@/api";
import {ElMessage} from "element-plus";

export default {
  name: 'YearManagement',
  components: {
    YearList,
    YearFormDialog,
    GroupManager
  },
  data() {
    return {
      // 数据
      years: [],

      // 搜索
      searchKeyword: '',

      // 对话框状态
      yearDialogVisible: false,
      groupManagerVisible: false,

      // 表单数据
      yearForm: {
        year: new Date().getFullYear(),
        status: 'active',
        description: ''
      },

      // 选中项
      selectedYear: null,

      // 状态
      loading: false,
      isEditingYear: false,
      editingYearIndex: -1
    }
  },
  computed: {
    filteredYears() {
      if (!this.searchKeyword) return this.years
      const keyword = this.searchKeyword.toLowerCase()
      return this.years.filter(year =>
          year.year.toString().includes(keyword) ||
          (year.description && year.description.toLowerCase().includes(keyword))
      )
    }
  },
  methods: {
    // 初始化数据
    async fetchYears() {
      this.loading = true;
      request.get("/defense/allyear").then((res)=>{
          this.years = res.data;
      }).finally(this.loading = false);

    },

    // 事件处理
    handleAddYear() {
      this.isEditingYear = false;
      this.yearForm = {
        year: new Date().getFullYear(),
        status: 'active'
      };
      this.yearDialogVisible = true;

    },

    handleEditYear(year, index) {
      this.isEditingYear = true
      this.editingYearIndex = index
      this.yearForm = { ...year }
      this.yearDialogVisible = true
    },

    handleManageGroups(year) {
      this.selectedYear = year
      this.groupManagerVisible = true
    },

    async handleSubmitYear(formData) {
        request.post("/defense/yearadd", {...formData}).then((res)=>{
            ElMessage.success("年份创建成功");
        });
        this.isEditingYear = false;
        this.yearDialogVisible = false;

    },

    async handleToggleYearStatus(year, index) {
      const newStatus = year.status === 'active' ? 'inactive' : 'active'
      try {
        await this.$api.defenseYear.updateStatus(year.year, newStatus)
        this.years[index].status = newStatus
        this.$message.success(`${year.year}年已${newStatus === 'active' ? '启用' : '停用'}`)
      } catch (error) {
        this.$message.error('操作失败')
      }
    },

    async handleDeleteYear(year, index) {
      try {
        await this.$api.defenseYear.delete(year.year)
        this.years.splice(index, 1)
        this.$message.success('删除成功')
      } catch (error) {
        this.$message.error('删除失败：' + error.message)
      }
    }
  },
  mounted() {
    this.fetchYears()
  }
}
</script>

<style scoped>
.year-management {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h2 {
  color: #333;
  font-size: 24px;
  margin-bottom: 8px;
}

.subtitle {
  color: #666;
  font-size: 14px;
}

.operation-card {
  margin-bottom: 20px;
}

.operation-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
