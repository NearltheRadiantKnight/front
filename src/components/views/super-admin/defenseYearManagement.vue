<template>
  <div class="year-management">
    <div class="page-header">
      <h2>答辩年份管理</h2>
      <p class="subtitle">按年份查看各学院的答辩组配置</p>
    </div>

    <el-card class="operation-card" shadow="never">
      <div class="operation-bar">
        <el-button type="primary" @click="handleAddYear">
          新增答辩年份
        </el-button>
      </div>
    </el-card>

    <YearList
      :years="filteredYears"
      :loading="loading"
      @manage-institute-groups="handleManageInstituteGroups"
      @delete-year="handleDeleteYear"
      @add-year="handleAddYear"
    />

    <YearFormDialog
      v-model="yearDialogVisible"
      :form-data="yearForm"
      :is-edit="isEditingYear"
      :years="years"
      @update-visible="updateVisible"
      @submit="handleSubmitYear"
    />

    <GroupManager
      v-model="groupManagerVisible"
      :year="selectedYear"
      :institute-id="selectedInstituteId"
      :institute-name="selectedInstituteName"
      @refresh="fetchYears"
    />
  </div>
</template>

<script>
import YearList from './YearList.vue'
import YearFormDialog from './YearForm.vue'
import GroupManager from './GroupManager.vue'
import request from "@/api"
import { ElMessage, ElMessageBox } from "element-plus"

export default {
  name: 'YearManagement',
  components: {
    YearList,
    YearFormDialog,
    GroupManager
  },
  data() {
    return {
      years: [],
      searchKeyword: '',

      yearDialogVisible: false,
      groupManagerVisible: false,

      yearForm: {
        year: new Date().getFullYear(),
        status: 'active',
        description: ''
      },

      selectedYear: null,
      selectedInstituteId: 0,
      selectedInstituteName: '',

      loading: false,
      isEditingYear: false
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
    async fetchYears() {
      this.loading = true
      try {
        const res = await request.get("/defense/year-institute-summary")
        this.years = (res.data || []).map(year => ({
          ...year,
          institutes: year.institutes || []
        }))
      } finally {
        this.loading = false
      }
    },

    handleAddYear() {
      this.isEditingYear = false
      this.yearForm = {
        year: new Date().getFullYear(),
        status: 'active',
        description: ''
      }
      this.yearDialogVisible = true
    },

    handleManageInstituteGroups(year, institute) {
      this.selectedYear = year
      this.selectedInstituteId = Number(institute.id)
      this.selectedInstituteName = institute.name
      this.groupManagerVisible = true
    },

    async handleSubmitYear(formData) {
      const res = await request.post("/defense/yearadd", { ...formData })
      if (res.code !== 200) {
        ElMessage.error(res.message || "年份创建失败")
        return
      }

      this.yearDialogVisible = false
      this.isEditingYear = false
      ElMessage.success("年份创建成功")
      await this.fetchYears()
    },

    async handleDeleteYear(year) {
      try {
        await ElMessageBox.confirm(
          `确定要删除 ${year.year} 年及其所有答辩组吗？`,
          '确认删除',
          {
            confirmButtonText: '确认删除',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
      } catch {
        return
      }

      const res = await request.post("/defense/yeardelete", { ...year })
      if (res.code !== 200) {
        ElMessage.error(res.message || "删除失败")
        return
      }

      ElMessage.success('删除成功')
      await this.fetchYears()
    },

    updateVisible(visible) {
      this.yearDialogVisible = visible
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
  margin-bottom: 24px;
}

.page-header h2 {
  color: #303133;
  font-size: 24px;
  margin: 0 0 8px;
}

.subtitle {
  color: #606266;
  font-size: 14px;
  margin: 0;
}

.operation-card {
  margin-bottom: 20px;
}

.operation-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
</style>
