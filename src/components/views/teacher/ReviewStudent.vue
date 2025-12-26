<template>
  <div class="review-student-container">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div>
        <h2 class="page-title">答辩成绩评分</h2>
        <p class="page-subtitle">为您的答辩小组成员进行打分和成绩评定</p>
      </div>
      <div class="header-actions">
        <el-button
            type="primary"
            icon="el-icon-download"
            @click="openExportDialog"
            :disabled="scoredStudentsCount === 0"
        >
          打包已评分成绩表
        </el-button>
      </div>
    </div>

    <!-- 答辩小组信息 -->
    <el-card class="group-info-card" shadow="never">
      <div class="group-info">
        <div class="group-info-item">
          <span class="info-label">答辩组号：</span>
          <span class="info-value">{{ currentGroup?.groupId || '未指定' }}</span>
        </div>
        <div class="group-info-item">
          <span class="info-label">已评分人数：</span>
          <span class="info-value">{{ scoredStudentsCount }}人</span>
        </div>
        <div class="group-info-item">
          <span class="info-label">未评分人数：</span>
          <span class="info-value">{{ groupStudents.length - scoredStudentsCount }}人</span>
        </div>
      </div>
    </el-card>

    <!-- 学生列表表格 -->
    <el-card class="student-table-card">
      <el-table
          :data="groupStudents"
          v-loading="loading"
          style="width: 100%"
          size="small"
          :default-sort="{prop: 'id', order: 'ascending'}"
      >
        <!-- 学生基本信息 -->
        <el-table-column prop="id" label="学号" width="100" sortable />
        <el-table-column prop="real_name" label="姓名" width="80" />

        <!-- 题目信息 -->
        <el-table-column label="题目" min-width="180">
          <template #default="scope">
            <div class="thesis-title">
              <strong>{{ scope.row.title || '未填写题目' }}</strong>
            </div>
            <div class="thesis-type">
              <el-tag :type="getTypeTagType(scope.row.type)" size="small">
                {{ getTypeText(scope.row.type) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <!-- 指导教师 -->
        <el-table-column prop="advisor_name" label="指导教师" width="100" />

        <!-- 当前成绩 -->
        <el-table-column label="当前成绩" width="120">
          <template #default="scope">
            <div v-if="scope.row.scores" class="score-info">
              <div class="total-score">
                <strong>总分：</strong>
                <span :class="{'has-score': scope.row.scores.total > 0}">
                  {{ scope.row.scores.total || 0 }}
                </span>
              </div>
              <div v-if="scope.row.scores.graded_by" class="graded-by">
                <small>评分人：{{ scope.row.scores.graded_by }}</small>
              </div>
            </div>
            <span v-else class="no-score">未评分</span>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag
                :type="getScoreStatusTagType(scope.row.scores)"
                size="small"
            >
              {{ getScoreStatusText(scope.row.scores) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="small"
                  @click="openScoreDialog(scope.row)"
                  :disabled="scope.row.status === 'defensed'"
              >
                评分
              </el-button>
              <el-button
                  type="success"
                  icon="el-icon-download"
                  size="small"
                  @click="exportSingleStudent(scope.row)"
                  :disabled="!scope.row.scores || scope.row.scores.total === 0"
                  title="导出该学生的成绩表"
              >
                导出
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态提示 -->
      <div v-if="groupStudents.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无答辩小组成员">
          <p>您目前没有被分配答辩小组，或者答辩小组暂无学生。</p>
        </el-empty>
      </div>
    </el-card>

    <!-- 使用提取的对话框组件 -->
    <ScoreDialog
        v-model:visible="scoreDialog.visible"
        :student="scoreDialog.student"
        :initial-scores="scoreDialog.initialScores"
        @confirm="saveScores"
        @cancel="scoreDialog.visible = false"
    />

    <!-- 导出对话框 -->
    <ExportDialog
        v-model:visible="exportDialog.visible"
        :scored-students-count="scoredStudentsCount"
        :group-id="currentGroup?.groupId"
        @confirm="handleExport"
        @cancel="exportDialog.visible = false"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import ScoreDialog from './ScoreDialog.vue';
import ExportDialog from './ExportDialog.vue';

interface Student {
  id: string;
  real_name: string;
  title?: string;
  type?: number; // 0: 论文, 1: 设计
  advisor_name?: string;
  scores?: DefenseScores;
}

interface DefenseScores {
  // 通用字段
  total: number;
  graded_by: string;
  graded_at: string;
  // 论文类型专用
  paper_quality?: number;
  presentation?: number;
  qa_performance?: number;
  // 设计类型专用
  design_quality1?: number;
  design_quality2?: number;
  design_quality3?: number;
  design_presentation?: number;
  design_qa1?: number;
  design_qa2?: number;
}

interface DefenseGroup {
  groupId: string;
  teacherId: string;
}

export default defineComponent({
  name: 'ReviewStudent',
  components: {
    ScoreDialog,
    ExportDialog
  },

  setup() {
    const loading = ref(false);
    const currentTeacherId = ref(''); // 从登录信息获取
    const currentGroup = ref<DefenseGroup | null>(null);
    const groupStudents = ref<Student[]>([]);

    // 对话框状态
    const scoreDialog = ref({
      visible: false,
      student: null as Student | null,
      initialScores: null as DefenseScores | null
    });

    const exportDialog = ref({
      visible: false
    });

    // 计算已评分学生数量
    const scoredStudentsCount = computed(() => {
      return groupStudents.value.filter(student => student.scores?.total > 0).length;
    });

    // 加载答辩小组信息
    const loadDefenseGroup = async () => {
      try {
        // 调用后端API获取当前教师的答辩小组信息
        // ...

        // 模拟数据
        currentGroup.value = {
          groupId: 'G2025001',
          teacherId: currentTeacherId.value
        };

        ElMessage.success('已加载答辩小组信息');
      } catch (error) {
        ElMessage.error('加载答辩小组信息失败');
      }
    };

    // 加载小组成员
    const loadGroupStudents = async () => {
      loading.value = true;
      try {
        // 调用后端API获取答辩小组成员
        // ...

        // 模拟数据
        groupStudents.value = [
          {
            id: '2023001',
            real_name: '王小明',
            title: '基于深度学习的图像识别系统研究',
            type: 0,
            advisor_name: '张教授',
            scores: {
              total: 85,
              graded_by: '李老师',
              graded_at: '2025-06-15',
              paper_quality: 35,
              presentation: 25,
              qa_performance: 25
            }
          },
          {
            id: '2023002',
            real_name: '张小红',
            title: '智能家居控制系统设计',
            type: 1,
            advisor_name: '王教授',
            scores: {
              total: 92,
              graded_by: '李老师',
              graded_at: '2025-06-15',
              design_quality1: 14,
              design_quality2: 13,
              design_quality3: 14,
              design_presentation: 23,
              design_qa1: 14,
              design_qa2: 14
            }
          },
          {
            id: '2023003',
            real_name: '李小刚',
            title: '云计算平台性能优化研究',
            type: 0,
            advisor_name: '刘教授',
          }
        ];

        ElMessage.success(`已加载 ${groupStudents.value.length} 名学生`);
      } catch (error) {
        ElMessage.error('加载学生列表失败');
      } finally {
        loading.value = false;
      }
    };

    // 打开评分对话框
    const openScoreDialog = (student: Student) => {
      scoreDialog.value = {
        visible: true,
        student: student,
        initialScores: student.scores || null
      };
    };

    // 保存成绩
    const saveScores = async (scoresData: any) => {
      try {
        // 调用后端API保存成绩
        // ...

        ElMessage.success('成绩保存成功');
        scoreDialog.value.visible = false;
        loadGroupStudents(); // 刷新列表
      } catch (error) {
        ElMessage.error('保存成绩失败');
      }
    };

    // 导出单个学生成绩表
    const exportSingleStudent = async (student: Student) => {
      if (!student.scores || student.scores.total === 0) {
        ElMessage.warning('该学生尚未评分，无法导出成绩表');
        return;
      }

      try {
        // 调用后端API导出单个学生成绩表
        console.log('导出单个学生成绩:', {
          teacherId: currentTeacherId.value,
          studentId: student.id,
          studentName: student.real_name,
          groupId: currentGroup.value?.groupId
        });

        // 模拟导出过程
        loading.value = true;

        // 这里应该调用后端API获取文件流
        // 示例：const response = await api.exportStudentScore(student.id);
        // 然后处理文件下载

        // 模拟延迟
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 模拟文件名
        const fileName = `${student.id}_${student.real_name}_成绩表.docx`;

        // 在实际项目中，这里应该处理文件下载
        console.log('下载文件:', fileName);

        ElMessage.success(`已导出 ${student.real_name} 的成绩表`);
      } catch (error) {
        ElMessage.error('导出失败');
      } finally {
        loading.value = false;
      }
    };

    // 打开导出对话框
    const openExportDialog = () => {
      if (scoredStudentsCount.value === 0) {
        ElMessage.warning('暂无已评分学生');
        return;
      }
      exportDialog.value.visible = true;
    };

    // 处理批量导出
    const handleExport = async (filename: string) => {
      try {
        // 调用后端API打包导出已评分成绩表
        // 这里应该传递当前教师的已评分学生列表
        const scoredStudents = groupStudents.value.filter(student => student.scores?.total > 0);

        console.log('导出参数:', {
          teacherId: currentTeacherId.value,
          groupId: currentGroup.value?.groupId,
          filename: filename,
          studentCount: scoredStudents.length,
          studentIds: scoredStudents.map(s => s.id)
        });

        ElMessage.success('已开始打包导出，请稍候下载');
        exportDialog.value.visible = false;
      } catch (error) {
        ElMessage.error('导出失败');
      }
    };

    // 工具函数
    const formatDate = (dateString: string) => {
      if (!dateString) return '未设置';
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN');
    };

    const getTypeTagType = (type?: number) => {
      return type === 1 ? 'warning' : 'primary';
    };

    const getTypeText = (type?: number) => {
      return type === 1 ? '毕业设计' : '毕业论文';
    };

    const getScoreStatusTagType = (scores?: DefenseScores) => {
      if (!scores || scores.total === 0) {
        return 'info';
      } else if (scores.total >= 90) {
        return 'success';
      } else if (scores.total >= 60) {
        return '';
      } else {
        return 'danger';
      }
    };

    const getScoreStatusText = (scores?: DefenseScores) => {
      if (!scores || scores.total === 0) {
        return '待评分';
      } else {
        return '已评分';
      }
    };

    // 初始化
    onMounted(() => {
      loadDefenseGroup();
      loadGroupStudents();
    });

    return {
      loading,
      currentGroup,
      groupStudents,
      scoreDialog,
      exportDialog,
      scoredStudentsCount,
      loadDefenseGroup,
      loadGroupStudents,
      openScoreDialog,
      saveScores,
      exportSingleStudent,
      openExportDialog,
      handleExport,
      formatDate,
      getTypeTagType,
      getTypeText,
      getScoreStatusTagType,
      getScoreStatusText
    };
  }
});
</script>

<style scoped>
.review-student-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  color: #333;
  margin: 0 0 5px 0;
  font-size: 22px;
}

.page-subtitle {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.group-info-card {
  margin-bottom: 20px;
  border: 1px solid #e4e7ed;
}

.group-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.group-info-item {
  display: flex;
  align-items: center;
}

.info-label {
  color: #606266;
  font-weight: 500;
}

.info-value {
  color: #303133;
  font-weight: 600;
}

.student-table-card {
  border-radius: 8px;
}

.thesis-title {
  margin-bottom: 4px;
  font-size: 12px;
  line-height: 1.4;
}

.thesis-type {
  display: inline-block;
}

.score-info {
  padding: 4px 0;
}

.total-score {
  font-size: 12px;
  line-height: 1.4;
}

.total-score .has-score {
  color: #409EFF;
  font-weight: 600;
}

.graded-by {
  color: #909399;
  font-size: 11px;
}

.no-score {
  color: #C0C4CC;
  font-style: italic;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}

.empty-state p {
  color: #909399;
  font-size: 14px;
  margin-top: 10px;
}

/* 调整表格样式 */
:deep(.el-table--small .el-table__row) {
  height: 48px;
}

:deep(.el-table--small td) {
  padding: 4px 0;
}

:deep(.el-button--small) {
  padding: 5px 8px;
  font-size: 12px;
}
</style>