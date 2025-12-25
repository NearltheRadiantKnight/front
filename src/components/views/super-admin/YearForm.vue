<template>
  <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑答辩年份' : '新增答辩年份'"
      width="500px"
      @closed="handleClosed"
  >
    <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
    >
      <el-form-item label="答辩年份" prop="year">
        <el-input
            v-model.number="formData.year"
            placeholder="请输入答辩年份，如：2025"
            type="number"
            min="2020"
            max="2100"
            :disabled="isEdit"
        ></el-input>
      </el-form-item>
      <el-form-item label="年份状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio label="active">启用</el-radio>
          <el-radio label="inactive">停用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="()=>{$emit('update-visible', false)}">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: 'YearFormDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    formData: {
      type: Object,
      default: () => ({
        year: new Date().getFullYear(),
        status: 'active'
      })
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update-visible', 'submit'],
  data() {
    return {
      submitting: false,
      rules: {
        year: [
          { required: true, message: '请填写答辩年份', trigger: 'blur' },
          { type: 'number', message: '年份必须为数字', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(value) {
        this.$emit('update-visible', value)
      }
    }
  },
  methods: {
    handleSubmit() {
      this.$refs.formRef.validate(async (valid) => {
        if (valid) {
          this.submitting = true
          try {
            await this.$emit('submit', { ...this.formData })
            this.dialogVisible = false
          } catch (error) {
            console.error('提交失败:', error)
          } finally {
            this.submitting = false
          }
        }
      })
    },

    handleClosed() {
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
