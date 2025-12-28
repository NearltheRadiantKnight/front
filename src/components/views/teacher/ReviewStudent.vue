<template>
  <div class="review-student-container">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div>
        <h2 class="page-title">答辩成绩评分</h2>
        <p class="page-subtitle">为您的答辩小组成员进行打分和成绩评定</p>
      </div>
      <div class="header-actions">
        <!-- 答辩组长特有功能：生成评语 -->
        <el-button
            type="primary"
            icon="el-icon-edit"
            @click="generateAllComments"
            :disabled="!isDefenseLeader || groupStudents.length === 0"
            v-if="isDefenseLeader"
        >
          批量生成评语
        </el-button>
        <el-button
            type="warning"
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
        <!-- 答辩组长身份标识 -->
        <div class="group-info-item" v-if="isDefenseLeader">
          <el-tag type="warning" size="small">答辩组长模式</el-tag>
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
            </div>
            <span v-else class="no-score">未评分</span>
          </template>
        </el-table-column>

        <!-- 答辩组长特有功能：查看其他教师评分 -->
        <el-table-column label="其他评委评分" width="120" v-if="isDefenseLeader">
          <template #default="scope">
            <div class="teacher-scores-section">
              <div class="scores-count" v-if="scope.row.teacherScores && scope.row.teacherScores.length > 0">
                已评{{ scope.row.teacherScores.length }}人
              </div>
              <div v-else class="no-scores">
                无其他评分
              </div>
              <div class="view-action">
                <el-button
                    type="text"
                    size="mini"
                    icon="el-icon-view"
                    @click="viewTeacherScores(scope.row)"
                    :disabled="!scope.row.teacherScores || scope.row.teacherScores.length === 0"
                >
                  查看详情
                </el-button>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 答辩组长特有功能：答辩小组评语 -->
        <el-table-column label="答辩小组评语" width="180" v-if="isDefenseLeader">
          <template #default="scope">
            <DefenseComment
                :student="scope.row"
                :is-defense-leader="isDefenseLeader"
                @update:comment="(comment) => updateStudentComment(scope.row.id, comment)"
                @generate-comment="handleGenerateComment"
            />
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
        :is-defense-leader="isDefenseLeader"
        :teacher-scores="scoreDialog.teacherScores"
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

    <!-- 查看其他教师评分对话框 -->
    <TeacherScoresDialog
        v-model:visible="teacherScoresDialog.visible"
        :student="teacherScoresDialog.student"
        :teacher-scores="teacherScoresDialog.teacherScores"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from 'axios';
import ScoreDialog from './ScoreDialog.vue';
import ExportDialog from './ExportDialog.vue';
import DefenseComment from './DefenseComment.vue';
import TeacherScoresDialog from './TeacherScoresDialog.vue';

// 接口定义
interface DefenseScores {
  total: number;
  graded_by: string;
  graded_at: string;
  paper_quality?: number;
  presentation?: number;
  qa_performance?: number;
  design_quality1?: number;
  design_quality2?: number;
  design_quality3?: number;
  design_presentation?: number;
  design_qa1?: number;
  design_qa2?: number;
}

interface TeacherScore {
  teacherId: string;
  teacherName: string;
  totalScore: number;
  paperQuality?: number;
  presentation?: number;
  qaPerformance?: number;
  designQuality1?: number;
  designQuality2?: number;
  designQuality3?: number;
  designPresentation?: number;
  designQa1?: number;
  designQa2?: number;
  comment?: string;
  gradedAt?: string;
}

interface Student {
  id: string;
  real_name: string;
  title?: string;
  type?: number;
  advisor_name?: string;
  scores?: DefenseScores;
  summary?: string;
  comment?: string;
  generatingComment?: boolean;
  teacherScores?: TeacherScore[];
}

interface DefenseGroup {
  groupId: number;
  teacherId: string;
  year?: number;
  adminId?: string;
  adminName?: string;
  isDefenseLeader?: boolean;
  totalStudentCount?: number;
  scoredStudentCount?: number;
}

// 后端接口返回的数据结构
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface DefenseGroupResponse {
  groupId: number;
  year: number;
  adminId: string;
  adminName: string;
  isDefenseLeader: boolean;
  teacherId: string;
  totalStudentCount: number;
  scoredStudentCount: number;
}

interface StudentDefenseResponse {
  studentId: string;
  studentName: string;
  phone?: string;
  email?: string;
  instituteId?: number;
  instituteName?: string;
  defenseGroupId: number;
  thesisTitle: string;
  defenseType: number;
  defenseTime?: string;
  summary?: string;
  reviewerId?: string;
  reviewerName?: string;
  advisorId?: string;
  advisorName?: string;
  guidanceYear?: number;
  totalScore: number;
  comment?: string;
  gradedBy?: string;
  gradedAt?: string;
  paperQuality?: number;
  presentation?: number;
  qaPerformance?: number;
  designQuality1?: number;
  designQuality2?: number;
  designQuality3?: number;
  designPresentation?: number;
  designQa1?: number;
  designQa2?: number;
  teacherScores?: TeacherScore[];
  isScored?: boolean;
  scoreStatus?: string;
}

export default defineComponent({
  name: 'ReviewStudent',
  components: {
    ScoreDialog,
    ExportDialog,
    DefenseComment,
    TeacherScoresDialog
  },

  setup() {
    const loading = ref(false);
    const currentTeacherId = ref('');
    const currentGroup = ref<DefenseGroup | null>(null);
    const groupStudents = ref<Student[]>([]);

    // 判断是否为答辩组长
    const isDefenseLeader = ref(false);

    // 对话框状态
    const scoreDialog = ref({
      visible: false,
      student: null as Student | null,
      initialScores: null as DefenseScores | null,
      teacherScores: [] as TeacherScore[]
    });

    const exportDialog = ref({
      visible: false
    });

    // 教师评分对话框状态
    const teacherScoresDialog = ref({
      visible: false,
      student: null as Student | null,
      teacherScores: [] as TeacherScore[]
    });

    // 计算已评分学生数量
    const scoredStudentsCount = computed(() => {
      return groupStudents.value.filter(student => student.scores?.total > 0).length;
    });

    // 加载答辩小组信息
    const loadDefenseGroup = async () => {
      try {
        if (!currentTeacherId.value) {
          ElMessage.warning('无法获取教师信息');
          return;
        }

        const response = await axios.get<ApiResponse<DefenseGroupResponse>>(
            `/defense/current-group?teacherId=${currentTeacherId.value}`
        );

        if (response.data.code === 200) {
          const groupInfo = response.data.data;
          currentGroup.value = {
            groupId: groupInfo.groupId,
            teacherId: groupInfo.teacherId,
            year: groupInfo.year,
            adminId: groupInfo.adminId,
            adminName: groupInfo.adminName,
            isDefenseLeader: groupInfo.isDefenseLeader,
            totalStudentCount: groupInfo.totalStudentCount,
            scoredStudentCount: groupInfo.scoredStudentCount
          };

          // 更新答辩组长状态
          isDefenseLeader.value = groupInfo.isDefenseLeader || false;

          console.log('答辩小组信息:', currentGroup.value);
          console.log('答辩组长状态:', isDefenseLeader.value);

          // 加载学生列表
          if (currentGroup.value.groupId) {
            await loadGroupStudents();
          }

          ElMessage.success('已加载答辩小组信息');
        } else {
          ElMessage.warning(response.data.message || '未找到答辩小组信息');
        }
      } catch (error: any) {
        console.error('加载答辩小组信息失败:', error);
        if (error.response?.status === 404) {
          ElMessage.warning('您当前没有被分配答辩小组');
        } else {
          ElMessage.error('加载答辩小组信息失败');
        }
      }
    };

    // 加载小组成员
    const loadGroupStudents = async () => {
      if (!currentGroup.value || !currentGroup.value.groupId || !currentTeacherId.value) {
        ElMessage.warning('缺少必要参数');
        return;
      }

      loading.value = true;
      try {
        const response = await axios.get<ApiResponse<StudentDefenseResponse[]>>(
            `/defense/group-students?groupId=${currentGroup.value.groupId}&teacherId=${currentTeacherId.value}`
        );

        if (response.data.code === 200) {
          // 将后端数据转换为前端需要的格式
          groupStudents.value = response.data.data.map(student => {
            // 构建成绩对象
            const scores: DefenseScores = {
              total: student.totalScore || 0,
              graded_by: student.gradedBy || '',
              graded_at: student.gradedAt || '',
              paper_quality: student.paperQuality,
              presentation: student.presentation,
              qa_performance: student.qaPerformance,
              design_quality1: student.designQuality1,
              design_quality2: student.designQuality2,
              design_quality3: student.designQuality3,
              design_presentation: student.designPresentation,
              design_qa1: student.designQa1,
              design_qa2: student.designQa2
            };

            // 将teacherScores转换为前端需要的格式
            const teacherScores: TeacherScore[] = student.teacherScores?.map(score => ({
              teacherId: score.teacherId,
              teacherName: score.teacherName,
              totalScore: score.totalScore,
              paperQuality: score.paperQuality,
              presentation: score.presentation,
              qaPerformance: score.qaPerformance,
              designQuality1: score.designQuality1,
              designQuality2: score.designQuality2,
              designQuality3: score.designQuality3,
              designPresentation: score.designPresentation,
              designQa1: score.designQa1,
              designQa2: score.designQa2,
              comment: score.comment,
              gradedAt: score.gradedAt
            })) || [];

            return {
              id: student.studentId,
              real_name: student.studentName,
              title: student.thesisTitle,
              type: student.defenseType,
              summary: student.summary,
              advisor_name: student.advisorName,
              scores: student.totalScore > 0 ? scores : undefined,
              comment: student.comment,
              teacherScores: teacherScores
            };
          });

          ElMessage.success(`已加载 ${groupStudents.value.length} 名学生`);
        } else {
          ElMessage.error(response.data.message || '加载学生列表失败');
        }
      } catch (error: any) {
        console.error('加载学生列表失败:', error);
        if (error.response?.status === 404) {
          ElMessage.warning('该答辩小组暂无学生');
        } else {
          ElMessage.error('加载学生列表失败');
        }
      } finally {
        loading.value = false;
      }
    };

    // 更新学生评语
    const updateStudentComment = (studentId: string, comment: string) => {
      const student = groupStudents.value.find(s => s.id === studentId);
      if (student) {
        student.comment = comment;

        // 调用后端接口保存评语
        saveStudentComment(studentId, comment);
      }
    };

    // 保存学生评语到后端
    const saveStudentComment = async (studentId: string, comment: string) => {
      if (!currentGroup.value?.groupId) {
        ElMessage.warning('无法保存评语：缺少小组信息');
        return;
      }

      try {
        const response = await axios.post('/defense/update-comment', {
          groupId: currentGroup.value.groupId,
          studentId: studentId,
          comment: comment,
          teacherId: currentTeacherId.value
        });

        if (response.data.code === 200) {
          console.log(`学生 ${studentId} 评语保存成功`);
        } else {
          console.warn(`学生 ${studentId} 评语保存失败:`, response.data.message);
        }
      } catch (error) {
        console.error('保存评语失败:', error);
      }
    };

    // 处理生成评语
    const handleGenerateComment = async (data: { studentId: string, comment: string }) => {
      try {
        const response = await axios.post('/defense/generate-comment', {
          studentId: data.studentId,
          teacherId: currentTeacherId.value
        });

        if (response.data.code === 200) {
          const generatedComment = response.data.data.comment;
          updateStudentComment(data.studentId, generatedComment);
          ElMessage.success('评语生成成功');
        } else {
          ElMessage.error('评语生成失败');
        }
      } catch (error) {
        console.error('生成评语失败:', error);
        ElMessage.error('生成评语失败');
      }
    };

    // 查看其他教师评分
    const viewTeacherScores = (student: Student) => {
      teacherScoresDialog.value = {
        visible: true,
        student: student,
        teacherScores: student.teacherScores || []
      };
    };

    // 打开评分对话框
    const openScoreDialog = (student: Student) => {
      scoreDialog.value = {
        visible: true,
        student: student,
        initialScores: student.scores || null,
        teacherScores: student.teacherScores || []
      };
    };

    // 保存成绩
    const saveScores = async (scoresData: any) => {
      try {
        const response = await axios.post('/defense/save-scores', {
          groupId: currentGroup.value?.groupId,
          studentId: scoresData.studentId,
          scores: scoresData.scores,
          teacherId: currentTeacherId.value
        });

        if (response.data.code === 200) {
          ElMessage.success('成绩保存成功');
          scoreDialog.value.visible = false;
          // 重新加载学生列表以更新数据
          await loadGroupStudents();
        } else {
          ElMessage.error(response.data.message || '成绩保存失败');
        }
      } catch (error) {
        console.error('保存成绩失败:', error);
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
        loading.value = true;
        const response = await axios.get('/defense/export-student', {
          params: {
            studentId: student.id,
            groupId: currentGroup.value?.groupId,
            teacherId: currentTeacherId.value
          },
          responseType: 'blob' // 重要：指定响应类型为blob
        });

        // 创建下载链接
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${student.real_name}_成绩表.docx`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        ElMessage.success(`已导出 ${student.real_name} 的成绩表`);
      } catch (error) {
        console.error('导出失败:', error);
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
        loading.value = true;
        const response = await axios.get('/defense/export-group', {
          params: {
            groupId: currentGroup.value?.groupId,
            teacherId: currentTeacherId.value,
            filename: filename
          },
          responseType: 'blob'
        });

        // 创建下载链接
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename || `答辩组${currentGroup.value?.groupId}_成绩表.zip`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        ElMessage.success('已开始打包导出，请稍候下载');
        exportDialog.value.visible = false;
      } catch (error) {
        console.error('导出失败:', error);
        ElMessage.error('导出失败');
      } finally {
        loading.value = false;
      }
    };

    // 批量生成评语
    const generateAllComments = async () => {
      ElMessageBox.confirm(
          '确定要为所有学生生成评语吗？',
          '批量生成评语',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
      ).then(async () => {
        loading.value = true;
        try {
          const response = await axios.post('/defense/generate-all-comments', {
            groupId: currentGroup.value?.groupId,
            teacherId: currentTeacherId.value
          });

          if (response.data.code === 200) {
            // 重新加载数据以获取新生成的评语
            await loadGroupStudents();
            ElMessage.success('批量生成评语完成');
          } else {
            ElMessage.error(response.data.message || '批量生成评语失败');
          }
        } catch (error) {
          console.error('批量生成评语失败:', error);
          ElMessage.error('批量生成评语失败');
        } finally {
          loading.value = false;
        }
      });
    };

    // 工具函数
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
      // 从localStorage获取用户信息
      try {
        const userInfoStr = localStorage.getItem('userInfo');
        if (userInfoStr) {
          const userInfo = JSON.parse(userInfoStr);
          console.log('初始化 - 用户信息:', userInfo);

          // 根据你的数据结构，可能需要从不同的字段获取用户信息
          const userData = userInfo.userInfo || userInfo;
          currentTeacherId.value = userData.id || userData.teacherId || '';

          // 设置答辩组长状态
          isDefenseLeader.value = userData.isDefenseLeader || false;

          console.log('教师ID:', currentTeacherId.value);
          console.log('是否为答辩组长:', isDefenseLeader.value);

          // 加载答辩小组信息
          loadDefenseGroup();
        } else {
          ElMessage.warning('请先登录');
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
        }
      } catch (error) {
        console.error('解析用户信息失败:', error);
        ElMessage.error('加载用户信息失败');
      }
    });

    return {
      loading,
      currentGroup,
      groupStudents,
      scoreDialog,
      exportDialog,
      teacherScoresDialog,
      isDefenseLeader,
      scoredStudentsCount,
      loadDefenseGroup,
      loadGroupStudents,
      openScoreDialog,
      saveScores,
      exportSingleStudent,
      openExportDialog,
      handleExport,
      generateAllComments,
      updateStudentComment,
      handleGenerateComment,
      viewTeacherScores,
      getTypeTagType,
      getTypeText,
      getScoreStatusTagType,
      getScoreStatusText
    };
  }
});
</script>

<style scoped>
/* 原有样式保持不变，添加新样式 */
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

.no-score {
  color: #C0C4CC;
  font-style: italic;
}

/* 教师评分部分样式 */
.teacher-scores-section {
  padding: 4px 0;
}

.scores-count {
  font-size: 12px;
  color: #67C23A;
  margin-bottom: 4px;
  font-weight: 500;
}

.no-scores {
  color: #C0C4CC;
  font-style: italic;
  font-size: 12px;
  margin-bottom: 4px;
}

.view-action {
  display: flex;
  justify-content: center;
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

:deep(.el-button--mini) {
  padding: 4px 6px;
  font-size: 11px;
}
</style>