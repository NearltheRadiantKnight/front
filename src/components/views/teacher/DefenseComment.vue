<template>
  <div>
    <!-- 评语显示和操作区域 -->
    <div class="comment-section" v-if="isDefenseLeader">
      <div class="comment-actions">
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
              @click="generateCommentWithAI(student.type)"
              :loading="generating"
          >
            调用AI生成
          </el-button>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
              type="success"
              @click="saveComment(comment)"
              :loading="saving"
          >
            保存评语
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<!-- file: DefenseComment.vue（修改script部分） -->
<script lang="ts">
import {defineComponent, ref, PropType, watch, onMounted} from 'vue';
import { ElMessage } from 'element-plus';
import request from "@/api";

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
    const comment = ref('');
    const generating = ref(false);
    const saving = ref(false);
    const promptTemplate = ref(props.promptTemplate);

    // 监听student变化，重置comment
    watch(() => props.student, (newStudent) => {
      comment.value = newStudent.comment || '';
    }, { immediate: true });

    const generateComment = async (type? : number) => {
      if (props.student.generatingComment) return;

      try {
        // 设置loading状态
        emit('update:comment', '');

        // 获取用户信息
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) {
          ElMessage.error('用户信息不存在');
          return;
        }
        const user = JSON.parse(userInfo);

        await loadpromptTemplate(type);
        // 调用后端AI生成评语
        const response = await request.post("/ai/comment/generate", {
          studentId: props.student.id,
          teacherId: user.id,
          title: props.student.title,
          summary: props.student.summary,
          type: props.student.type,
          commentType: 'defense',
          prompt: promptTemplate.value
              .replace('{student_name}', props.student.real_name)
              .replace('{thesis_title}', props.student.title || '')
              .replace('{thesis_type}', getTypeText(props.student.type))
              .replace('{thesis_summary}', props.student.summary || '')
              .replace('{student_id}', props.student.id)
        });
        if (response.data) {
          const generatedComment = JSON.parse(response.data).output.choices[0].message.content;
          if (generatedComment) {
            await saveComment(generatedComment);

            emit('update:comment', generatedComment);
            emit('generate-comment', {
              studentId: props.student.id,
              comment: generatedComment
            });

            ElMessage.success('评语生成成功');
          } else {
            ElMessage.error('生成评语失败');
          }
        } else {
          ElMessage.error(response.data?.message || '生成评语失败');
        }
      } catch (error) {
        console.error('生成评语失败:', error);
        ElMessage.error('生成评语失败');
      }
    };

    // 编辑评语
    const editComment = () => {
      comment.value = props.student.comment || '';
      dialogVisible.value = true;
    };

    // 调用AI生成评语（对话框内）
    const generateCommentWithAI = async (type? : number) => {
      generating.value = true;
      try {
        // 获取用户信息
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) {
          ElMessage.error('用户信息不存在');
          return;
        }
        const user = JSON.parse(userInfo);

        await loadpromptTemplate(type);
        // 调用后端AI生成评语
        const response = await request.post("/ai/comment/generate", {
          studentId: props.student.id,
          teacherId: user.id,
          title: props.student.title,
          summary: props.student.summary,
          type: props.student.type,
          commentType: 'defense',
          prompt: promptTemplate.value
              .replace('{student_name}', props.student.real_name)
              .replace('{thesis_title}', props.student.title || '')
              .replace('{thesis_type}', getTypeText(props.student.type))
              .replace('{thesis_summary}', props.student.summary || '')
              .replace('{student_id}', props.student.id)
        });

        if (response.data) {
          const generatedComment = JSON.parse(response.data).output.choices[0].message.content;
          if (generatedComment) {
            comment.value = generatedComment;
            ElMessage.success('AI评语生成成功');
          } else {
            ElMessage.error('生成评语失败');
          }
        } else {
          ElMessage.error(response.data?.message || '生成评语失败');
        }
      } catch (error) {
        console.error('调用AI生成评语失败:', error);
        ElMessage.error('生成评语失败');
      } finally {
        generating.value = false;
      }
    };

    // 保存生成的评语到数据库
    const saveComment = async (comment: string) => {
      try {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) return;

        const user = JSON.parse(userInfo);

        await request.post('/ai/comment/save', {
          gid: user.groupId,
          student_id: props.student.id,
          comment: comment,
          commentType: 'defense',
          teacherId: user.id,
          teacherName: user.real_name || user.realName
        });
        ElMessage.success("评语保存成功");
      } catch (error) {
        console.error('保存评语失败:', error);
        throw error;
      }
    };

    const loadpromptTemplate = async (type? : number) => {
      request.get("/ai/prompts/load").then(res=>{
        if (type === 1)
        {
          promptTemplate.value = res.data.designCommentPrompt;
        }
        else{
          promptTemplate.value = res.data.thesisCommentPrompt;
        }
      });
    }
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
      generateCommentWithAI,
      editComment,
      getTypeTagType,
      getTypeText,
      saveComment,
      loadpromptTemplate
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
