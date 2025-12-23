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
        <div style="flex: 1"></div>
        <el-input
            v-model="searchKeyword"
            placeholder="搜索年份"
            style="width: 300px; margin-right: 10px"
            clearable
        >
          <template #prefix>
            <i class="el-icon-search"></i>
          </template>
        </el-input>
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
      this.loading = true
      try {
        const response = await this.$api.defenseYear.getAll()
        this.years = response.data
      } catch (error) {
        console.error('获取年份数据失败:', error)
        this.$message.error('获取年份数据失败')
        // 临时模拟数据
        this.years = [
          {
            year: 2025,
            groupCount: 3,
            defenseCount: 45,
            status: 'active',
            createdTime: '2024-03-15',
            description: '2025年毕业答辩'
          },
          {
            year: 2024,
            groupCount: 2,
            defenseCount: 32,
            status: 'inactive',
            createdTime: '2023-03-10',
            description: '2024年毕业答辩'
          }
        ]
      } finally {
        this.loading = false
      }
    },

    // 事件处理
    handleAddYear() {
      this.isEditingYear = false
      this.yearForm = {
        year: new Date().getFullYear(),
        status: 'active',
        description: ''
      }
      this.yearDialogVisible = true
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
      try {
        if (this.isEditingYear) {
          await this.$api.defenseYear.update(formData.year, formData)
          this.years[this.editingYearIndex] = { ...formData }
          this.$message.success('更新答辩年份成功')
        } else {
          await this.$api.defenseYear.create(formData)
          this.years.unshift({
            ...formData,
            groupCount: 0,
            defenseCount: 0,
            createdTime: new Date().toISOString()
          })
          this.$message.success('新增答辩年份成功')
        }
        this.yearDialogVisible = false
      } catch (error) {
        this.$message.error('操作失败：' + error.message)
      }
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