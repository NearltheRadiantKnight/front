<template>
  <el-dialog
      v-model="visible"
      :title="`学生列表`"
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
        <el-table-column prop="stu_id" label="学号" width="120" fixed="left"></el-table-column>
        <el-table-column prop="realName" label="姓名" width="100"></el-table-column>
        <el-table-column prop="teacherName" label="指导老师" width="120"></el-table-column>
        <el-table-column prop="instituteName" label="院系" width="150"></el-table-column>
        <el-table-column prop="title" label="答辩题目" min-width="200">
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
          <span class="label">已使用：</span>
          <span class="value">{{ students.length }} / {{ group?.max_student_count || 0 }}</span>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script>
import request from "@/api/index.ts";

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
      request.get("/groups/studentlist?group_id="+this.group.id).then(res=>{
        this.students = res.data;
      }).finally(this.loading = false);
    },

    async removeStudent(student) {
      await this.$confirm(`确定要将学生 ${student.realName} (${student.stu_id}) 从答辩组移除吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await request.post("/groups/deletefromgroup", {
        group_id: this.group.id,
        student_id: student.stu_id
      }).then(res => {
        const index = this.students.findIndex(s => s.id === student.id)
        if (index !== -1) {
          this.students.splice(index, 1)
        }
        this.$message.success('学生移除成功')
        this.$emit('student-removed')
      });
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
