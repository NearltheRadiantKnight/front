<template>
  <el-dialog
      title="查看小组其他评委评分"
      v-model="dialogVisible"
      width="900px"
      :close-on-click-modal="false"
  >
    <div class="teacher-scores-dialog">
      <!-- 学生信息 -->
      <div class="student-header">
        <div class="student-basic">
          <el-tag size="small">学号: {{ student.id }}</el-tag>
          <el-tag size="small">姓名: {{ student.real_name }}</el-tag>
          <el-tag size="small" :type="getTypeTagType(student.type)">
            {{ getTypeText(student.type) }}
          </el-tag>
        </div>
        <div class="student-thesis">
          <strong>题目: </strong>{{ student.title }}
        </div>
      </div>

      <!-- 教师评分表格 -->
      <el-table
          :data="teacherScores"
          style="width: 100%"
          size="small"
          border
          class="scores-table"
      >
        <!-- 教师信息 -->
        <el-table-column label="评委教师" width="120">
          <template #default="scope">
            <div class="teacher-info">
              <div class="teacher-name">{{ scope.row.teacherName }}</div>
              <div class="teacher-id">ID: {{ scope.row.teacherId }}</div>
            </div>
          </template>
        </el-table-column>

        <!-- 评分详情 -->
        <template v-if="student.type !== 1">
          <!-- 毕业论文评分项 -->
          <el-table-column label="论文质量" width="100" align="center">
            <template #default="scope">
              <div class="score-item">
                <span class="score-value">{{ scope.row.scores.paper_quality || 0 }}</span>
                <span class="score-total">/40</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="答辩陈述" width="100" align="center">
            <template #default="scope">
              <div class="score-item">
                <span class="score-value">{{ scope.row.scores.presentation || 0 }}</span>
                <span class="score-total">/30</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="回答问题" width="100" align="center">
            <template #default="scope">
              <div class="score-item">
                <span class="score-value">{{ scope.row.scores.qa_performance || 0 }}</span>
                <span class="score-total">/30</span>
              </div>
            </template>
          </el-table-column>
        </template>

        <template v-else>
          <!-- 毕业设计评分项 -->
          <el-table-column label="设计质量1" width="80" align="center">
            <template #default="scope">
              <div class="score-item">
                <span class="score-value">{{ scope.row.scores.design_quality1 || 0 }}</span>
                <span class="score-total">/15</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="设计质量2" width="80" align="center">
            <template #default="scope">
              <div class="score-item">
                <span class="score-value">{{ scope.row.scores.design_quality2 || 0 }}</span>
                <span class="score-total">/15</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="设计质量3" width="80" align="center">
            <template #default="scope">
              <div class="score-item">
                <span class="score-value">{{ scope.row.scores.design_quality3 || 0 }}</span>
                <span class="score-total">/15</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="设计展示" width="80" align="center">
            <template #default="scope">
              <div class="score-item">
                <span class="score-value">{{ scope.row.scores.design_presentation || 0 }}</span>
                <span class="score-total">/25</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="回答问题1" width="80" align="center">
            <template #default="scope">
              <div class="score-item">
                <span class="score-value">{{ scope.row.scores.design_qa1 || 0 }}</span>
                <span class="score-total">/15</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="回答问题2" width="80" align="center">
            <template #default="scope">
              <div class="score-item">
                <span class="score-value">{{ scope.row.scores.design_qa2 || 0 }}</span>
                <span class="score-total">/15</span>
              </div>
            </template>
          </el-table-column>
        </template>

        <!-- 总分 -->
        <el-table-column label="总分" width="100" align="center" fixed="right">
          <template #default="scope">
            <div class="total-score">
              <strong>{{ scope.row.scores.total || 0 }}</strong>
              <span class="score-total">/100</span>
            </div>
          </template>
        </el-table-column>

      </el-table>

      <!-- 统计信息 -->
      <div class="statistics" v-if="teacherScores.length > 0">
        <el-row :gutter="20" class="stats-row">
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-label">平均分</div>
              <div class="stat-value">{{ calculateAverageScore() }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-label">最高分</div>
              <div class="stat-value">{{ calculateMaxScore() }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-label">最低分</div>
              <div class="stat-value">{{ calculateMinScore() }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-label">评分人数</div>
              <div class="stat-value">{{ teacherScores.length }}</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import type { PropType } from 'vue';

interface Student {
  id: string;
  real_name: string;
  title?: string;
  type?: number;
}

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
  scores: DefenseScores;
  graded_at: string;
}

export default defineComponent({
  name: 'TeacherScoresDialog',
  props: {
    // 修改为 visible
    visible: {
      type: Boolean,
      default: false
    },
    student: {
      type: Object as PropType<Student>,
      required: true
    },
    teacherScores: {
      type: Array as PropType<TeacherScore[]>,
      default: () => []
    }
  },

  emits: ['update:visible'],

  setup(props, { emit }) {
    // 使用计算属性进行双向绑定
    const dialogVisible = computed({
      get: () => props.visible,
      set: (value) => emit('update:visible', value)
    });

    // 获取论文类型标签样式
    const getTypeTagType = (type?: number) => {
      return type === 1 ? 'warning' : 'primary';
    };

    // 获取论文类型文本
    const getTypeText = (type?: number) => {
      return type === 1 ? '毕业设计' : '毕业论文';
    };

    // 计算平均分
    const calculateAverageScore = () => {
      if (props.teacherScores.length === 0) return 0;
      const total = props.teacherScores.reduce((sum, item) => sum + (item.scores.total || 0), 0);
      return (total / props.teacherScores.length).toFixed(1);

    };

    // 计算最高分
    const calculateMaxScore = () => {
      if (props.teacherScores.length === 0) return 0;
      return Math.max(...props.teacherScores.map(item => item.scores.total || 0));
    };

    // 计算最低分
    const calculateMinScore = () => {
      if (props.teacherScores.length === 0) return 0;
      return Math.min(...props.teacherScores.map(item => item.scores.total || 0));
    };

    return {
      dialogVisible,
      getTypeTagType,
      getTypeText,
      calculateAverageScore,
      calculateMaxScore,
      calculateMinScore
    };
  }
});
</script>

<style scoped>
.teacher-scores-dialog {
  padding: 0 10px;
}

.student-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.student-basic {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.student-thesis {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.scores-table {
  margin-bottom: 20px;
}

.teacher-info {
  padding: 4px 0;
}

.teacher-name {
  font-weight: 500;
  margin-bottom: 2px;
}

.teacher-id {
  font-size: 11px;
  color: #909399;
}

.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 40px;
}

.score-value {
  font-size: 14px;
  font-weight: 600;
  color: #409EFF;
}

.score-total {
  font-size: 11px;
  color: #909399;
  margin-left: 2px;
}

.total-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 40px;
}

.total-score strong {
  font-size: 16px;
  color: #67C23A;
}

.statistics {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 15px;
  margin-top: 20px;
}

.stats-row {
  margin: 0 !important;
}

.stat-item {
  text-align: center;
  padding: 10px 0;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

/* 调整表格样式 */
:deep(.el-table--small .el-table__row) {
  height: 50px;
}

:deep(.el-table--small td) {
  padding: 8px 0;
}
</style>