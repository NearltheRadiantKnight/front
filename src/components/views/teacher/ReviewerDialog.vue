<template>
  <el-dialog
      v-model="visible"
      :title="`选择评阅人 - ${studentName}`"
      width="700px"
      @close="handleClose"
  >
    <div class="reviewer-dialog-content">
      <!-- 同院系教师列表 -->
      <div class="institute-teachers">
        <h4>同院系教师列表</h4>
        <div class="teachers-grid">
          <div
              v-for="teacher in teachers"
              :key="teacher.id"
              class="teacher-card"
              :class="{ 'selected': selectedReviewerId === teacher.id }"
              @click="selectReviewer(teacher)"
          >
            <div class="teacher-info">
              <div class="teacher-name">{{ teacher.real_name }}</div>
              <div class="teacher-id">{{ teacher.id }}</div>
              <div class="teacher-role">
                <el-tag size="small" :type="teacher.role === 1 ? 'warning' : 'success'">
                  {{ teacher.role === 1 ? '院系管理员' : '教师' }}
                </el-tag>
              </div>
            </div>
            <div class="teacher-select">
              <el-icon v-if="selectedReviewerId === teacher.id" class="selected-icon">
                <Check />
              </el-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- 已选评阅人 -->
      <div class="selected-reviewer" v-if="selectedReviewerName">
        <h4>已选评阅人</h4>
        <div class="selected-info">
          <el-tag type="success" size="large">
            {{ selectedReviewerName }} ({{ selectedReviewerId }})
          </el-tag>
        </div>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button
            type="primary"
            @click="handleConfirm"
            :disabled="!selectedReviewerId"
            :loading="saving"
        >
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue';
import { Check } from '@element-plus/icons-vue';

interface Teacher {
  id: string;
  real_name: string;
  role: number;
  phone?: string;
  email?: string;
}

interface Props {
  visible: boolean;
  studentId: string;
  studentName: string;
  teachers: Teacher[];
  selectedReviewerId?: string;
  selectedReviewerName?: string;
}

export default defineComponent({
  name: 'ReviewerDialog',
  components: {
    Check
  },

  props: {
    visible: {
      type: Boolean,
      required: true
    },
    studentId: {
      type: String,
      required: true
    },
    studentName: {
      type: String,
      required: true
    },
    teachers: {
      type: Array as () => Teacher[],
      default: () => []
    },
    selectedReviewerId: {
      type: String,
      default: ''
    },
    selectedReviewerName: {
      type: String,
      default: ''
    }
  },

  emits: ['update:visible', 'confirm', 'cancel'],

  setup(props, { emit }) {
    const saving = ref(false);

    const selectedReviewerId = ref(props.selectedReviewerId || '');
    const selectedReviewerName = ref(props.selectedReviewerName || '');

    const selectReviewer = (teacher: Teacher) => {
      selectedReviewerId.value = teacher.id;
      selectedReviewerName.value = teacher.real_name;
    };

    const handleConfirm = async () => {
      saving.value = true;
      // 触发确认事件，传递选择的评分人信息
      emit('confirm', {
        studentId: props.studentId,
        reviewerId: selectedReviewerId.value,
        reviewerName: selectedReviewerName.value
      });
    };

    const handleCancel = () => {
      emit('cancel');
    };

    const handleClose = () => {
      emit('update:visible', false);
    };

    // 当props变化时更新内部状态
    const updateFromProps = () => {
      selectedReviewerId.value = props.selectedReviewerId || '';
      selectedReviewerName.value = props.selectedReviewerName || '';
    };

    return {
      saving,
      selectedReviewerId,
      selectedReviewerName,
      selectReviewer,
      handleConfirm,
      handleCancel,
      handleClose,
      updateFromProps
    };
  },

  watch: {
    visible(newVal) {
      if (newVal) {
        this.updateFromProps();
      }
    },
    selectedReviewerId(newVal) {
      if (newVal) {
        this.selectedReviewerId = newVal;
      }
    },
    selectedReviewerName(newVal) {
      if (newVal) {
        this.selectedReviewerName = newVal;
      }
    }
  }
});
</script>

<style scoped>
.reviewer-dialog-content {
  padding: 10px 0;
}

.institute-teachers h4 {
  margin: 0 0 15px 0;
  color: #303133;
}

.teachers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.teacher-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.teacher-card:hover {
  border-color: #409EFF;
  background-color: #f5f7fa;
}

.teacher-card.selected {
  border-color: #67C23A;
  background-color: #f0f9eb;
}

.teacher-info {
  flex: 1;
}

.teacher-name {
  font-weight: 500;
  margin-bottom: 5px;
  color: #303133;
}

.teacher-id {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.teacher-select {
  margin-left: 10px;
}

.selected-icon {
  color: #67C23A;
  font-size: 18px;
}

.selected-reviewer {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #e4e7ed;
}

.selected-reviewer h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.selected-info {
  display: flex;
  align-items: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>