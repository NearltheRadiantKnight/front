<template>
  <el-dialog
      v-model="visible"
      :title="`${year?.year}年 - 答辩组管理`"
      width="75%"
      top="5vh"
      class="group-manager-dialog"
  >
    <!-- 答辩组列表 -->
    <GroupList
        :groups="groups"
        :loading="loading"
        @add-group="showAddGroupDialog"
        @edit-group="handleEditGroup"
        @manage-students="handleManageStudents"
        @view-students="handleViewStudents"
        @toggle-status="handleToggleGroupStatus"
        @delete-group="handleDeleteGroup"
    />

    <!-- 答辩组表单对话框 -->
    <GroupFormDialog
        v-model="groupFormVisible"
        :form-data="currentGroup"
        :teachers="teacherList"
        :year="year"
        :is-edit="!!currentGroup.id"
        @submit="handleSubmitGroup"
    />

    <!-- 学生分配对话框 -->
    <StudentAssignmentDialog
        v-model="studentDialogVisible"
        :group="selectedGroup"
        :year="year"
        @assigned="handleStudentAssigned"
    />

    <!-- 学生列表对话框 -->
    <StudentListDialog
        v-model="studentListDialogVisible"
        :group="selectedGroup"
        @student-removed="handleStudentRemoved"
    />
  </el-dialog>
</template>

<script>
import GroupList from './GroupList.vue'
import GroupFormDialog from './GroupFormDialog.vue'
import StudentAssignmentDialog from './StudentAssignment.vue'
import StudentListDialog from './StudentList.vue'
import request from "@/api/index.ts";

export default {
  name: 'GroupManager',
  components: {
    GroupList,
    GroupFormDialog,
    StudentAssignmentDialog,
    StudentListDialog
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    year: {
      type: Object,
      default: null
    }
  },
  emits: ['update:modelValue', 'refresh'],
  data() {
    return {
      // 数据
      groups: [],
      teacherList: [],

      // 对话框状态
      groupFormVisible: false,
      studentDialogVisible: false,
      studentListDialogVisible: false,

      // 表单数据
      currentGroup: {
        id: null,
        year: '',
        adminId: '',
        maxStudents: 10,
      },

      // 选中项
      selectedGroup: null,

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
      if (newVal && this.year) {
        this.fetchGroups()
        this.fetchTeachers()
      }
    }
  },
  methods: {
    // 初始化数据
    async fetchGroups() {
      this.loading = true

      request.get("/groups/all?year="+this.year.year).then(res=>{
        console.log(res.data)
        this.groups = res.data;
      }).finally(this.loading = false);

    },

    async fetchTeachers() {
      request.get("/teacher/list").then(res=>{
        this.teacherList = res.data;
      });
    },

    // 答辩组操作
    showAddGroupDialog() {
      this.currentGroup = {
        id: null,
        year: this.year?.year || '',
        adminId: '',
        maxStudents: 10,
      }
      this.groupFormVisible = true
    },

    handleEditGroup(group) {
      this.currentGroup = { ...group }
      this.groupFormVisible = true
    },

    async handleSubmitGroup(formData) {
      request.post("/groups/create", {...formData});
    },

    async handleToggleGroupStatus(group) {
      try {
        await this.$api.defenseGroup.updateStatus(group.id, group.status)
        this.$message.success('状态更新成功')
      } catch (error) {
        // 回滚状态
        group.status = group.status === 1 ? 0 : 1
        this.$message.error('状态更新失败')
      }
    },

    async handleDeleteGroup(group) {
      try {
        await this.$api.defenseGroup.delete(group.id)
        // 从列表中移除
        const index = this.groups.findIndex(g => g.id === group.id)
        if (index !== -1) {
          this.groups.splice(index, 1)
        }
        this.$message.success('删除成功')
        this.$emit('refresh')
      } catch (error) {
        this.$message.error('删除失败：' + error.message)
      }
    },

    // 学生操作
    handleManageStudents(group) {
      this.selectedGroup = group
      this.studentDialogVisible = true
    },

    handleViewStudents(group) {
      this.selectedGroup = group
      this.studentListDialogVisible = true
    },

    handleStudentAssigned() {
      // 刷新答辩组数据
      this.fetchGroups()
      this.$message.success('学生分配成功')
    },

    handleStudentRemoved() {
      // 刷新答辩组数据
      this.fetchGroups()
      this.$message.success('学生移除成功')
    }
  }
}
</script>

<style scoped>
.group-manager-dialog {
  max-width: 1000px;
}
</style>
