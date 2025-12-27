<template>
  <div class="student-list-container">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div>
        <h2 class="page-title">指导学生管理</h2>
        <p class="page-subtitle">管理您所指导的学生，包括填写题目摘要和选择评阅人</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" icon="el-icon-plus" @click="showAddStudentDialog = true">
          添加指导学生
        </el-button>
      </div>
    </div>

    <!-- 学生列表表格 -->
    <el-card class="student-table-card">
      <el-table
          :data="studentList"
          v-loading="loading"
          style="width: 100%"
          size="small"
          :default-sort="{prop: 'id', order: 'ascending'}"
      >
        <!-- 学生基本信息 -->
        <el-table-column prop="id" label="学号" width="100" sortable />
        <el-table-column prop="real_name" label="姓名" width="80" />
        <el-table-column prop="institute_name" label="所属院系" width="150">
          <template #default="scope">
            <el-tag size="small">{{ scope.row.institute_name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="tel" label="联系电话" width="110" />
        <el-table-column prop="email" label="邮箱" width="150" />

        <!-- 指导年份 -->
        <el-table-column prop="year" label="指导年份" width="90">
          <template #default="scope">
            <el-tag type="info" size="small">{{ scope.row.year }}年</el-tag>
          </template>
        </el-table-column>

        <!-- 题目和摘要信息 -->
        <el-table-column label="毕业答辩信息" min-width="220">
          <template #default="scope">
            <div v-if="scope.row.title" class="thesis-info">
              <div class="thesis-title">
                <strong>题目：</strong>
                <span>{{ scope.row.title }}</span>
              </div>
              <div class="thesis-summary">
                <strong>摘要：</strong>
                <el-tooltip v-if="scope.row.summary" effect="light" placement="top-start">
                  <template #content>
                    <div class="summary-tooltip">{{ scope.row.summary }}</div>
                  </template>
                  <span class="summary-preview">
                    {{ truncateText(scope.row.summary, 25) }}
                  </span>
                </el-tooltip>
                <span v-else class="no-summary">未填写</span>
              </div>
              <div class="thesis-type">
                <el-tag :type="getTypeTagType(scope.row.type)" size="small">
                  {{ getTypeText(scope.row.type) }}
                </el-tag>
              </div>
            </div>
            <div v-else class="no-thesis-info">
              <el-button
                  type="text"
                  icon="el-icon-edit"
                  size="small"
                  @click="openThesisDialog(scope.row)"
              >
                填写题目和摘要
              </el-button>
            </div>
          </template>
        </el-table-column>

        <!-- 答辩组信息 -->
        <el-table-column prop="gid" label="答辩组号" width="90">
          <template #default="scope">
            <span v-if="scope.row.gid">{{ scope.row.gid }}</span>
            <span v-else class="no-data">-</span>
          </template>
        </el-table-column>

        <!-- 评阅人信息 -->
        <el-table-column label="评阅人" width="120">
          <template #default="scope">
            <div v-if="scope.row.reviewer_name" class="reviewer-info">
              <div class="reviewer-name">{{ scope.row.reviewer_name }}</div>
              <div class="reviewer-id">{{ scope.row.reviewer_id }}</div>
            </div>
            <el-button
                v-else
                type="text"
                icon="el-icon-user"
                size="small"
                @click="openSelectReviewerDialog(scope.row)"
                :disabled="!scope.row.title"
            >
              选择评阅人
            </el-button>
          </template>
        </el-table-column>

        <!-- 答辩日期 -->
        <el-table-column prop="time" label="答辩日期" width="100">
          <template #default="scope">
            <span v-if="scope.row.time">{{ formatDate(scope.row.time) }}</span>
            <span v-else class="no-data">-</span>
          </template>
        </el-table-column>

        <!-- 学生状态 -->
        <el-table-column prop="status" label="状态" width="90">
          <template #default="scope">
            <el-tag :type="getStudentStatusTagType(scope.row.status)" size="small">
              {{ getStudentStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-dropdown
                  trigger="click"
                  placement="bottom-end"
                  @command="handleCommand($event, scope.row)"
                  size="small"
              >
                <el-button size="small" type="primary" plain>
                  <span>操作</span>
                  <el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <!-- 填写/修改题目摘要 -->
                    <el-dropdown-item
                        :disabled="scope.row.status === 'defensed'"
                        :icon="scope.row.title ? 'el-icon-edit' : 'el-icon-document-add'"
                        command="editThesis"
                    >
                      {{ scope.row.title ? '修改题目摘要' : '填写题目摘要' }}
                    </el-dropdown-item>

                    <!-- 选择评阅人 -->
                    <el-dropdown-item
                        :disabled="!scope.row.title || scope.row.status === 'defensed'"
                        icon="el-icon-user"
                        command="selectReviewer"
                    >
                      {{ scope.row.reviewer_name ? '更换评阅人' : '选择评阅人' }}
                    </el-dropdown-item>

                    <!-- 删除学生 -->
                    <el-dropdown-item
                        :disabled="scope.row.status === 'defensed'"
                        icon="el-icon-delete"
                        command="delete"
                        class="delete-item"
                    >
                      删除学生
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态提示 -->
      <div v-if="studentList.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无指导学生数据">
          <el-button type="primary" @click="showAddStudentDialog = true">
            添加指导学生
          </el-button>
        </el-empty>
      </div>
    </el-card>

    <!-- 使用提取的对话框组件 -->
    <ThesisDialog
        v-model:visible="thesisDialog.visible"
        :student-id="thesisDialog.studentId"
        :student-name="thesisDialog.studentName"
        :initial-data="thesisForm"
        @confirm="saveThesisInfo"
        @cancel="thesisDialog.visible = false"
    />

    <ReviewerDialog
        v-model:visible="reviewerDialog.visible"
        :student-id="reviewerDialog.studentId"
        :student-name="reviewerDialog.studentName"
        :teachers="instituteTeachers"
        :selected-reviewer-id="reviewerDialog.selectedReviewerId"
        :selected-reviewer-name="reviewerDialog.selectedReviewerName"
        @confirm="saveReviewer"
        @cancel="reviewerDialog.visible = false"
    />

    <AddStudentDialog
        v-model:visible="showAddStudentDialog"
        :available-years="availableYears"
        :search-result="studentSearchResult"
        @confirm="addStudent"
        @cancel="showAddStudentDialog = false"
        @search-student="searchStudent"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowDown } from '@element-plus/icons-vue';
import ThesisDialog from './ThesisDialog.vue';
import ReviewerDialog from './ReviewerDialog.vue';
import AddStudentDialog from './AddStudentDialog.vue';

interface Student {
  id: string;
  real_name: string;
  tel: string;
  email: string;
  institute_id: number;
  institute_name: string;
  year: number;
  gid?: number;
  type?: number; // 0: 论文, 1: 设计
  title?: string;
  summary?: string;
  time?: string;
  reviewer_id?: string;
  reviewer_name?: string;
  status?: string;
}

interface Teacher {
  id: string;
  real_name: string;
  role: number;
  phone?: string;
  email?: string;
}

export default defineComponent({
  name: 'TeacherStudentList',
  components: {
    ThesisDialog,
    ReviewerDialog,
    AddStudentDialog,
    ArrowDown
  },

  setup() {
    const currentTeacherId = ref(''); // 从登录信息获取

    const studentList = ref<Student[]>([
      {
        id: '2023001',
        real_name: '王小明',
        tel: '13800138001',
        email: 'wangxm@email.com',
        institute_id: 1,
        institute_name: '计算机与信息学院',
        year: 2025,
        gid: 101,
        type: 0,
        title: '基于深度学习的图像识别系统研究',
        summary: '本文研究了基于深度学习的图像识别技术，提出了改进的卷积神经网络模型...',
        time: '2025-06-15',
        reviewer_id: '123456',
        reviewer_name: '李老师',
        status: 'defensing'
      },
      // ... 更多模拟数据
    ]);

    const loading = ref(false);
    const instituteTeachers = ref<Teacher[]>([
      { id: '123456', real_name: '王老师', role: 2 },
      { id: '234567', real_name: '张老师', role: 2 },
      // ... 更多教师数据
    ]);

    const availableYears = ref([new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1]);

    const thesisDialog = ref({
      visible: false,
      studentId: '',
      studentName: ''
    });

    const reviewerDialog = ref({
      visible: false,
      studentId: '',
      studentName: '',
      selectedReviewerId: '',
      selectedReviewerName: ''
    });

    const showAddStudentDialog = ref(false);
    const studentSearchResult = ref<Student | null>(null);
    const thesisForm = ref({
      type: 0 as number,
      title: '',
      summary: ''
    });

    // 处理下拉菜单命令
    const handleCommand = (command: string, student: Student) => {
      switch (command) {
        case 'editThesis':
          openThesisDialog(student);
          break;
        case 'selectReviewer':
          openSelectReviewerDialog(student);
          break;
        case 'score':
          openScoreDialog(student);
          break;
        case 'delete':
          confirmDeleteStudent(student);
          break;
      }
    };

    const loadStudentList = async () => {
      loading.value = true;
      try {
        // 调用后端API加载学生列表
        // ...
        ElMessage.success(`已加载 ${studentList.value.length} 名学生`);
      } catch (error) {
        ElMessage.error('加载学生列表失败');
      } finally {
        loading.value = false;
      }
    };

    const loadInstituteTeachers = async () => {
      try {
        // 调用后端API加载同院系教师列表
        // ...
      } catch (error) {
        console.error('加载教师列表失败');
      }
    };

    const searchStudent = async (studentId: string) => {
      try {
        // 调用后端API搜索学生
        // ...
      } catch (error) {
        ElMessage.error('搜索学生失败');
      }
    };

    const addStudent = async (formData: any) => {
      try {
        // 调用后端API添加指导学生
        // ...
        ElMessage.success('添加指导学生成功');
        showAddStudentDialog.value = false;
        loadStudentList();
        studentSearchResult.value = null;
      } catch (error) {
        ElMessage.error('添加指导学生失败');
      }
    };

    const openThesisDialog = (student: Student) => {
      thesisDialog.value = {
        visible: true,
        studentId: student.id,
        studentName: student.real_name
      };

      if (student.title) {
        thesisForm.value = {
          type: student.type || 0,
          title: student.title || '',
          summary: student.summary || ''
        };
      } else {
        thesisForm.value = {
          type: 0,
          title: '',
          summary: ''
        };
      }
    };

    const saveThesisInfo = async (data: any) => {
      try {
        // 调用后端API保存题目摘要
        // ...
        ElMessage.success('保存题目摘要成功');
        thesisDialog.value.visible = false;
        loadStudentList();
      } catch (error) {
        ElMessage.error('保存题目摘要失败');
      }
    };

    const openSelectReviewerDialog = (student: Student) => {
      reviewerDialog.value = {
        visible: true,
        studentId: student.id,
        studentName: student.real_name,
        selectedReviewerId: student.reviewer_id || '',
        selectedReviewerName: student.reviewer_name || ''
      };
    };

    const saveReviewer = async (data: any) => {
      try {
        // 调用后端API保存评阅人
        // ...
        ElMessage.success('设置评阅人成功');
        reviewerDialog.value.visible = false;
        loadStudentList();
      } catch (error) {
        ElMessage.error('设置评阅人失败');
      }
    };

    // 删除学生确认
    const confirmDeleteStudent = (student: Student) => {
      ElMessageBox.confirm(
          `确定要删除学生 "${student.real_name}" (${student.id}) 吗？此操作将解除您对该学生的指导关系。`,
          '删除确认',
          {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'warning',
            center: true,
            confirmButtonClass: 'delete-confirm-btn',
            cancelButtonClass: 'delete-cancel-btn'
          }
      )
          .then(() => {
            deleteStudent(student);
          })
          .catch(() => {
            ElMessage.info('已取消删除操作');
          });
    };

    // 删除学生
    const deleteStudent = async (student: Student) => {
      try {
        // 调用后端API删除指导学生关系
        // ...
        ElMessage.success(`已成功删除学生 "${student.real_name}"`);
        loadStudentList();
      } catch (error) {
        ElMessage.error('删除学生失败');
      }
    };

    const truncateText = (text: string, maxLength: number) => {
      if (!text) return '';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    const formatDate = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN');
    };

    const getTypeTagType = (type?: number) => {
      return type === 1 ? 'warning' : 'primary';
    };

    const getTypeText = (type?: number) => {
      return type === 1 ? '毕业设计' : '毕业论文';
    };

    const getStudentStatusTagType = (status?: string) => {
      switch (status) {
        case 'writing': return 'info';
        case 'reviewing': return 'warning';
        case 'defensing': return 'success';
        case 'defensed': return '';
        default: return 'info';
      }
    };

    onMounted(() => {
      loadStudentList();
      loadInstituteTeachers();
    });

    return {
      studentList,
      loading,
      availableYears,
      instituteTeachers,
      thesisDialog,
      reviewerDialog,
      showAddStudentDialog,
      studentSearchResult,
      thesisForm,
      handleCommand,
      loadStudentList,
      searchStudent,
      addStudent,
      openThesisDialog,
      saveThesisInfo,
      openSelectReviewerDialog,
      saveReviewer,
      openScoreDialog,
      truncateText,
      formatDate,
      getTypeTagType,
      getTypeText,
      getStudentStatusTagType,
      getStudentStatusText
    };
  }
});
</script>

<style scoped>
.student-list-container {
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

.student-table-card {
  border-radius: 8px;
}

.thesis-info {
  padding: 4px 0;
}

.thesis-title,
.thesis-summary,
.thesis-type {
  margin-bottom: 4px;
  font-size: 12px;
  line-height: 1.4;
}

.thesis-title strong,
.thesis-summary strong {
  color: #606266;
  margin-right: 4px;
}

.summary-preview {
  color: #409EFF;
  cursor: pointer;
}

.summary-preview:hover {
  text-decoration: underline;
}

.no-summary {
  color: #C0C4CC;
  font-style: italic;
}

.no-thesis-info {
  color: #F56C6C;
  padding: 4px 0;
}

.no-data {
  color: #C0C4CC;
  font-style: italic;
}

.reviewer-info {
  font-size: 12px;
  line-height: 1.4;
}

.reviewer-name {
  font-weight: 500;
}

.reviewer-id {
  color: #909399;
  font-size: 11px;
}

.action-buttons {
  display: flex;
  justify-content: center;
}

.empty-state {
  padding: 40px 0;
}

/* 调整表格行高 */
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

/* 下拉菜单操作按钮样式 */
.action-buttons .el-dropdown {
  margin: 0 auto;
}

.action-buttons .el-button--primary.is-plain {
  border-color: #409EFF;
  color: #409EFF;
  background-color: rgba(64, 158, 255, 0.1);
}

.action-buttons .el-button--primary.is-plain:hover {
  background-color: #409EFF;
  color: white;
}

/* 下拉菜单项样式 */
:deep(.delete-item) {
  color: #F56C6C !important;
}

:deep(.delete-item:hover) {
  background-color: rgba(245, 108, 108, 0.1) !important;
}

/* 删除确认对话框样式 */
:deep(.delete-confirm-btn) {
  background-color: #F56C6C;
  border-color: #F56C6C;
  color: white;
}

:deep(.delete-confirm-btn:hover) {
  background-color: #f78989;
  border-color: #f78989;
}

:deep(.delete-cancel-btn) {
  color: #909399;
}
</style>