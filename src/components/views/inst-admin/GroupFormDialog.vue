<template>
  <el-dialog
      v-model="visible"
      :title="'编辑答辩组'"
      width="500px"
      @closed="resetForm"
  >
    <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
    >
      <el-form-item label="组长" prop="adminId">
        <el-select
            v-model="formData.admin_id"
            placeholder="请选择答辩组组长"
            style="width: 100%"
            filterable
            clearable
        >
          <el-option
              v-for="teacher in teachers"
              :key="teacher.id"
              :label="`${teacher.realName} (${teacher.id})`"
              :value="teacher.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="最大学生数">
        <el-input-number
            v-model="formData.maxStudents"
            :min="1"
            :max="30"
            placeholder="请输入最大学生数"
            style="width: 100%"
        ></el-input-number>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false;">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: 'GroupFormDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    formData: {
      type: Object,
      default: () => ({
        id: null,
        year: '',
        adminId: '',
        maxStudents: 10,
      })
    },
    teachers: {
      type: Array,
      default: () => []
    },
    year: {
      type: Object,
      default: null
    }
  },
  emits: ['update:modelValue', 'submit'],
  data() {
    return {
      submitting: false,
      rules: {
        admin_id: [
          { required: true, message: '请选择组长', trigger: 'change' }
        ],
        maxStudents: [
          { required: true, message: '请设置最大学生数', trigger: 'blur' },
          { type: 'number', min: 1, max: 30, message: '学生数范围1-30', trigger: 'blur' }
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
    }
  },
  methods: {
    handleSubmit() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          this.submitting = true
          const submitData = {
            ...this.formData,
            year: this.year?.year || this.formData.year
          }
          this.$emit('submit', submitData)
          this.submitting = false;
          this.visible = false;
        }
      })
    },

    resetForm() {
      this.$refs.formRef?.resetFields()
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
