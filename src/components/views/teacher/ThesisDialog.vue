<template>
  <el-dialog
      v-model="visible"
      :title="`填写题目摘要 - ${studentName}`"
      width="600px"
      @close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="毕业类型" prop="type">
        <el-select v-model="form.type" placeholder="请选择毕业考核类型">
          <el-option label="毕业论文" :value="0" />
          <el-option label="毕业设计" :value="1" />
        </el-select>
      </el-form-item>

      <el-form-item label="答辩题目" prop="title">
        <el-input
            v-model="form.title"
            placeholder="请输入毕业答辩题目"
            maxlength="128"
            show-word-limit
        />
      </el-form-item>

      <el-form-item label="摘要" prop="summary">
        <el-input
            v-model="form.summary"
            type="textarea"
            :rows="5"
            placeholder="请输入毕业考核摘要"
            maxlength="255"
            show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="saving">
          保存
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue';
import { ElMessage, FormInstance, FormRules } from 'element-plus';

interface ThesisForm {
  type: number;
  title: string;
  summary: string;
}

interface Props {
  visible: boolean;
  student_id: string;
  studentName: string;
  initialData?: ThesisForm;
}

export default defineComponent({
  name: 'ThesisDialog',

  props: {
    visible: {
      type: Boolean,
      required: true
    },
    student_id: {
      type: String,
      required: true
    },
    studentName: {
      type: String,
      required: true
    },
    initialData: {
      type: Object as () => ThesisForm,
      default: () => ({
        type: 0,
        title: '',
        summary: ''
      })
    }
  },

  emits: ['update:visible', 'confirm', 'cancel'],

  setup(props, { emit }) {
    const formRef = ref<FormInstance>();
    const saving = ref(false);

    const form = reactive<ThesisForm>({
      type: props.initialData.type || 0,
      title: props.initialData.title || '',
      summary: props.initialData.summary || ''
    });

    const rules: FormRules = {
      type: [{ required: true, message: '请选择毕业类型', trigger: 'change' }],
      title: [{ required: true, message: '请输入答辩题目', trigger: 'blur' }]
    };

    const handleConfirm = async () => {
      if (!formRef.value) return;

      try {
        const valid = await formRef.value.validate();
        if (valid) {
          saving.value = true;
          // 触发确认事件，传递表单数据
          emit('confirm', {
            student_id: props.student_id,
            ...form
          });
        }
      } catch (error) {
        console.error('表单验证失败:', error);
      }
    };

    const handleCancel = () => {
      emit('cancel');
    };

    const handleClose = () => {
      emit('update:visible', false);
    };

    // 当visible变化时，重置表单
    const resetForm = () => {
      if (formRef.value) {
        formRef.value.resetFields();
        Object.assign(form, {
          type: props.initialData.type || 0,
          title: props.initialData.title || '',
          summary: props.initialData.summary || ''
        });
      }
    };

    return {
      formRef,
      form,
      rules,
      saving,
      handleConfirm,
      handleCancel,
      handleClose,
      resetForm
    };
  },

  watch: {
    visible(newVal) {
      if (newVal) {
        this.resetForm();
      }
    }
  }
});
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
