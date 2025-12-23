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
        <el-button type="primary" @click="showAddYearDialog">
          <i class="el-icon-plus"></i> 新增答辩年份
        </el-button>
        <el-button type="success" @click="showAddGroupDialog">
          <i class="el-icon-plus"></i> 新增答辩组
        </el-button>
        <div style="flex: 1"></div>
        <el-input
            v-model="searchKeyword"
            placeholder="搜索年份或答辩组"
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
    <el-card class="year-list-card" shadow="never">
      <template #header>
        <div class="card-header">
          <h3>答辩年份列表</h3>
          <span class="total-count">共 {{ years.length }} 个答辩年份</span>
        </div>
      </template>

      <el-table :data="filteredYears" v-loading="loading">
        <el-table-column prop="year" label="答辩年份" width="120" sortable>
          <template #default="{ row }">
            <span class="year-badge">{{ row.year }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="groupCount" label="答辩组数量" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ row.groupCount }} 个</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="defenseCount" label="答辩学生数" width="120">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.defenseCount }} 人</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="备注" min-width="200"></el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row, $index }">
            <el-button size="small" type="primary" @click="manageGroups(row)">
              <i class="el-icon-s-management"></i> 管理答辩组
            </el-button>
            <el-button
                size="small"
                :type="row.status === 'active' ? 'warning' : 'success'"
                @click="toggleYearStatus(row, $index)"
            >
              {{ row.status === 'active' ? '停用' : '启用' }}
            </el-button>
            <el-popconfirm
                title="确定要删除这个年份吗？这将删除所有相关的答辩组数据！"
                @confirm="deleteYear(row, $index)"
            >
              <template #reference>
                <el-button size="small" type="danger">
                  <i class="el-icon-delete"></i> 删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增年份对话框 -->
    <el-dialog
        v-model="addYearDialogVisible"
        title="新增答辩年份"
        width="500px"
        @closed="resetAddYearForm"
    >
      <el-form
          ref="addYearFormRef"
          :model="addYearForm"
          :rules="addYearRules"
          label-width="100px"
      >
        <el-form-item label="答辩年份" prop="year">
          <el-input
              v-model.number="addYearForm.year"
              placeholder="请输入答辩年份，如：2025"
              type="number"
              min="2020"
              max="2100"
          ></el-input>
        </el-form-item>
        <el-form-item label="年份状态" prop="status">
          <el-radio-group v-model="addYearForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="description">
          <el-input
              v-model="addYearForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入年份备注信息（可选）"
              maxlength="200"
              show-word-limit
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addYearDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAddYear" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 新增/编辑答辩组对话框 -->
    <el-dialog
        v-model="groupDialogVisible"
        :title="groupDialogTitle"
        width="600px"
        @closed="resetGroupForm"
    >
      <el-form
          ref="groupFormRef"
          :model="groupForm"
          :rules="groupRules"
          label-width="120px"
      >
        <el-form-item label="所属年份" prop="year">
          <el-select
              v-model="groupForm.year"
              placeholder="请选择所属答辩年份"
              style="width: 100%"
              :disabled="isEditingGroup"
          >
            <el-option
                v-for="year in years"
                :key="year.year"
                :label="year.year + '年'"
                :value="year.year"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="答辩组名称" prop="name">
          <el-input
              v-model="groupForm.name"
              placeholder="请输入答辩组名称，如：第一答辩组"
          ></el-input>
        </el-form-item>
        <el-form-item label="组长" prop="adminId">
          <el-select
              v-model="groupForm.adminId"
              placeholder="请选择答辩组组长"
              style="width: 100%"
              filterable
              remote
              :remote-method="searchTeachers"
              :loading="teacherLoading"
          >
            <el-option
                v-for="teacher in teacherList"
                :key="teacher.id"
                :label="`${teacher.realName} (${teacher.id})`"
                :value="teacher.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="答辩时间" prop="defenseTime">
          <el-date-picker
              v-model="groupForm.defenseTime"
              type="date"
              placeholder="请选择答辩日期"
              style="width: 100%"
              value-format="YYYY-MM-DD"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="答辩地点" prop="location">
          <el-input
              v-model="groupForm.location"
              placeholder="请输入答辩地点"
          ></el-input>
        </el-form-item>
        <el-form-item label="最大学生数" prop="maxStudents">
          <el-input-number
              v-model.number="groupForm.maxStudents"
              :min="1"
              :max="30"
              placeholder="请输入最大学生数"
              style="width: 100%"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="groupForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
              v-model="groupForm.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入答辩组备注信息（可选）"
              maxlength="200"
              show-word-limit
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="groupDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitGroupForm" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 答辩组管理对话框 -->
    <el-dialog
        v-model="manageGroupsDialogVisible"
        :title="`${selectedYear?.year}年 - 答辩组管理`"
        width="90%"
        top="5vh"
        class="manage-groups-dialog"
    >
      <div class="groups-management">
        <div class="groups-header">
          <div class="groups-info">
            <span class="year-title">{{ selectedYear?.year }}年</span>
            <el-tag :type="selectedYear?.status === 'active' ? 'success' : 'info'">
              {{ selectedYear?.status === 'active' ? '启用中' : '已停用' }}
            </el-tag>
          </div>
          <el-button type="primary" size="small" @click="showAddGroupDialog(selectedYear)">
            <i class="el-icon-plus"></i> 新增答辩组
          </el-button>
        </div>

        <el-table :data="selectedYearGroups" v-loading="groupsLoading">
          <el-table-column prop="name" label="答辩组名称" width="150"></el-table-column>
          <el-table-column prop="adminName" label="组长" width="150"></el-table-column>
          <el-table-column prop="defenseTime" label="答辩时间" width="120">
            <template #default="{ row }">
              {{ formatDate(row.defenseTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="location" label="答辩地点" width="150"></el-table-column>
          <el-table-column label="学生数" width="100">
            <template #default="{ row }">
              <span>{{ row.studentCount || 0 }} / {{ row.maxStudents }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-switch
                  v-model="row.status"
                  :active-value="1"
                  :inactive-value="0"
                  @change="toggleGroupStatus(row)"
              ></el-switch>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="150"></el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="editGroup(row)">编辑</el-button>
              <el-button
                  size="small"
                  type="warning"
                  @click="viewGroupStudents(row)"
              >
                查看学生
              </el-button>
              <el-popconfirm
                  title="确定要删除这个答辩组吗？"
                  @confirm="deleteGroup(row)"
              >
                <template #reference>
                  <el-button size="small" type="danger">删除</el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>

        <div class="groups-summary">
          <div class="summary-item">
            <span class="label">答辩组总数：</span>
            <span class="value">{{ selectedYearGroups.length }}</span>
          </div>
          <div class="summary-item">
            <span class="label">已启用：</span>
            <span class="value">{{ activeGroupsCount }}</span>
          </div>
          <div class="summary-item">
            <span class="label">总容量：</span>
            <span class="value">{{ totalCapacity }} 人</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'YearManagement',
  data() {
    return {
      // 数据
      years: [],
      groups: [],
      teacherList: [],

      // 搜索
      searchKeyword: '',

      // 对话框状态
      addYearDialogVisible: false,
      groupDialogVisible: false,
      manageGroupsDialogVisible: false,

      // 表单
      addYearForm: {
        year: new Date().getFullYear(),
        status: 'active',
        description: ''
      },
      groupForm: {
        id: null,
        year: '',
        name: '',
        adminId: '',
        defenseTime: '',
        location: '',
        maxStudents: 10,
        status: 1,
        remark: ''
      },

      // 选中项
      selectedYear: null,
      selectedYearGroups: [],

      // 状态
      loading: false,
      groupsLoading: false,
      teacherLoading: false,
      submitting: false,

      // 表单验证规则
      addYearRules: {
        year: [
          { required: true, message: '请填写答辩年份', trigger: 'blur' },
          { type: 'number', message: '年份必须为数字', trigger: 'blur' },
          { validator: this.validateYear, trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      },
      groupRules: {
        year: [
          { required: true, message: '请选择所属年份', trigger: 'change' }
        ],
        name: [
          { required: true, message: '请输入答辩组名称', trigger: 'blur' }
        ],
        adminId: [
          { required: true, message: '请选择组长', trigger: 'change' }
        ],
        defenseTime: [
          { required: true, message: '请选择答辩时间', trigger: 'change' }
        ],
        location: [
          { required: true, message: '请输入答辩地点', trigger: 'blur' }
        ],
        maxStudents: [
          { required: true, message: '请设置最大学生数', trigger: 'blur' },
          { type: 'number', min: 1, max: 30, message: '学生数范围1-30', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    filteredYears() {
      if (!this.searchKeyword) return this.years

      const keyword = this.searchKeyword.toLowerCase()
      return this.years.filter(year => {
        return (
            year.year.toString().includes(keyword) ||
            (year.description && year.description.toLowerCase().includes(keyword))
        )
      })
    },
    groupDialogTitle() {
      return this.groupForm.id ? '编辑答辩组' : '新增答辩组'
    },
    isEditingGroup() {
      return !!this.groupForm.id
    },
    activeGroupsCount() {
      return this.selectedYearGroups.filter(g => g.status === 1).length
    },
    totalCapacity() {
      return this.selectedYearGroups.reduce((sum, group) => sum + (group.maxStudents || 0), 0)
    }
  },
  methods: {
    // 初始化数据
    async fetchYears() {
      this.loading = true
      try {
        // 这里需要调用后端API获取年份数据
        // 暂时使用模拟数据
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
      } catch (error) {
        this.$message.error('获取年份数据失败')
      } finally {
        this.loading = false
      }
    },

    async fetchGroups(year) {
      this.groupsLoading = true
      try {
        // 这里需要调用后端API获取指定年份的答辩组
        // 暂时使用模拟数据
        this.selectedYearGroups = [
          {
            id: 1,
            year: year,
            name: '第一答辩组',
            adminId: '123123',
            adminName: '张老师',
            defenseTime: '2025-06-15',
            location: '理工楼101',
            maxStudents: 15,
            studentCount: 12,
            status: 1,
            remark: '计算机科学方向'
          },
          {
            id: 2,
            year: year,
            name: '第二答辩组',
            adminId: '123456',
            adminName: '李老师',
            defenseTime: '2025-06-16',
            location: '理工楼201',
            maxStudents: 15,
            studentCount: 10,
            status: 1,
            remark: '软件工程方向'
          }
        ]
      } catch (error) {
        this.$message.error('获取答辩组数据失败')
      } finally {
        this.groupsLoading = false
      }
    },

    async fetchTeachers() {
      this.teacherLoading = true
      try {
        // 这里需要调用后端API获取所有老师列表
        // 暂时使用模拟数据
        this.teacherList = [
          { id: '123123', realName: '张三', phone: '13800138000' },
          { id: '123456', realName: '李四', phone: '13800138001' },
          { id: '234567', realName: '王五', phone: '13800138002' }
        ]
      } catch (error) {
        this.$message.error('获取教师列表失败')
      } finally {
        this.teacherLoading = false
      }
    },

    // 表单验证
    validateYear(rule, value, callback) {
      if (value < 2000 || value > 2100) {
        callback(new Error('年份范围2000-2100'))
      } else if (this.years.some(y => y.year === value)) {
        callback(new Error('该年份已存在'))
      } else {
        callback()
      }
    },

    // 年份操作
    showAddYearDialog() {
      this.addYearDialogVisible = true
    },

    async submitAddYear() {
      try {
        await this.$refs.addYearFormRef.validate()
        this.submitting = true

        // 调用后端API新增年份
        // await this.$api.defenseYear.create(this.addYearForm)

        this.$message.success('新增答辩年份成功')
        this.addYearDialogVisible = false
        this.fetchYears()
      } catch (error) {
        if (error.errors) return
        this.$message.error('新增失败：' + error.message)
      } finally {
        this.submitting = false
      }
    },

    resetAddYearForm() {
      this.$refs.addYearFormRef?.resetFields()
      this.addYearForm = {
        year: new Date().getFullYear(),
        status: 'active',
        description: ''
      }
    },

    async toggleYearStatus(year, index) {
      const newStatus = year.status === 'active' ? 'inactive' : 'active'

      try {
        // 调用后端API更新年份状态
        // await this.$api.defenseYear.updateStatus(year.year, newStatus)

        this.years[index].status = newStatus
        this.$message.success(`${year.year}年已${newStatus === 'active' ? '启用' : '停用'}`)
      } catch (error) {
        this.$message.error('操作失败')
      }
    },

    async deleteYear(year, index) {
      try {
        // 调用后端API删除年份
        // await this.$api.defenseYear.delete(year.year)

        this.years.splice(index, 1)
        this.$message.success('删除成功')
      } catch (error) {
        this.$message.error('删除失败：' + error.message)
      }
    },

    // 答辩组操作
    showAddGroupDialog(year = null) {
      if (year) {
        this.groupForm.year = year.year
      }
      this.groupDialogVisible = true
    },

    async manageGroups(year) {
      this.selectedYear = year
      await this.fetchGroups(year.year)
      this.manageGroupsDialogVisible = true
    },

    editGroup(group) {
      this.groupForm = { ...group }
      this.groupDialogVisible = true
    },

    async submitGroupForm() {
      try {
        await this.$refs.groupFormRef.validate()
        this.submitting = true

        if (this.groupForm.id) {
          // 更新答辩组
          // await this.$api.defenseGroup.update(this.groupForm)
          this.$message.success('更新答辩组成功')
        } else {
          // 新增答辩组
          // await this.$api.defenseGroup.create(this.groupForm)
          this.$message.success('新增答辩组成功')
        }

        this.groupDialogVisible = false

        // 如果正在管理某个年份的答辩组，刷新该年份的答辩组列表
        if (this.selectedYear && this.groupForm.year === this.selectedYear.year) {
          await this.fetchGroups(this.selectedYear.year)
        } else {
          // 刷新年份列表中的答辩组数量
          this.fetchYears()
        }
      } catch (error) {
        if (error.errors) return
        this.$message.error('操作失败：' + error.message)
      } finally {
        this.submitting = false
      }
    },

    resetGroupForm() {
      this.$refs.groupFormRef?.resetFields()
      this.groupForm = {
        id: null,
        year: '',
        name: '',
        adminId: '',
        defenseTime: '',
        location: '',
        maxStudents: 10,
        status: 1,
        remark: ''
      }
    },

    async toggleGroupStatus(group) {
      try {
        // 调用后端API更新答辩组状态
        // await this.$api.defenseGroup.updateStatus(group.id, group.status)
        this.$message.success('状态更新成功')
      } catch (error) {
        // 回滚状态
        group.status = group.status === 1 ? 0 : 1
        this.$message.error('状态更新失败')
      }
    },

    async deleteGroup(group) {
      try {
        // 调用后端API删除答辩组
        // await this.$api.defenseGroup.delete(group.id)

        // 从列表中移除
        const index = this.selectedYearGroups.findIndex(g => g.id === group.id)
        if (index !== -1) {
          this.selectedYearGroups.splice(index, 1)
        }

        // 更新年份的答辩组数量
        const yearIndex = this.years.findIndex(y => y.year === group.year)
        if (yearIndex !== -1 && this.years[yearIndex].groupCount > 0) {
          this.years[yearIndex].groupCount--
        }

        this.$message.success('删除成功')
      } catch (error) {
        this.$message.error('删除失败：' + error.message)
      }
    },

    viewGroupStudents(group) {
      // 这里可以跳转到学生管理页面或显示学生列表对话框
      this.$message.info(`查看第${group.name}的学生列表`)
      // this.$router.push(`/defense-group/${group.id}/students`)
    },

    searchTeachers(query) {
      if (query) {
        this.teacherLoading = true
        setTimeout(() => {
          // 这里应该调用搜索API
          this.teacherLoading = false
        }, 300)
      } else {
        this.fetchTeachers()
      }
    },

    // 工具方法
    formatDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleDateString()
    }
  },
  mounted() {
    this.fetchYears()
    this.fetchTeachers()
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

.year-list-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-count {
  color: #666;
  font-size: 14px;
}

.year-badge {
  display: inline-block;
  padding: 2px 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 4px;
  font-weight: bold;
}

.groups-management {
  padding: 10px;
}

.groups-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.groups-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.year-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.groups-summary {
  display: flex;
  justify-content: flex-start;
  gap: 30px;
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-item .label {
  color: #666;
  font-size: 14px;
}

.summary-item .value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.manage-groups-dialog {
  max-width: 1200px;
}

::v-deep .el-dialog__body {
  max-height: 70vh;
  overflow-y: auto;
}
</style>