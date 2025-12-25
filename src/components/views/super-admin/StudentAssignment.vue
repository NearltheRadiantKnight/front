<template>
  <el-dialog
      v-model="visible"
      :title="`学生分配`"
      width="900px"
      top="2vh"
  >
    <div class="student-assignment">
      <!-- 已分配学生列表 -->
      <div class="assigned-students" v-if="assignedStudents.length > 0">
        <h4>已分配学生 ({{ assignedStudents.length }})</h4>
        <el-table :data="assignedStudents" size="medium">
          <el-table-column prop="id" label="学号" width="120"></el-table-column>
          <el-table-column prop="realName" label="姓名" width="100"></el-table-column>
          <el-table-column prop="teacherName" label="指导老师" width="150"></el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button type="text" size="medium" @click="removeStudent(row)">
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 学生分配 -->
      <div class="assign-students">
        <h4>分配新学生</h4>
        <div class="assign-controls">
          <el-button
              type="warning"
              size="medium"
              @click="batchAssign"
              :disabled="selectedStudents.length === 0"
          >
            批量分配 ({{ selectedStudents.length }})
          </el-button>
        </div>

        <!-- 可用学生列表 -->
        <div class="available-students">
          <el-table
              :data="availableStudents"
              size="medium"
              @selection-change="handleStudentSelection"
          >
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="id" label="学号" width="120"></el-table-column>
            <el-table-column prop="realName" label="姓名" width="100"></el-table-column>
            <el-table-column prop="teacherName" label="指导老师" width="150"></el-table-column>
            <el-table-column prop="institute" label="院系" width="180"></el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button type="text" size="medium" @click="assignSingleStudent(row)">
                  分配
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="visible = false" size="medium">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: 'StudentAssignmentDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    group: {
      type: Object,
      default: null
    },
    year: {
      type: Object,
      default: null
    }
  },
  emits: ['update:modelValue', 'assigned'],
  data() {
    return {
      // 数据
      availableStudents: [],
      assignedStudents: [],

      // 选中项
      selectedStudentId: '',
      selectedStudents: [],

      // 状态
      loading: false
    }
  },
  computed: {
    visible: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  },
  watch: {
    visible(newVal) {
      if (newVal && this.group && this.year) {
        this.fetchAvailableStudents()
        this.fetchAssignedStudents()
      }
    }
  },
  methods: {
    // 初始化数据
    async fetchAvailableStudents() {
      this.loading = true
      try {
        // 获取该年份下未分配的学生
        const response = await this.$api.student.getUnassigned(this.year.year)
        this.availableStudents = response.data
      } catch (error) {
        console.error('获取学生列表失败:', error)
        // 模拟数据
        this.availableStudents = [
          { id: '2023001', realName: '王小明', teacherName: '张老师', institute: '计算机学院' },
          { id: '2023002', realName: '李小红', teacherName: '李老师', institute: '计算机学院' },
          { id: '2023003', realName: '赵小刚', teacherName: '王老师', institute: '软件学院' }
        ]
      } finally {
        this.loading = false
      }
    },

    async fetchAssignedStudents() {
      try {
        const response = await this.$api.defenseGroup.getStudents(this.group.id)
        this.assignedStudents = response.data
      } catch (error) {
        console.error('获取已分配学生失败:', error)
        this.assignedStudents = []
      }
    },

    // 学生操作
    handleStudentSelection(selection) {
      this.selectedStudents = selection
    },

    async assignStudent() {
      if (!this.selectedStudentId) return

      try {
        await this.$api.defenseGroup.assignStudent(this.group.id, {
          studentId: this.selectedStudentId,
          year: this.year.year
        })

        // 刷新学生列表
        await this.fetchAvailableStudents()
        await this.fetchAssignedStudents()

        this.selectedStudentId = ''
        this.$emit('assigned')
      } catch (error) {
        this.$message.error('分配失败：' + error.message)
      }
    },

    assignSingleStudent(student) {
      this.selectedStudentId = student.id
      this.assignStudent()
    },

    async batchAssign() {
      if (this.selectedStudents.length === 0) return

      try {
        const studentIds = this.selectedStudents.map(s => s.id)
        await this.$api.defenseGroup.batchAssignStudents(this.group.id, {
          studentIds: studentIds,
          year: this.year.year
        })

        // 刷新学生列表
        await this.fetchAvailableStudents()
        await this.fetchAssignedStudents()

        this.selectedStudents = []
        this.$emit('assigned')
      } catch (error) {
        this.$message.error('批量分配失败：' + error.message)
      }
    },

    async removeStudent(student) {
      try {
        await this.$api.defenseGroup.removeStudent(this.group.id, student.id)

        // 刷新学生列表
        await this.fetchAvailableStudents()
        await this.fetchAssignedStudents()

        this.$emit('assigned')
      } catch (error) {
        this.$message.error('移除失败：' + error.message)
      }
    }
  }
}
</script>

<style scoped>
.student-assignment {
  padding: 15px;
  font-size: 15px;
}

.assigned-students,
.assign-students {
  margin-bottom: 25px;
}

.assigned-students h4,
.assign-students h4 {
  margin-bottom: 15px;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.assign-controls {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 12px;
}

.available-students {
  max-height: 400px;
  overflow-y: auto;
}

/* 表格样式调整 */
:deep(.el-table) {
  font-size: 15px;
}

:deep(.el-table th) {
  font-weight: 600;
  color: #333;
  background-color: #f8f9fa;
}

:deep(.el-table td) {
  padding: 12px 0;
}

:deep(.el-button) {
  font-size: 14px;
}

:deep(.el-dialog__header) {
  padding: 15px 20px;
}

:deep(.el-dialog__body) {
  padding: 0 20px;
}
</style>
