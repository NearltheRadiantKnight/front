<template>
  <el-dialog
      v-model="visible"
      title="添加指导学生"
      width="500px"
      @close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="学生学号" prop="student_id">
        <el-input
            v-model="form.student_id"
            placeholder="请输入学生学号"
            @blur="$emit('search-student', form.student_id)"
        />
        <div v-if="searchResult" class="search-result">
          找到学生：{{ searchResult.realName }} ({{ searchResult.instituteName }})
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button
            type="primary"
            @click="handleConfirm"
            :disabled="!searchResult"
            :loading="saving"
        >
          添加
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import {defineComponent, onMounted, reactive, ref} from 'vue';
import type {FormInstance, FormRules} from 'element-plus';

interface StudentSearchResult {
  id: string;
  realName: string;
  instituteName: string;
}

interface AddStudentForm {
  student_id: string;
  teacher_id: string;
  year: number;
}

export default defineComponent({
  name: 'AddStudentDialog',

  props: {
    visible: {
      type: Boolean,
      required: true
    },
    searchResult: {
      type: Object as () => StudentSearchResult | null,
      default: null
    }
  },

  emits: ['update:visible', 'confirm', 'cancel', 'search-student'],

  setup(props, { emit }) {
    const formRef = ref<FormInstance>();
    const saving = ref(false);
    const currentyear = ref(0);
    const teacher_id = ref('');

    const form = reactive<AddStudentForm>({
      student_id: '',
      teacher_id: teacher_id.value,
      year: currentyear.value
    });

    const rules: FormRules = {
      studentId: [{ required: true, message: '请输入学生学号', trigger: 'blur' }]
    };

    const handleConfirm = async () => {
      if (!formRef.value) return;

      try {
        const valid = await formRef.value.validate();
        if (valid && props.searchResult) {
          saving.value = true;
          form.teacher_id = teacher_id.value;
          form.year = currentyear.value;
          emit('confirm', {
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

    // 重置表单
    const resetForm = () => {
      if (formRef.value) {
        formRef.value.resetFields();
        form.student_id = '';
        form.teacher_id = teacher_id.value;
        form.year = currentyear.value;
      }
    };
    onMounted(()=>{
      const userData = JSON.parse(localStorage.getItem("userInfo") || "");
      currentyear.value = userData.groupYear;
      teacher_id.value = userData.id;
    });

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

.search-result {
  margin-top: 5px;
  padding: 8px;
  background-color: #f0f9eb;
  border: 1px solid #e1f3d8;
  border-radius: 4px;
  color: #67C23A;
  font-size: 13px;
}
</style>
