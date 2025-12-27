<template>
  <div class="group-list-section">
    <div class="section-header">
      <h3>答辩组列表</h3>
      <div class="section-actions">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索答辩组名称或组长"
            clearable
            style="width: 200px; margin-right: 10px;"
            @keyup.enter="handleSearch"
        >
          <template #prefix>
            <i class="el-icon-search"></i>
          </template>
        </el-input>
        <el-button type="primary" size="small" @click="$emit('add-group')">
          <i class="el-icon-plus"></i> 新增答辩组
        </el-button>
        <el-tag type="info">共 {{ filteredGroups.length }} 个答辩组</el-tag>
      </div>
    </div>

    <el-table :data="filteredGroups" v-loading="loading" style="margin-bottom: 20px;">
      <el-table-column label="组长" width="150">
        <template #default="{row}">
          <span>
            {{ row.realName }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="学生数" width="120">
        <template #default="{ row }">
          <span :class="{ 'text-danger': row.student_count > row.max_student_count }">
            {{ row.student_count || 0 }} / {{ row.max_student_count }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="350" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="$emit('edit-group', row)">编辑</el-button>
          <el-button
              size="small"
              type="warning"
              @click="$emit('view-students', row)"
          >
            查看学生
          </el-button>
          <el-button
              size="small"
              type="primary"
              @click="$emit('assign-student', row)"
          >
            分配学生
          </el-button>
          <el-popconfirm
              title="确定要删除这个答辩组吗？"
              @confirm="$emit('delete-group', row)"
          >
            <template #reference>
              <el-button size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 统计信息 -->
    <div class="groups-summary">
      <div class="summary-item">
        <span class="label">答辩组总数：</span>
        <span class="value">{{ groups.length }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GroupList',
  props: {
    groups: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['add-group', 'edit-group', 'view-students','assign-student', 'delete-group'],
  data() {
    return {
      searchKeyword: ''
    }
  },
  computed: {
    filteredGroups() {
      if (!this.searchKeyword) return this.groups

      const keyword = this.searchKeyword.toLowerCase()
      return this.groups.filter(group => {
        return (
            (group.adminName && group.adminName.toLowerCase().includes(keyword))
        )
      })
    },
    activeGroupsCount() {
      return this.groups.filter(g => g.status === 1).length
    },
    totalCapacity() {
      return this.groups.reduce((sum, group) => sum + (group.maxStudents || 0), 0)
    },
    totalAssigned() {
      return this.groups.reduce((sum, group) => sum + (group.studentCount || 0), 0)
    },
    remainingCapacity() {
      return this.totalCapacity - this.totalAssigned
    }
  },
  methods: {
    handleSearch() {
      // 搜索逻辑已在计算属性中实现
    }
  }
}
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.section-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 10px;
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

.text-danger {
  color: #f56c6c;
  font-weight: bold;
}
</style>
