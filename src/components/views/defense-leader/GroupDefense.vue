<template>
  <div class="defense-summary-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">大组答辩</h2>
      <p class="page-subtitle">管理各小组第一名的大组答辩成绩与调节系数</p>
    </div>

    <!-- 学生列表 -->
    <el-card class="summary-table-card">
      <el-table
          :data="groupFirstStudents"
          v-loading="loading"
          style="width: 100%"
          size="small"
          border
      >
        <!-- 小组信息 -->
        <el-table-column prop="groupId" label="小组" width="80">
          <template #default="scope">
            第{{ scope.row.groupId }}组
          </template>
        </el-table-column>

        <!-- 学生信息 -->
        <el-table-column prop="studentId" label="学号" width="100" />
        <el-table-column prop="studentName" label="姓名" width="80" />
        <el-table-column prop="instituteName" label="院系" width="150">
          <template #default="scope">
            <el-tag size="small">{{ scope.row.instituteName }}</el-tag>
          </template>
        </el-table-column>

        <!-- 小组答辩成绩 -->
        <el-table-column prop="groupScore" label="小组成绩" width="70">
          <template #default="scope">
            {{ scope.row.groupScore.toFixed(1) }}
          </template>
        </el-table-column>

        <!-- 大组答辩成绩录入 -->
        <el-table-column prop="majorScore" label="大组成绩" width="120">
          <template #default="scope">
            <el-input-number
                v-model="scope.row.majorScore"
                :min="0"
                :max="100"
                :precision="1"
                :step="0.5"
                size="small"
                controls-position="right"
                style="width: 100px;"
                @change="handleMajorScoreChange(scope.row)"
                :disabled="scope.row.saving"
            />
          </template>
        </el-table-column>

        <!-- 调节系数 -->
        <el-table-column prop="adjustmentCoefficient" label="调节系数" width="90">
          <template #default="scope">
            <span v-if="scope.row.adjustmentCoefficient">
              {{ scope.row.adjustmentCoefficient.toFixed(3) }}
            </span>
            <span v-else class="no-data">-</span>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column prop="status" label="状态" width="130">
          <template #default="scope">
            <el-tag
                size="small"
                :type="getStatusTagType(scope.row)"
                effect="light"
            >
              {{ getStatusText(scope.row) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态提示 -->
      <div v-if="groupFirstStudents.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无小组第一名数据" />
      </div>

      <!-- 操作按钮栏 -->
      <div class="operation-buttons">
        <el-button
            type="primary"
            @click="calculateAllCoefficients"
            :disabled="!hasMajorScores"
        >
          计算调节系数
        </el-button>

        <el-button
            type="warning"
            @click="exportSummaryTable"
            :disabled="groupFirstStudents.length === 0"
        >
          导出表格
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import * as XLSX from 'xlsx';
import request from "@/api";

interface GroupFirstStudent {
  id: string;
  groupId: number;
  studentId: string;
  studentName: string;
  instituteName: string;
  groupScore: number;
  majorScore?: number;
  adjustmentCoefficient?: number;
  saving: boolean;
}

export default defineComponent({
  name: 'DefenseSummaryTable',

  setup() {
    const loading = ref(false);
    const year = ref(localStorage.getItem('year'));

    // 各小组第一名数据
    const groupFirstStudents = ref<GroupFirstStudent[]>([]);

    // 计算属性
    const hasMajorScores = computed(() => {
      return groupFirstStudents.value.some(s => s.majorScore !== undefined);
    });

    const hasCoefficients = computed(() => {
      return groupFirstStudents.value.some(s => s.adjustmentCoefficient !== undefined);
    });

    // 获取状态标签类型
    const getStatusTagType = (student: GroupFirstStudent) => {
      if (!student.majorScore) return 'info';
      if (!student.adjustmentCoefficient) return 'warning';
      return 'success';
    };

    // 获取状态文本
    const getStatusText = (student: GroupFirstStudent) => {
      if (!student.majorScore) return '待录入';
      if (!student.adjustmentCoefficient) return '待计算系数';
      return '已完成';
    };

    // 加载数据
    const loadGroupFirstStudents = async () => {
      loading.value = true;
      try {
        // 调用后端API获取各小组第一名数据
        const response = await request.get(`/defense/first-students?year=${year.value}`);

        if (response.code === 200) {
          groupFirstStudents.value = response.data.map((item: any) => ({
            id: `${item.groupId}_${item.studentId}`,
            groupId: item.groupId,
            studentId: item.studentId,
            studentName: item.studentName,
            instituteName: item.instituteName,
            groupScore: item.groupScore,
            majorScore: item.majorScore,
            adjustmentCoefficient: item.adjustmentCoefficient,
            saving: false,
          }));
        } else {
          ElMessage.error('加载数据失败: ' + response.message);
        }
      } catch (error: any) {
        console.error('加载数据失败:', error);
        ElMessage.error('加载数据失败: ' + (error.message || '网络错误'));
      } finally {
        loading.value = false;
      }
    };

    // 处理大组成绩变化
    const handleMajorScoreChange = async (student: GroupFirstStudent) => {
      if (student.majorScore === undefined) return;

      // 验证成绩范围
      if (student.majorScore < 0 || student.majorScore > 100) {
        ElMessage.warning('大组成绩必须在0-100之间');
        student.majorScore = undefined;
        return;
      }

      student.saving = true;
      try {
        // 调用后端API保存大组答辩成绩
        const response = await request.post('/defense/save-major-score', {
          groupId: student.groupId,
          studentId: student.studentId,
          majorScore: student.majorScore,
        });

        if (response.code === 200) {
          // 清除已计算的调节系数
          student.adjustmentCoefficient = undefined;
          ElMessage.success('大组成绩保存成功');
        } else {
          ElMessage.error('保存失败: ' + response.message);
        }
      } catch (error: any) {
        console.error('保存大组答辩成绩失败:', error);
        ElMessage.error('保存大组答辩成绩失败: ' + (error.message || '网络错误'));
        // 恢复原来的值
        student.majorScore = undefined;
      } finally {
        student.saving = false;
      }
    };

    // 计算所有调节系数
    const calculateAllCoefficients = async () => {
      const eligibleStudents = groupFirstStudents.value.filter(
          s => s.majorScore !== undefined && s.groupScore > 0
      );

      if (eligibleStudents.length === 0) {
        ElMessage.warning('请先录入大组答辩成绩');
        return;
      }

      try {
        const response = await request.post(`/defense/save-coefficients?year=${year.value}`);

        if (response.code === 200) {
          ElMessage.success(response.data.message || '计算成功');
          // 重新加载数据
          loadGroupFirstStudents();
        } else {
          ElMessage.error('计算失败: ' + response.message);
        }
      } catch (error: any) {
        console.error('计算调节系数失败:', error);
        ElMessage.error('计算调节系数失败: ' + (error.message || '网络错误'));
      }
    };

    // 导出统分表
    const exportSummaryTable = () => {
      if (groupFirstStudents.value.length === 0) {
        ElMessage.warning('没有数据可导出');
        return;
      }

      const exportData = groupFirstStudents.value.map(student => ({
        '小组': `第${student.groupId}组`,
        '学号': student.studentId,
        '姓名': student.studentName,
        '院系': student.instituteName,
        '小组成绩': student.groupScore.toFixed(1),
        '大组成绩': student.majorScore ? student.majorScore.toFixed(1) : '未录入',
        '调节系数': student.adjustmentCoefficient ? student.adjustmentCoefficient.toFixed(3) : '未计算',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '答辩小组统分表');

      const fileName = `${year.value}年答辩小组统分表.xlsx`;
      XLSX.writeFile(workbook, fileName);

      ElMessage.success('导出成功');
    };

    // 获取调节系数
    const getAdjustmentCoefficient = async (groupId: number) => {
      try {
        const response = await request.get(`/defense/adjustment-coefficient?groupId=${groupId}`);
        if (response.code === 200) {
          return response.data;
        }
        return null;
      } catch (error) {
        console.error('获取调节系数失败:', error);
        return null;
      }
    };

    // 初始化
    onMounted(() => {
      loadGroupFirstStudents();
    });

    return {
      loading,
      groupFirstStudents,
      hasMajorScores,
      hasCoefficients,
      getStatusTagType,
      getStatusText,
      loadGroupFirstStudents,
      handleMajorScoreChange,
      calculateAllCoefficients,
      exportSummaryTable,
      getAdjustmentCoefficient,
    };
  },
});
</script>

<style scoped>
.defense-summary-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  color: #333;
  margin: 0 0 8px 0;
  font-size: 20px;
}

.page-subtitle {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.summary-table-card {
  border-radius: 8px;
}

.no-data {
  color: #C0C4CC;
  font-style: italic;
}

.empty-state {
  padding: 40px 0;
}

.operation-buttons {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

:deep(.el-table--small .el-table__row) {
  height: 50px;
}

:deep(.el-table--small td) {
  padding: 6px 0;
}
</style>