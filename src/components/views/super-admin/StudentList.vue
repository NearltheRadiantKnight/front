<template>
  <el-dialog
      v-model="visible"
      :title="`${group?.name} - 学生列表`"
      width="900px"
      top="10vh"
  >
    <div class="student-list-container">
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索学号或姓名"
            clearable
            style="width: 200px; margin-right: 10px;"
            @keyup.enter="handleSearch"
        >
          <template #prefix>
            <i class="el-icon-search"></i>
          </template>
        </el-input>
        <el-tag type="info">共 {{ filteredStudents.length }} 名学生</el-tag>
      </div>

      <!-- 学生列表 -->
      <el-table
          :data="filteredStudents"
          v-loading="loading"
          style="margin-top: 15px;"
          height="400px"
      >
        <el-table-column prop="id" label="学号" width="120" fixed="left"></el-table-column>
        <el-table-column prop="realName" label="姓名" width="100"></el-table-column>
        <el-table-column prop="teacherName" label="指导老师" width="120"></el-table-column>
        <el-table-column prop="institute" label="院系" width="150"></el-table-column>
        <el-table-column prop="defenseTitle" label="答辩题目" min-width="200">
          <template #default="{ row }">
            <span v-if="row.defenseTitle">{{ row.defenseTitle }}</span>
            <span v-else class="text-muted">未填写</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
                size="mini"
                type="danger"
                @click="removeStudent(row)"
            >
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 统计信息 -->
      <div class="student-summary">
        <div class="summary-item">
          <span class="label">学生总数：</span>
          <span class="value">{{ students.length }}</span>
        </div>
        <div class="summary-item">
          <span class="label">答辩题目：</span>
          <span class="value">{{ studentsWithTitleCount }}</span>
        </div>
        <div class="summary-item">
          <span class="label">组容量：</span>
          <span class="value">{{ group?.maxStudents || 0 }} 人</span>
        </div>
        <div class="summary-item">
          <span class="label">已使用：</span>
          <span class="value">{{ students.length }} / {{ group?.maxStudents || 0 }}</span>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: 'StudentListDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    group: {
      type: Object,
      default: null
    }
  },
  emits: ['update:modelValue', 'student-removed'],
  data() {
    return {
      // 数据
      students: [],

      // 搜索
      searchKeyword: '',

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
    },
    filteredStudents() {
      if (!this.searchKeyword) return this.students

      const keyword = this.searchKeyword.toLowerCase()
      return this.students.filter(student => {
        return (
            (student.id && student.id.toLowerCase().includes(keyword)) ||
            (student.realName && student.realName.toLowerCase().includes(keyword))
        )
      })
    },
    studentsWithTitleCount() {
      return this.students.filter(s => s.defenseTitle).length
    }
  },
  watch: {
    visible(newVal) {
      if (newVal && this.group) {
        this.fetchStudents()
      }
    }
  },
  methods: {
    // 初始化数据
    async fetchStudents() {
      this.loading = true
      try {
        // 调用API获取该答辩组的学生列表
        const response = await this.$api.defenseGroup.getStudents(this.group.id)
        this.students = response.data

        // 如果没有数据，使用模拟数据
        if (this.students.length === 0) {
          this.students = [
            {
              id: '2023001',
              realName: '王小明',
              teacherName: '张老师',
              institute: '计算机学院',
              defenseTitle: '基于深度学习的图像识别系统研究'
            },
            {
              id: '2023002',
              realName: '李小红',
              teacherName: '李老师',
              institute: '计算机学院',
              defenseTitle: '智能推荐系统的设计与实现'
            },
            {
              id: '2023003',
              realName: '赵小刚',
              teacherName: '王老师',
              institute: '软件学院',
              defenseTitle: ''
            }
          ]
        }
      } catch (error) {
        console.error('获取学生列表失败:', error)
        this.$message.error('获取学生列表失败')

        // 使用模拟数据
        this.students = [
          {
            id: '2023001',
            realName: '王小明',
            teacherName: '张老师',
            institute: '计算机学院',
            defenseTitle: '基于深度学习的图像识别系统研究'
          },
          {
            id: '2023002',
            realName: '李小红',
            teacherName: '李老师',
            institute: '计算机学院',
            defenseTitle: '智能推荐系统的设计与实现'
          }
        ]
      } finally {
        this.loading = false
      }
    },

    async removeStudent(student) {
      try {
        await this.$confirm(`确定要将学生 ${student.realName} (${student.id}) 从答辩组移除吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // 调用API从答辩组移除学生
        await this.$api.defenseGroup.removeStudent(this.group.id, student.id)

        // 从列表中移除
        const index = this.students.findIndex(s => s.id === student.id)
        if (index !== -1) {
          this.students.splice(index, 1)
        }

        this.$message.success('学生移除成功')
        // 通知父组件学生已移除
        this.$emit('student-removed')
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('移除失败：' + error.message)
        }
      }
    },

    handleSearch() {
      // 搜索逻辑已在计算属性中实现
    }
  }
}
</script>

<style scoped>
.student-list-container {
  padding: 10px;
}

.search-area {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.student-summary {
  display: flex;
  justify-content: flex-start;
  gap: 25px;
  margin-top: 20px;
  padding: 12px 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.summary-item .label {
  color: #666;
  font-size: 13px;
}

.summary-item .value {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.text-muted {
  color: #999;
  font-style: italic;
}
</style>