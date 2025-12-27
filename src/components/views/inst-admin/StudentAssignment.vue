<template>
  <el-dialog
      v-model="visible"
      :title="`学生分配`"
      width="900px"
      top="2vh"
  >
    <!-- 学生分配 -->
    <div class="assign-students">
      <h4>分配新学生</h4>

      <!-- 可用学生列表 -->
      <div class="available-students">
        <el-table
            :data="availableStudents"
            size="medium"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="studentId" label="学号" width="120"></el-table-column>
          <el-table-column prop="realName" label="姓名" width="100"></el-table-column>
          <el-table-column prop="teacherName" label="指导老师" width="150"></el-table-column>
          <el-table-column prop="instituteName" label="院系" width="180"></el-table-column>
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
    <div class="pagination">
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
      />
    </div>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script>
import request from "@/api/index.ts";
import {ref} from "vue";

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

      // 状态
      loading: false,

      currentPage:1,
      pageSize:10,
      total:0
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
      }
    }
  },
  methods: {
    // 初始化数据
    async fetchAvailableStudents() {
      const userinfo = JSON.parse(localStorage.getItem('userInfo'));
      this.loading = true;
      await request.get("/students/listunassign", {
        params:{
          institute_id: userinfo.InstId,
          currentpage: this.currentPage,
          pagesize: this.pageSize
        }
      }).then(res=>{
        this.availableStudents = res.data;
      }).finally(()=>{this.loading = false;});
      await request.get("/students/unassigncount",{
        params:{
          institute_id: userinfo.InstId
        }
      }).then(res=>{
        this.total = res.data;
      })
    },

    async assignStudent() {
      if (!this.selectedStudentId) return

      await request.post('/students/assign-group', {
        student_id: this.selectedStudentId,
        group_id: this.group.id
      }).then(res=>{
        this.fetchAvailableStudents();
      }).catch(err=>{
        this.$message.error('分配失败' + err.message);
      });
    },

    assignSingleStudent(student) {
      this.selectedStudentId = student.id
      this.assignStudent()
    },

    async removeStudent(student) {
      try {
        await this.$api.defenseGroup.removeStudent(this.group.id, student.id)

        // 刷新学生列表
        await this.fetchAvailableStudents()

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
