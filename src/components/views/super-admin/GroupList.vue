<template>
  <div class="group-list-section">
    <div class="section-header">
      <h3>答辩组列表</h3>
      <div class="section-actions">
        <el-input
            v-model="searchKeyword"
            placeholder="输入组长真名或工号搜索"
            clearable
            style="width: 220px; margin-right: 10px;"
            @keyup.enter="handleSearch"
            @clear="handleClear"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-button :icon="Search" @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
        <el-button type="primary" size="small" @click="$emit('add-group')">
          <el-icon><Plus /></el-icon> 新增答辩组
        </el-button>
        <el-tag type="info">共 {{ groups.length }} 个答辩组</el-tag>
      </div>
    </div>

    <el-table :data="groups" v-loading="loading" style="margin-bottom: 20px;">
      <el-table-column prop="realName" label="组长" width="150"></el-table-column>
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
import { Search, Plus } from '@element-plus/icons-vue'

export default {
  name: 'GroupList',
  components: {
    Search,
    Plus
  },
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
  emits: ['add-group', 'edit-group', 'manage-students', 'view-students', 'assign-student', 'toggle-status', 'delete-group', 'search'],
  data() {
    return {
      searchKeyword: ''
    }
  },
  computed: {
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
      this.$emit('search', this.searchKeyword)
    },
    handleClear() {
      this.searchKeyword = ''
      this.$emit('search', '')
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
