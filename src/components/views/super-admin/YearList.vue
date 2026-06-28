<template>
  <el-card class="year-list-card" shadow="never">
    <template #header>
      <div class="card-header">
        <h3>答辩年份列表</h3>
        <span class="total-count">共 {{ years.length }} 个答辩年份</span>
      </div>
    </template>

    <el-table
      :data="years"
      row-key="year"
      v-loading="loading"
      default-expand-all
    >
      <el-table-column type="expand" width="48">
        <template #default="{ row }">
          <div class="institute-panel">
            <el-table
              v-if="row.institutes && row.institutes.length > 0"
              :data="row.institutes"
              size="small"
              border
              class="institute-table"
            >
              <el-table-column prop="name" label="学院" min-width="180" />
              <el-table-column prop="groupCount" label="答辩组数" width="130">
                <template #default="{ row: institute }">
                  <el-tag size="small" :type="getGroupCountType(institute.groupCount)">
                    {{ institute.groupCount || 0 }} 个
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="defenseCount" label="答辩学生数" width="130">
                <template #default="{ row: institute }">
                  <el-tag type="info" size="small">
                    {{ institute.defenseCount || 0 }} 人
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="160" fixed="right">
                <template #default="{ row: institute }">
                  <el-button
                    size="small"
                    type="primary"
                    @click="$emit('manage-institute-groups', row, institute)"
                  >
                    管理答辩组
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <el-empty
              v-else
              description="暂无学院数据"
              :image-size="80"
            />
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="year" label="答辩年份" width="140" sortable>
        <template #default="{ row }">
          <span class="year-badge">{{ row.year }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="groupCount" label="总答辩组数" width="140">
        <template #default="{ row }">
          <el-tag size="small" :type="getGroupCountType(row.groupCount)">
            {{ row.groupCount || 0 }} 个
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="defenseCount" label="总答辩学生数" width="150">
        <template #default="{ row }">
          <el-tag type="info" size="small">{{ row.defenseCount || 0 }} 人</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="学院分类" min-width="140">
        <template #default="{ row }">
          {{ row.institutes?.length || 0 }} 个学院
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button
            size="small"
            type="danger"
            plain
            @click="$emit('delete-year', row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

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
  emits: ['manage-institute-groups', 'add-year', 'delete-year'],
  methods: {
    getGroupCountType(count) {
      const value = Number(count || 0)
      if (value === 0) return 'info'
      if (value <= 2) return ''
      if (value <= 5) return 'success'
      return 'warning'
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

.card-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.total-count {
  color: #606266;
  font-size: 14px;
}

.year-badge {
  display: inline-block;
  padding: 4px 12px;
  background: #eef5ff;
  color: #235ea8;
  border: 1px solid #c8ddff;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
}

.institute-panel {
  padding: 12px 16px 16px 48px;
  background: #fafcff;
}

.institute-table {
  width: 100%;
}

:deep(.el-table__expanded-cell) {
  padding: 0;
}
</style>
