<template>
  <el-dialog
      v-model="visible"
      :title="dialogTitle"
      width="800px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
  >
    <!-- 学生基本信息 -->
    <div class="student-info">
      <div class="info-row">
        <div class="info-item">
          <span class="info-label">学号：</span>
          <span class="info-value">{{ student?.stu_id }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">姓名：</span>
          <span class="info-value">{{ student?.realName }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">题目：</span>
          <span class="info-value">{{ student?.title || '未填写' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">类型：</span>
          <el-tag :type="getTypeTagType(student?.type)" size="small">
            {{ getTypeText(student?.type) }}
          </el-tag>
        </div>
      </div>
    </div>

    <!-- 评分表 -->
    <div class="score-form">
      <!-- 论文类型评分表 -->
      <div v-if="student?.type === 0" class="paper-score-form">
        <div class="score-header">
          <h3>毕业论文答辩成绩评分表</h3>
          <div class="total-score-input">
            <span class="total-label">总分（自动计算）：</span>
            <el-input-number
                v-model="paperScores.total"
                :min="0"
                :max="100"
                :step="1"
                :controls="false"
                disabled
                size="small"
                style="width: 100px"
            />
            <span class="score-unit">分</span>
          </div>
        </div>

        <el-divider />

        <div class="score-items">
          <!-- 论文质量 -->
          <div class="score-item">
            <div class="item-header">
              <span class="item-title">论文质量（40分）</span>
              <span class="item-weight">权重：40%</span>
            </div>
            <div class="item-controls">
              <el-input-number
                  v-model="paperScores.paper_quality"
                  :min="0"
                  :max="40"
                  :step="1"
                  :controls="false"
                  @change="calculatePaperTotal"
                  size="small"
                  style="width: 100px"
              />
              <span class="score-unit">分</span>
              <el-slider
                  v-model="paperScores.paper_quality"
                  :min="0"
                  :max="40"
                  :step="1"
                  :show-tooltip="false"
                  @change="calculatePaperTotal"
                  style="width: 200px; margin-left: 20px;"
              />
            </div>
          </div>

          <!-- 自述报告 -->
          <div class="score-item">
            <div class="item-header">
              <span class="item-title">自述报告（30分）</span>
              <span class="item-weight">权重：30%</span>
            </div>
            <div class="item-controls">
              <el-input-number
                  v-model="paperScores.presentation"
                  :min="0"
                  :max="30"
                  :step="1"
                  :controls="false"
                  @change="calculatePaperTotal"
                  size="small"
                  style="width: 100px"
              />
              <span class="score-unit">分</span>
              <el-slider
                  v-model="paperScores.presentation"
                  :min="0"
                  :max="30"
                  :step="1"
                  :show-tooltip="false"
                  @change="calculatePaperTotal"
                  style="width: 200px; margin-left: 20px;"
              />
            </div>
          </div>

          <!-- 回答问题 -->
          <div class="score-item">
            <div class="item-header">
              <span class="item-title">回答问题（30分）</span>
              <span class="item-weight">权重：30%</span>
            </div>
            <div class="item-controls">
              <el-input-number
                  v-model="paperScores.qa_performance"
                  :min="0"
                  :max="30"
                  :step="1"
                  :controls="false"
                  @change="calculatePaperTotal"
                  size="small"
                  style="width: 100px"
              />
              <span class="score-unit">分</span>
              <el-slider
                  v-model="paperScores.qa_performance"
                  :min="0"
                  :max="30"
                  :step="1"
                  :show-tooltip="false"
                  @change="calculatePaperTotal"
                  style="width: 200px; margin-left: 20px;"
              />
            </div>
          </div>
        </div>

        <!-- 快速分配按钮 -->
        <div class="quick-actions">
          <el-button
              type="text"
              icon="el-icon-sort"
              @click="autoDistributePaperScores"
              size="small"
          >
            自动分配总分
          </el-button>
        </div>
      </div>

      <!-- 设计类型评分表 -->
      <div v-else-if="student?.type === 1" class="design-score-form">
        <div class="score-header">
          <h3>毕业设计答辩成绩评分表</h3>
          <div class="total-score-control">
            <div class="total-input-group">
              <span class="total-label">总分：</span>
              <el-input-number
                  v-model="designScores.total"
                  :min="0"
                  :max="100"
                  :step="1"
                  :controls="false"
                  @change="autoDistributeDesignScores"
                  size="small"
                  style="width: 100px"
              />
              <span class="score-unit">分</span>
              <el-button
                  type="primary"
                  icon="el-icon-sort"
                  @click="autoDistributeDesignScores"
                  size="small"
                  style="margin-left: 20px;"
              >
                自动分配
              </el-button>
            </div>
          </div>
        </div>

        <el-divider />

        <div class="score-items">
          <!-- 设计质量分项1 -->
          <div class="score-item">
            <div class="item-header">
              <span class="item-title">设计质量分项1（15分）</span>
              <span class="item-weight">权重：15%</span>
            </div>
            <div class="item-controls">
              <el-input-number
                  v-model="designScores.design_quality1"
                  :min="0"
                  :max="15"
                  :step="1"
                  :controls="false"
                  @change="calculateDesignTotal"
                  size="small"
                  style="width: 80px"
              />
              <span class="score-unit">分</span>
              <el-slider
                  v-model="designScores.design_quality1"
                  :min="0"
                  :max="15"
                  :step="1"
                  :show-tooltip="false"
                  @change="calculateDesignTotal"
                  style="width: 180px; margin-left: 15px;"
              />
            </div>
          </div>

          <!-- 设计质量分项2 -->
          <div class="score-item">
            <div class="item-header">
              <span class="item-title">设计质量分项2（15分）</span>
              <span class="item-weight">权重：15%</span>
            </div>
            <div class="item-controls">
              <el-input-number
                  v-model="designScores.design_quality2"
                  :min="0"
                  :max="15"
                  :step="1"
                  :controls="false"
                  @change="calculateDesignTotal"
                  size="small"
                  style="width: 80px"
              />
              <span class="score-unit">分</span>
              <el-slider
                  v-model="designScores.design_quality2"
                  :min="0"
                  :max="15"
                  :step="1"
                  :show-tooltip="false"
                  @change="calculateDesignTotal"
                  style="width: 180px; margin-left: 15px;"
              />
            </div>
          </div>

          <!-- 设计质量分项3 -->
          <div class="score-item">
            <div class="item-header">
              <span class="item-title">设计质量分项3（15分）</span>
              <span class="item-weight">权重：15%</span>
            </div>
            <div class="item-controls">
              <el-input-number
                  v-model="designScores.design_quality3"
                  :min="0"
                  :max="15"
                  :step="1"
                  :controls="false"
                  @change="calculateDesignTotal"
                  size="small"
                  style="width: 80px"
              />
              <span class="score-unit">分</span>
              <el-slider
                  v-model="designScores.design_quality3"
                  :min="0"
                  :max="15"
                  :step="1"
                  :show-tooltip="false"
                  @change="calculateDesignTotal"
                  style="width: 180px; margin-left: 15px;"
              />
            </div>
          </div>

          <!-- 自述报告 -->
          <div class="score-item">
            <div class="item-header">
              <span class="item-title">自述报告（25分）</span>
              <span class="item-weight">权重：25%</span>
            </div>
            <div class="item-controls">
              <el-input-number
                  v-model="designScores.design_presentation"
                  :min="0"
                  :max="25"
                  :step="1"
                  :controls="false"
                  @change="calculateDesignTotal"
                  size="small"
                  style="width: 80px"
              />
              <span class="score-unit">分</span>
              <el-slider
                  v-model="designScores.design_presentation"
                  :min="0"
                  :max="25"
                  :step="1"
                  :show-tooltip="false"
                  @change="calculateDesignTotal"
                  style="width: 180px; margin-left: 15px;"
              />
            </div>
          </div>

          <!-- 回答问题情况分项1 -->
          <div class="score-item">
            <div class="item-header">
              <span class="item-title">回答问题情况分项1（15分）</span>
              <span class="item-weight">权重：15%</span>
            </div>
            <div class="item-controls">
              <el-input-number
                  v-model="designScores.design_qa1"
                  :min="0"
                  :max="15"
                  :step="1"
                  :controls="false"
                  @change="calculateDesignTotal"
                  size="small"
                  style="width: 80px"
              />
              <span class="score-unit">分</span>
              <el-slider
                  v-model="designScores.design_qa1"
                  :min="0"
                  :max="15"
                  :step="1"
                  :show-tooltip="false"
                  @change="calculateDesignTotal"
                  style="width: 180px; margin-left: 15px;"
              />
            </div>
          </div>

          <!-- 回答问题情况分项2 -->
          <div class="score-item">
            <div class="item-header">
              <span class="item-title">回答问题情况分项2（15分）</span>
              <span class="item-weight">权重：15%</span>
            </div>
            <div class="item-controls">
              <el-input-number
                  v-model="designScores.design_qa2"
                  :min="0"
                  :max="15"
                  :step="1"
                  :controls="false"
                  @change="calculateDesignTotal"
                  size="small"
                  style="width: 80px"
              />
              <span class="score-unit">分</span>
              <el-slider
                  v-model="designScores.design_qa2"
                  :min="0"
                  :max="15"
                  :step="1"
                  :show-tooltip="false"
                  @change="calculateDesignTotal"
                  style="width: 180px; margin-left: 15px;"
              />
            </div>
          </div>
        </div>

        <!-- 分配提示 -->
        <div class="distribution-hint">
          <el-alert
              title="自动分配说明"
              type="info"
              :closable="false"
              size="small"
          >
            <p>点击"自动分配"按钮，系统将根据总分和权重比例自动分配各分项成绩。</p>
            <p>各分项成绩满足：分项成绩 ≤ 分项最大分值，且总和等于填写的总分。</p>
          </el-alert>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm">保存成绩</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';

interface Student {
  id: string;
  real_name: string;
  title?: string;
  type?: number;
}

interface PaperScores {
  total: number;
  paper_quality: number;
  presentation: number;
  qa_performance: number;
}

interface DesignScores {
  total: number;
  design_quality1: number;
  design_quality2: number;
  design_quality3: number;
  design_presentation: number;
  design_qa1: number;
  design_qa2: number;
}

export default defineComponent({
  name: 'ScoreDialog',
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    student: {
      type: Object as () => Student | null,
      default: null
    },
    initialScores: {
      type: Object,
      default: null
    }
  },

  emits: ['update:visible', 'confirm', 'cancel'],

  setup(props, { emit }) {
    // 论文类型评分数据
    const paperScores = ref<PaperScores>({
      total: 0,
      paper_quality: 0,
      presentation: 0,
      qa_performance: 0
    });

    // 设计类型评分数据
    const designScores = ref<DesignScores>({
      total: 0,
      design_quality1: 0,
      design_quality2: 0,
      design_quality3: 0,
      design_presentation: 0,
      design_qa1: 0,
      design_qa2: 0
    });

    // 对话框标题
    const dialogTitle = computed(() => {
      return `为 ${props.student?.realName} (${props.student?.stu_id}) 评分`;
    });

    // 初始化数据
    const initializeScores = () => {
      if (props.initialScores) {
        if (props.student?.type === 0) {
          // 论文类型
          paperScores.value = {
            total: props.initialScores.total || 0,
            paper_quality: props.initialScores.paper_quality || 0,
            presentation: props.initialScores.presentation || 0,
            qa_performance: props.initialScores.qa_performance || 0
          };
        } else if (props.student?.type === 1) {
          // 设计类型
          designScores.value = {
            total: props.initialScores.total || 0,
            design_quality1: props.initialScores.design_quality1 || 0,
            design_quality2: props.initialScores.design_quality2 || 0,
            design_quality3: props.initialScores.design_quality3 || 0,
            design_presentation: props.initialScores.design_presentation || 0,
            design_qa1: props.initialScores.design_qa1 || 0,
            design_qa2: props.initialScores.design_qa2 || 0
          };
        }
      } else {
        // 重置为初始状态
        if (props.student?.type === 0) {
          paperScores.value = {
            total: 0,
            paper_quality: 0,
            presentation: 0,
            qa_performance: 0
          };
        } else if (props.student?.type === 1) {
          designScores.value = {
            total: 0,
            design_quality1: 0,
            design_quality2: 0,
            design_quality3: 0,
            design_presentation: 0,
            design_qa1: 0,
            design_qa2: 0
          };
        }
      }
    };

    // 监听学生变化，重新初始化
    watch(() => props.student, initializeScores, { immediate: true });

    // 计算论文总分
    const calculatePaperTotal = () => {
      paperScores.value.total =
          paperScores.value.paper_quality +
          paperScores.value.presentation +
          paperScores.value.qa_performance;
    };

    // 计算设计总分
    const calculateDesignTotal = () => {
      designScores.value.total =
          designScores.value.design_quality1 +
          designScores.value.design_quality2 +
          designScores.value.design_quality3 +
          designScores.value.design_presentation +
          designScores.value.design_qa1 +
          designScores.value.design_qa2;
    };

    // 自动分配论文分数（根据总分）
    const autoDistributePaperScores = () => {
      if (paperScores.value.total <= 0) {
        ElMessage.warning('请输入总分');
        return;
      }

      const total = paperScores.value.total;

      // 按权重比例分配
      const weights = [0.4, 0.3, 0.3];
      const maxScores = [40, 30, 30];

      let allocated = [0, 0, 0];
      let remaining = total;

      // 第一轮：按权重分配整数部分
      for (let i = 0; i < 3; i++) {
        allocated[i] = Math.floor(total * weights[i]);
        remaining -= allocated[i];
      }

      // 第二轮：分配剩余分数，确保不超过最大值
      for (let i = 0; i < 3 && remaining > 0; i++) {
        const maxAdditional = maxScores[i] - allocated[i];
        const toAdd = Math.min(maxAdditional, remaining);
        allocated[i] += toAdd;
        remaining -= toAdd;
      }

      // 更新分数
      paperScores.value.paper_quality = allocated[0];
      paperScores.value.presentation = allocated[1];
      paperScores.value.qa_performance = allocated[2];

      // 重新计算总分（可能因为取整有微小差异）
      calculatePaperTotal();
    };

    // 自动分配设计分数
    const autoDistributeDesignScores = () => {
      if (designScores.value.total <= 0) {
        ElMessage.warning('请输入总分');
        return;
      }

      const total = designScores.value.total;

      // 权重：[0.15, 0.15, 0.15, 0.25, 0.15, 0.15]
      const weights = [0.15, 0.15, 0.15, 0.25, 0.15, 0.15];
      const maxScores = [15, 15, 15, 25, 15, 15];

      let allocated = [0, 0, 0, 0, 0, 0];
      let remaining = total;

      // 第一轮：按权重分配整数部分
      for (let i = 0; i < 6; i++) {
        allocated[i] = Math.floor(total * weights[i]);
        remaining -= allocated[i];
      }

      // 第二轮：分配剩余分数，确保不超过最大值
      let index = 0;
      while (remaining > 0 && index < 100) { // 防止无限循环
        for (let i = 0; i < 6 && remaining > 0; i++) {
          const maxAdditional = maxScores[i] - allocated[i];
          if (maxAdditional > 0) {
            allocated[i] += 1;
            remaining -= 1;
          }
        }
        index++;
      }

      // 如果还有剩余分数，需要调整
      if (remaining > 0) {
        ElMessage.warning('自动分配后仍有剩余分数，请手动调整');
      }

      // 更新分数
      designScores.value.design_quality1 = allocated[0];
      designScores.value.design_quality2 = allocated[1];
      designScores.value.design_quality3 = allocated[2];
      designScores.value.design_presentation = allocated[3];
      designScores.value.design_qa1 = allocated[4];
      designScores.value.design_qa2 = allocated[5];

      // 重新计算总分
      calculateDesignTotal();
    };

    // 工具函数
    const getTypeTagType = (type?: number) => {
      return type === 1 ? 'warning' : 'primary';
    };

    const getTypeText = (type?: number) => {
      return type === 1 ? '毕业设计' : '毕业论文';
    };

    // 处理确认
    const handleConfirm = () => {
      // 验证数据
      if (props.student?.type === 0) {
        if (paperScores.value.total <= 0) {
          ElMessage.warning('请填写评分');
          return;
        }

        if (paperScores.value.total > 100) {
          ElMessage.warning('总分不能超过100分');
          return;
        }

        emit('confirm', {
          studentId: props.student?.id,
          type: 0,
          total: paperScores.value.total,
          paper_quality: paperScores.value.paper_quality,
          presentation: paperScores.value.presentation,
          qa_performance: paperScores.value.qa_performance
        });

      } else if (props.student?.type === 1) {
        if (designScores.value.total <= 0) {
          ElMessage.warning('请填写评分');
          return;
        }

        if (designScores.value.total > 100) {
          ElMessage.warning('总分不能超过100分');
          return;
        }

        // 检查各项是否超过最大值
        const items = [
          { name: '设计质量分项1', value: designScores.value.design_quality1, max: 15 },
          { name: '设计质量分项2', value: designScores.value.design_quality2, max: 15 },
          { name: '设计质量分项3', value: designScores.value.design_quality3, max: 15 },
          { name: '自述报告', value: designScores.value.design_presentation, max: 25 },
          { name: '回答问题分项1', value: designScores.value.design_qa1, max: 15 },
          { name: '回答问题分项2', value: designScores.value.design_qa2, max: 15 }
        ];

        for (const item of items) {
          if (item.value > item.max) {
            ElMessage.warning(`${item.name}不能超过${item.max}分`);
            return;
          }
        }

        emit('confirm', {
          studentId: props.student?.id,
          type: 1,
          total: designScores.value.total,
          design_quality1: designScores.value.design_quality1,
          design_quality2: designScores.value.design_quality2,
          design_quality3: designScores.value.design_quality3,
          design_presentation: designScores.value.design_presentation,
          design_qa1: designScores.value.design_qa1,
          design_qa2: designScores.value.design_qa2
        });
      }

      emit('update:visible', false);
    };

    // 处理取消
    const handleCancel = () => {
      emit('cancel');
      emit('update:visible', false);
    };

    return {
      paperScores,
      designScores,
      dialogTitle,
      calculatePaperTotal,
      calculateDesignTotal,
      autoDistributePaperScores,
      autoDistributeDesignScores,
      getTypeTagType,
      getTypeText,
      handleConfirm,
      handleCancel
    };
  }
});
</script>

<style scoped>
.student-info {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-label {
  color: #606266;
  font-weight: 500;
}

.info-value {
  color: #303133;
  margin-right: 10px;
}

.score-form {
  max-height: 500px;
  overflow-y: auto;
  padding-right: 10px;
}

.score-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.score-header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
}

.total-score-input {
  display: flex;
  align-items: center;
}

.total-label {
  color: #606266;
  margin-right: 10px;
}

.score-unit {
  margin-left: 5px;
  color: #909399;
}

.total-score-control {
  display: flex;
  justify-content: flex-end;
}

.total-input-group {
  display: flex;
  align-items: center;
}

.score-items {
  margin-top: 20px;
}

.score-item {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.item-title {
  font-weight: 500;
  color: #303133;
}

.item-weight {
  color: #409EFF;
  font-size: 12px;
}

.item-controls {
  display: flex;
  align-items: center;
}

.quick-actions {
  margin-top: 20px;
  text-align: right;
}

.distribution-hint {
  margin-top: 20px;
}

.distribution-hint p {
  margin: 5px 0;
  font-size: 12px;
  color: #606266;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 自定义滚动条 */
.score-form::-webkit-scrollbar {
  width: 6px;
}

.score-form::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.score-form::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.score-form::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
