<template>
  <el-card class="year-list-card" shadow="never">
    <template #header>
      <div class="card-header">
        <h3>答辩年份列表</h3>
        <span class="total-count">共 {{ years.length }} 个答辩年份</span>
      </div>
    </template>

    <el-table :data="years" v-loading="loading">
      <el-table-column prop="year" label="答辩年份" width="120" sortable>
        <template #default="{ row }">
          <span class="year-badge">{{ row.year }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="groupCount" label="答辩组数量" width="120">
        <template #default="{ row }">
          <el-tag size="small" :type="getGroupCountType(row.groupCount)">
            {{ row.groupCount }} 个
          </el-tag>
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
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row, $index }">
          <div class="action-buttons">
            <!-- 主要操作：管理答辩组 -->
            <el-button
                size="small"
                type="primary"
                @click="$emit('manage-groups', row)"
                :disabled="row.status === 'inactive'"
            >
              <i class="el-icon-s-management"></i> 管理答辩组
            </el-button>

            <!-- 次要操作：更多选项 -->
            <el-dropdown @command="handleDropdownCommand($event, row, $index)" size="small">
              <el-button size="small">
                <i class="el-icon-more"></i> 更多
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                      :command="row.status === 'active' ? 'disable' : 'enable'"
                  >
                    <i
                        :class="row.status === 'active' ? 'el-icon-close' : 'el-icon-check'"
                        style="margin-right: 5px;"
                    ></i>
                    {{ row.status === 'active' ? '停用年份' : '启用年份' }}
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>
                    <i class="el-icon-delete" style="margin-right: 5px; color: #f56c6c;"></i>
                    <span style="color: #f56c6c;">删除年份</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 空状态 -->
    <el-empty
        v-if="years.length === 0 && !loading"
        description="暂无答辩年份数据"
        :image-size="100"
    >
      <el-button type="primary" size="small" @click="$emit('add-year')">
        创建第一个答辩年份
      </el-button>
    </el-empty>
  </el-card>
</template>

<script>
export default {
  name: 'YearList',
  props: {
    years: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['manage-groups', 'add-year', 'toggle-year-status', 'delete-year'],
  methods: {
    formatDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleDateString()
    },

    getGroupCountType(count) {
      if (count === 0) return 'info'
      if (count <= 2) return ''
      if (count <= 5) return 'success'
      return 'warning'
    },

    handleDropdownCommand(command, year, index) {
      switch (command) {
        case 'enable':
        case 'disable':
          this.$emit('toggle-year-status', year, index)
          break
        case 'delete':
          this.$emit('delete-year', year, index)
          break
      }
    }
  }
}
</script>

<style scoped>
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
  padding: 4px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 6px;
  font-weight: bold;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}


.el-dropdown-link {
  cursor: pointer;
  color: #409EFF;
  display: flex;
  align-items: center;
}

::v-deep .el-table .cell {
  display: flex;
  align-items: center;
}

/* 空状态样式 */
.el-empty {
  padding: 40px 0;
}
</style>