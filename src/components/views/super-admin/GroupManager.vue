<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="75%"
    top="5vh"
    class="group-manager-dialog"
  >
    <GroupList
      :groups="groups"
      :loading="loading"
      @add-group="showAddGroupDialog"
      @edit-group="handleEditGroup"
      @view-students="handleViewStudents"
      @delete-group="handleDeleteGroup"
      @search="handleSearch"
    />

    <GroupFormDialog
      v-model="groupFormVisible"
      :form-data="currentGroup"
      :teachers="teacherList"
      :year="year"
      @submit="handleSubmitGroup"
    />

    <StudentListDialog
      v-model="studentListDialogVisible"
      :group="selectedGroup"
      :institute-id="instituteId"
      @students-changed="handleStudentsChanged"
    />
  </el-dialog>
</template>

<script>
import GroupList from './GroupList.vue'
import GroupFormDialog from './GroupFormDialog.vue'
import StudentListDialog from './StudentList.vue'
import request from "@/api/index.ts"
import { ElMessage } from "element-plus"

export default {
  name: 'GroupManager',
  components: {
    GroupList,
    GroupFormDialog,
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
    },
    instituteId: {
      type: Number,
      default: 0
    },
    instituteName: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'refresh'],
  data() {
    return {
      groups: [],
      teacherList: [],

      groupFormVisible: false,
      studentListDialogVisible: false,

      currentGroup: {
        id: null,
        year: '',
        admin_id: '',
        maxStudents: 10
      },

      selectedGroup: null,
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
    dialogTitle() {
      const yearText = this.year?.year ? `${this.year.year}年` : ''
      const instituteText = this.instituteName ? ` - ${this.instituteName}` : ''
      return `${yearText}${instituteText} - 答辩组管理`
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
    async fetchGroups() {
      this.loading = true
      const instituteQuery = this.instituteId > 0 ? `&institute_id=${this.instituteId}` : ''

      request.get("/groups/all?year=" + this.year.year + instituteQuery).then(res => {
        this.groups = res.data
      }).finally(() => {
        this.loading = false
      })
    },

    async fetchTeachers() {
      const instituteQuery = this.instituteId > 0 ? `?institute_id=${this.instituteId}` : ''
      request.get("/teachers/list" + instituteQuery).then(res => {
        this.teacherList = res.data
      })
    },

    showAddGroupDialog() {
      this.currentGroup = {
        id: null,
        year: this.year?.year || '',
        admin_id: '',
        maxStudents: 10
      }
      this.groupFormVisible = true
    },

    handleEditGroup(group) {
      this.currentGroup = {
        ...group,
        admin_id: group.admin_id || group.adminId || '',
        maxStudents: group.max_student_count || group.maxStudents || 10,
        year: group.year || this.year?.year || ''
      }
      this.groupFormVisible = true
    },

    async handleSubmitGroup(formData) {
      request.post("/groups/update", { ...formData }).then(res => {
        if (res.code === 200 && res.data) {
          ElMessage.success('保存成功')
          this.fetchGroups()
          this.$emit('refresh')
        } else {
          ElMessage.error(res.message || '保存失败')
        }
      })
    },

    async handleDeleteGroup(group) {
      try {
        request.post("/groups/delete", { ...group }).then(() => {
          this.fetchGroups()
        })
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

    handleViewStudents(group) {
      this.selectedGroup = group
      this.studentListDialogVisible = true
    },

    handleStudentsChanged() {
      this.fetchGroups()
      this.$emit('refresh')
    },

    async handleSearch(keyword) {
      if (!keyword || !keyword.trim()) {
        this.fetchGroups()
        return
      }
      this.loading = true
      const params = new URLSearchParams()
      params.append('year', this.year.year)
      params.append('keyword', keyword.trim())
      if (this.instituteId > 0) {
        params.append('instituteId', this.instituteId)
      }
      request.get(`/groups/search?${params.toString()}`).then(res => {
        this.groups = res.data
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style scoped>
.group-manager-dialog {
  max-width: 1000px;
}
</style>
