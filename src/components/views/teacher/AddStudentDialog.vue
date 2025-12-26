<template>
  <el-dialog
      v-model="visible"
      title="添加指导学生"
      width="500px"
      @close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="学生学号" prop="studentId">
        <el-input
            v-model="form.studentId"
            placeholder="请输入学生学号"
            @blur="$emit('search-student', form.studentId)"
        />
        <div v-if="searchResult" class="search-result">
          找到学生：{{ searchResult.real_name }} ({{ searchResult.institute_name }})
        </div>
      </el-form-item>

      <el-form-item label="指导年份" prop="year">
        <el-select v-model="form.year" placeholder="请选择指导年份">
          <el-option
              v-for="year in availableYears"
              :key="year"
              :label="`${year}年`"
              :value="year"
          />
        </el-select>
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
import { defineComponent, reactive, ref } from 'vue';
import { FormInstance, FormRules } from 'element-plus';

interface StudentSearchResult {
  id: string;
  real_name: string;
  institute_name: string;
}

interface AddStudentForm {
  studentId: string;
  year: number;
}

interface Props {
  visible: boolean;
  availableYears: number[];
  searchResult?: StudentSearchResult | null;
}

export default defineComponent({
  name: 'AddStudentDialog',

  props: {
    visible: {
      type: Boolean,
      required: true
    },
    availableYears: {
      type: Array as () => number[],
      default: () => [2024, 2025, 2026]
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

    const form = reactive<AddStudentForm>({
      studentId: '',
      year: props.availableYears[0] || new Date().getFullYear()
    });

    const rules: FormRules = {
      studentId: [{ required: true, message: '请输入学生学号', trigger: 'blur' }],
      year: [{ required: true, message: '请选择指导年份', trigger: 'change' }]
    };

    const handleConfirm = async () => {
      if (!formRef.value) return;

      try {
        const valid = await formRef.value.validate();
        if (valid && props.searchResult) {
          saving.value = true;
          // 触发确认事件，传递表单数据
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
        form.studentId = '';
        form.year = props.availableYears[0] || new Date().getFullYear();
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