<template>
  <el-dialog
    v-model="visible"
    title="学生列表"
    width="980px"
    top="8vh"
  >
    <div class="student-list-container">
      <div class="search-area">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索学号或姓名"
          clearable
          style="width: 220px;"
        >
          <template #prefix>
            <i class="el-icon-search"></i>
          </template>
        </el-input>
        <el-button type="primary" size="small" :disabled="!canAddStudent" @click="openAddDialog">
          添加已有学生
        </el-button>
        <el-button type="success" size="small" :disabled="!canAddStudent" @click="openCreateDialog">
          新增学生
        </el-button>
        <el-tag type="info">共 {{ filteredStudents.length }} 名学生</el-tag>
      </div>

      <el-table
        :data="filteredStudents"
        v-loading="loading"
        style="margin-top: 15px;"
        height="400px"
      >
        <el-table-column prop="stu_id" label="学号" width="120" fixed="left" />
        <el-table-column prop="realName" label="姓名" width="100" />
        <el-table-column prop="teacherName" label="指导老师" width="120" />
        <el-table-column prop="instituteName" label="院系" width="160" />
        <el-table-column prop="title" label="答辩题目" min-width="220">
          <template #default="{ row }">
            <span v-if="row.title">{{ row.title }}</span>
            <span v-else class="text-muted">未填写</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="openEditDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="removeStudent(row)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>

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
          <span class="value">{{ groupCapacity }} 人</span>
        </div>
        <div class="summary-item">
          <span class="label">已使用：</span>
          <span class="value">{{ students.length }} / {{ groupCapacity }}</span>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="addDialogVisible"
      title="添加已有学生"
      width="720px"
      append-to-body
    >
      <el-table
        :data="unassignedStudents"
        v-loading="addLoading"
        height="360px"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="studentId" label="学号" width="130" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="teacherName" label="指导老师" width="140" />
        <el-table-column prop="instituteName" label="院系" min-width="160" />
      </el-table>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="addSubmitting" @click="addSelectedStudents">
          添加到当前组
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="studentDialogVisible"
      :title="isCreateMode ? '新增学生' : '编辑学生'"
      width="560px"
      append-to-body
    >
      <el-form ref="studentFormRef" :model="studentForm" :rules="studentRules" label-width="100px">
        <el-form-item label="学号" prop="student_id" required>
          <el-input v-model="studentForm.student_id" :disabled="!isCreateMode" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="姓名" prop="name" required>
          <el-input v-model="studentForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="studentForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="studentForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="考核类型" prop="type">
          <el-select v-model="studentForm.type" placeholder="请选择考核类型" style="width: 100%;">
            <el-option label="毕业论文" :value="1" />
            <el-option label="毕业设计" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="答辩题目" prop="title">
          <el-input v-model="studentForm.title" placeholder="请输入答辩题目" />
        </el-form-item>
        <el-form-item label="摘要" prop="summary">
          <el-input
            v-model="studentForm.summary"
            type="textarea"
            :rows="3"
            placeholder="请输入摘要"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="studentDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="studentSubmitting" @click="saveStudent">保存</el-button>
      </template>
    </el-dialog>

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
    },
    instituteId: {
      type: Number,
      default: 0
    }
  },
  emits: ['update:modelValue', 'students-changed'],
  data() {
    return {
      students: [],
      unassignedStudents: [],
      selectedStudents: [],
      searchKeyword: '',
      loading: false,
      addLoading: false,
      addSubmitting: false,
      addDialogVisible: false,
      studentDialogVisible: false,
      studentSubmitting: false,
      isCreateMode: false,
      studentForm: {
        student_id: '',
        name: '',
        phone: '',
        email: '',
        type: 1,
        title: '',
        summary: ''
      },
      studentRules: {
        student_id: [
          { required: true, message: '请输入学号', trigger: 'blur' },
          { pattern: /^[A-Za-z0-9_-]{1,30}$/, message: '学号只能包含字母、数字、下划线或短横线', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { min: 1, max: 20, message: '姓名长度不能超过20个字符', trigger: 'blur' }
        ],
        email: [
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        phone: [
          { pattern: /^1[3-9]\d{9}$|^$/, message: '请输入正确的手机号或留空', trigger: 'blur' }
        ]
      }
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
          (student.stu_id && student.stu_id.toLowerCase().includes(keyword)) ||
          (student.realName && student.realName.toLowerCase().includes(keyword))
        )
      })
    },
    studentsWithTitleCount() {
      return this.students.filter(s => s.title).length
    },
    groupCapacity() {
      return this.group?.max_student_count || this.group?.maxStudents || 0
    },
    remainingCapacity() {
      return Math.max(this.groupCapacity - this.students.length, 0)
    },
    canAddStudent() {
      return !!this.group?.id && !!this.instituteId && this.remainingCapacity > 0
    }
  },
  watch: {
    visible(newVal) {
      if (newVal && this.group) {
        this.fetchStudents()
      }
    },
    group() {
      if (this.visible && this.group) {
        this.fetchStudents()
      }
    }
  },
  methods: {
    async fetchStudents() {
      this.loading = true
      try {
        const res = await request.get("/groups/studentlist?group_id=" + this.group.id)
        this.students = res.data || []
      } catch (error) {
        this.$message.error('加载学生失败')
      } finally {
        this.loading = false
      }
    },

    async fetchUnassignedStudents() {
      if (!this.instituteId) {
        this.unassignedStudents = []
        return
      }

      this.addLoading = true
      try {
        const res = await request.get('/students/listunassign', {
          params: {
            institute_id: this.instituteId,
            currentpage: 1,
            pagesize: 200
          }
        })
        this.unassignedStudents = res.data || []
      } catch (error) {
        this.$message.error('加载未分配学生失败')
      } finally {
        this.addLoading = false
      }
    },

    openAddDialog() {
      if (!this.canAddStudent) {
        this.$message.warning('当前小组已满或缺少院系信息')
        return
      }
      this.selectedStudents = []
      this.addDialogVisible = true
      this.fetchUnassignedStudents()
    },

    handleSelectionChange(rows) {
      this.selectedStudents = rows
    },

    async addSelectedStudents() {
      if (this.selectedStudents.length === 0) {
        this.$message.warning('请选择学生')
        return
      }
      if (this.selectedStudents.length > this.remainingCapacity) {
        this.$message.warning(`当前小组还可添加 ${this.remainingCapacity} 人`)
        return
      }

      this.addSubmitting = true
      try {
        for (const student of this.selectedStudents) {
          const studentId = student.id || student.studentId
          const response = await request.post('/students/assign-group', {
            student_id: studentId,
            group_id: this.group.id,
            type: 1
          })
          if (response.code !== 200) {
            throw new Error(response.message || `学生 ${studentId} 添加失败`)
          }
        }

        this.$message.success('添加成功')
        this.addDialogVisible = false
        await this.fetchStudents()
        this.$emit('students-changed')
      } catch (error) {
        this.$message.error(error.message || '添加失败')
      } finally {
        this.addSubmitting = false
      }
    },

    openCreateDialog() {
      if (!this.canAddStudent) {
        this.$message.warning('当前小组已满或缺少院系信息')
        return
      }
      this.isCreateMode = true
      this.studentForm = {
        student_id: '',
        name: '',
        phone: '',
        email: '',
        type: 1,
        title: '',
        summary: ''
      }
      this.studentDialogVisible = true
    },

    async openEditDialog(row) {
      this.isCreateMode = false
      const studentId = row.stu_id || row.id
      this.studentForm = {
        student_id: studentId,
        name: row.realName || '',
        phone: '',
        email: '',
        type: row.type || 1,
        title: row.title || '',
        summary: row.summary || ''
      }

      try {
        const response = await request.get('/students/search?id=' + studentId)
        if (response.code === 200 && response.data) {
          this.studentForm.name = response.data.realName || this.studentForm.name
          this.studentForm.phone = response.data.tel || ''
          this.studentForm.email = response.data.email || ''
        }
      } catch (error) {
        this.$message.warning('学生基础信息加载失败，可继续编辑当前列表信息')
      }

      this.studentDialogVisible = true
    },

    async saveStudent() {
      this.$refs.studentFormRef.validate(async (valid) => {
        if (!valid) return

        this.studentSubmitting = true
        const studentPayload = {
          id: this.studentForm.student_id,
          realName: this.studentForm.name,
          tel: this.studentForm.phone,
          email: this.studentForm.email,
          instituteId: this.instituteId
        }

        try {
          if (this.isCreateMode) {
            const createRes = await request.post('/students/create', studentPayload)
            if (createRes.code !== 200) {
              throw new Error(createRes.message || '新增学生失败')
            }

            const assignRes = await request.post('/students/assign-group', {
              student_id: this.studentForm.student_id,
              group_id: this.group.id,
              type: this.studentForm.type || 1
            })
            if (assignRes.code !== 200) {
              throw new Error(assignRes.message || '加入答辩组失败')
            }
          } else {
            const updateRes = await request.post('/students/update', studentPayload)
            if (updateRes.code !== 200) {
              throw new Error(updateRes.message || '更新学生失败')
            }
          }

          await request.post('/students/settitle', {
            student_id: this.studentForm.student_id,
            title: this.studentForm.title,
            summary: this.studentForm.summary,
            type: this.studentForm.type || 1
          })

          this.$message.success('保存成功')
          this.studentDialogVisible = false
          await this.fetchStudents()
          this.$emit('students-changed')
        } catch (error) {
          this.$message.error(error.message || '保存失败')
        } finally {
          this.studentSubmitting = false
        }
      })
    },

    async removeStudent(student) {
      const studentId = student.stu_id || student.id
      try {
        await this.$confirm(`确定要将学生 ${student.realName} (${studentId}) 从答辩组移除吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const response = await request.post('/groups/deletefromgroup', {
          group_id: this.group.id,
          student_id: studentId
        })
        if (response.code !== 200 || !response.data) {
          this.$message.error(response.message || '移除失败')
          return
        }

        this.$message.success('学生移除成功')
        await this.fetchStudents()
        this.$emit('students-changed')
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('移除失败：' + error.message)
        }
      }
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
  gap: 10px;
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
