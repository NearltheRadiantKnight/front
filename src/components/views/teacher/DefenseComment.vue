<template>
  <div>
    <!-- 评语显示和操作区域 -->
    <div class="comment-section" v-if="isDefenseLeader">
      <div v-if="student.comment" class="comment-content">
        {{ student.comment }}
      </div>
      <div v-else class="no-comment">
        无评语
      </div>
      <div class="comment-actions">
        <el-button
            type="text"
            size="mini"
            icon="el-icon-magic-stick"
            @click="generateComment"
            :loading="student.generatingComment"
        >
          生成
        </el-button>
        <el-button
            type="text"
            size="mini"
            icon="el-icon-edit"
            @click="editComment"
        >
          编辑
        </el-button>
      </div>
    </div>

    <!-- 评语编辑对话框 -->
    <el-dialog
        title="编辑答辩小组评语"
        v-model="dialogVisible"
        width="600px"
        :close-on-click-modal="false"
    >
      <div class="comment-edit-dialog">
        <div class="student-info">
          <el-tag type="info">{{ student.id }}</el-tag>
          <el-tag type="info">{{ student.real_name }}</el-tag>
          <el-tag :type="getTypeTagType(student.type)">
            {{ getTypeText(student.type) }}
          </el-tag>
        </div>

        <div class="thesis-title">
          <strong>题目：</strong>{{ student.title }}
        </div>

        <div class="thesis-summary" v-if="student.summary">
          <strong>摘要：</strong>
          <p>{{ student.summary }}</p>
        </div>

        <div class="prompt-template">
          <strong>提示词模板：</strong>
          <el-input
              type="textarea"
              v-model="promptTemplate"
              :rows="3"
              placeholder="请输入生成评语的提示词模板"
          />
          <div class="template-tips">
            提示：可以使用以下变量：{student_name} {thesis_title} {thesis_type} {thesis_summary}
          </div>
        </div>

        <div class="comment-editor">
          <el-input
              type="textarea"
              v-model="comment"
              :rows="6"
              placeholder="请输入答辩小组评语"
          />
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button
              type="primary"
              @click="generateCommentWithAI"
              :loading="generating"
          >
            调用AI生成
          </el-button>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
              type="success"
              @click="saveComment"
              :loading="saving"
          >
            保存评语
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from 'vue';
import { ElMessage } from 'element-plus';

interface Student {
  id: string;
  real_name: string;
  title?: string;
  type?: number;
  summary?: string;
  comment?: string;
  generatingComment?: boolean;
}

export default defineComponent({
  name: 'DefenseComment',
  props: {
    student: {
      type: Object as PropType<Student>,
      required: true
    },
    isDefenseLeader: {
      type: Boolean,
      default: false
    },
    promptTemplate: {
      type: String,
      default: `请为毕业论文(设计)答辩撰写评语。

学生姓名：{student_name}
题目：{thesis_title}
论文类型：{thesis_type}
摘要：{thesis_summary}

评语要求：
1. 简要评价论文(设计)的创新性、实用性
2. 指出优点和亮点
3. 提出改进建议
4. 语言专业、客观、鼓励性强
5. 字数控制在200-300字之间

请生成评语：`
    }
  },
  emits: ['update:comment', 'generate-comment'],

  setup(props, { emit }) {
    const dialogVisible = ref(false);
    const comment = ref(props.student.comment || '');
    const generating = ref(false);
    const saving = ref(false);
    const promptTemplate = ref(props.promptTemplate);

    // 生成评语
    const generateComment = async () => {
      props.student.generatingComment = true;
      try {
        // 构建提示词
        const prompt = promptTemplate.value
            .replace('{student_name}', props.student.real_name)
            .replace('{thesis_title}', props.student.title || '')
            .replace('{thesis_type}', getTypeText(props.student.type))
            .replace('{thesis_summary}', props.student.summary || '');

        // 模拟调用大模型API生成评语
        const generatedComment = `${props.student.real_name}同学的${getTypeText(props.student.type)}《${props.student.title}》选题具有一定的理论价值和实际意义。研究工作扎实，方法得当，数据分析合理。答辩过程中表述清晰，回答问题准确。建议在${props.student.type === 0 ? '理论深度' : '系统功能'}方面进一步完善。`;

        // 触发事件更新评语
        emit('update:comment', generatedComment);
        emit('generate-comment', { studentId: props.student.id, comment: generatedComment });

        ElMessage.success('评语生成成功');
      } catch (error) {
        console.error('生成评语失败:', error);
        ElMessage.error('生成评语失败');
      } finally {
        props.student.generatingComment = false;
      }
    };

    // 编辑评语
    const editComment = () => {
      comment.value = props.student.comment || '';
      dialogVisible.value = true;
    };

    // 调用AI生成评语
    const generateCommentWithAI = async () => {
      generating.value = true;
      try {
        // 构建提示词
        const prompt = promptTemplate.value
            .replace('{student_name}', props.student.real_name)
            .replace('{thesis_title}', props.student.title || '')
            .replace('{thesis_type}', getTypeText(props.student.type))
            .replace('{thesis_summary}', props.student.summary || '');

        // 模拟生成的评语
        const generatedComment = `${props.student.real_name}同学的${getTypeText(props.student.type)}《${props.student.title}》选题具有一定的理论价值和实际意义。研究工作扎实，方法得当，数据分析合理。答辩过程中表述清晰，回答问题准确。建议在${props.student.type === 0 ? '理论深度' : '系统功能'}方面进一步完善。`;

        comment.value = generatedComment;
        ElMessage.success('AI评语生成成功');
      } catch (error) {
        console.error('调用AI生成评语失败:', error);
        ElMessage.error('生成评语失败');
      } finally {
        generating.value = false;
      }
    };

    // 保存评语
    const saveComment = async () => {
      saving.value = true;
      try {
        // 触发事件保存评语
        emit('update:comment', comment.value);
        emit('generate-comment', { studentId: props.student.id, comment: comment.value });

        ElMessage.success('评语保存成功');
        dialogVisible.value = false;
      } catch (error) {
        console.error('保存评语失败:', error);
        ElMessage.error('保存评语失败');
      } finally {
        saving.value = false;
      }
    };

    // 工具函数
    const getTypeTagType = (type?: number) => {
      return type === 1 ? 'warning' : 'primary';
    };

    const getTypeText = (type?: number) => {
      return type === 1 ? '毕业设计' : '毕业论文';
    };

    return {
      dialogVisible,
      comment,
      generating,
      saving,
      promptTemplate,
      generateComment,
      editComment,
      generateCommentWithAI,
      saveComment,
      getTypeTagType,
      getTypeText
    };
  }
});
</script>

<style scoped>
.comment-section {
  padding: 4px 0;
}

.comment-content {
  font-size: 12px;
  line-height: 1.4;
  color: #606266;
  margin-bottom: 4px;
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.no-comment {
  color: #C0C4CC;
  font-style: italic;
  font-size: 12px;
  margin-bottom: 4px;
}

.comment-actions {
  display: flex;
  gap: 8px;
}

/* 评语编辑对话框样式 */
.comment-edit-dialog .student-info {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
}

.comment-edit-dialog .thesis-title {
  margin-bottom: 10px;
  font-size: 14px;
}

.comment-edit-dialog .thesis-summary {
  margin-bottom: 15px;
  font-size: 13px;
  color: #666;
}

.comment-edit-dialog .thesis-summary p {
  margin: 5px 0 0 0;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.comment-edit-dialog .prompt-template {
  margin-bottom: 15px;
}

.comment-edit-dialog .template-tips {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.comment-edit-dialog .comment-editor {
  margin-top: 15px;
}
</style>