<template>
  <div class="evaluation-design">
    <el-alert
      title="本科毕业设计答辩成绩表 - 6个评价指标"
      type="info"
      description="请设置6个评价指标的具体内容和评分权值，总权值必须为100%"
      show-icon
      :closable="false"
      style="margin-bottom: 20px;"
    />

    <el-card>
      <el-table :data="indicators" style="width: 100%">
        <el-table-column label="序号" type="index" width="60" />
        <el-table-column label="评价指标" prop="name" width="150">
          <template #default="scope">
            <el-input v-model="scope.row.name" placeholder="指标名称" />
          </template>
        </el-table-column>
        <el-table-column label="具体内容">
          <template #default="scope">
            <el-input
              v-model="scope.row.content"
              type="textarea"
              :rows="2"
              placeholder="请输入具体评价内容"
            />
          </template>
        </el-table-column>
        <el-table-column label="评分权值" width="150">
          <template #default="scope">
            <el-input-number
              v-model="scope.row.weight"
              :min="0"
              :max="100"
              :step="5"
              size="small"
              style="width: 100px;"
            /> %
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button type="text" size="small" @click="removeIndicator(scope.$index)" style="color: #f56c6c;">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="table-footer">
        <el-button type="text" @click="addIndicator">
          <i class="el-icon-plus"></i> 添加指标
        </el-button>
        <div class="total-weight">
          总权值: <span :class="{ 'error': totalWeight !== 100 }">{{ totalWeight }}%</span>
          <span v-if="totalWeight !== 100" class="weight-warning"> (需要调整为100%)</span>
        </div>
      </div>
    </el-card>

    <div class="default-indicators">
      <h3>默认指标建议</h3>
      <el-card shadow="never">
        <p><strong>设计质量1：</strong>设计方案的创新性和实用性（建议权值：20%）</p>
        <p><strong>设计质量2：</strong>设计过程的规范性和完整性（建议权值：20%）</p>
        <p><strong>设计质量3：</strong>设计成果的技术含量和难度（建议权值：20%）</p>
        <p><strong>答辩的自述报告成绩：</strong>报告内容的完整性和表达能力（建议权值：20%）</p>
        <p><strong>回答问题的情况：</strong>问题理解和回答准确性（建议权值：15%）</p>
        <p><strong>综合表现：</strong>整体表现和态度（建议权值：5%）</p>
        <el-button type="text" @click="applyDefaultIndicators">应用默认设置</el-button>
      </el-card>
    </div>

    <div class="action-buttons">
      <el-button type="primary" :disabled="totalWeight !== 100" @click="saveIndicators">
        保存设置
      </el-button>
      <el-button @click="resetIndicators">重置</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { ElMessage } from 'element-plus';

export default defineComponent({
  name: 'EvaluationDesign',
  setup() {
    const indicators = ref([
      { id: 1, name: '设计质量1', content: '设计方案的创新性和实用性', weight: 20 },
      { id: 2, name: '设计质量2', content: '设计过程的规范性和完整性', weight: 20 },
      { id: 3, name: '设计质量3', content: '设计成果的技术含量和难度', weight: 20 },
      { id: 4, name: '答辩的自述报告成绩', content: '报告内容的完整性和表达能力', weight: 20 },
      { id: 5, name: '回答问题的情况', content: '问题理解和回答准确性', weight: 15 },
      { id: 6, name: '综合表现', content: '整体表现和态度', weight: 5 }
    ]);

    const totalWeight = computed(() => {
      return indicators.value.reduce((sum, item) => sum + item.weight, 0);
    });

    const addIndicator = () => {
      if (indicators.value.length >= 10) {
        ElMessage.warning('最多只能设置10个评价指标');
        return;
      }
      indicators.value.push({
        id: Date.now(),
        name: '',
        content: '',
        weight: 0
      });
    };

    const removeIndicator = (index: number) => {
      if (indicators.value.length <= 1) {
        ElMessage.warning('至少需要保留1个评价指标');
        return;
      }
      indicators.value.splice(index, 1);
    };

    const applyDefaultIndicators = () => {
      indicators.value = [
        { id: 1, name: '设计质量1', content: '设计方案的创新性和实用性', weight: 20 },
        { id: 2, name: '设计质量2', content: '设计过程的规范性和完整性', weight: 20 },
        { id: 3, name: '设计质量3', content: '设计成果的技术含量和难度', weight: 20 },
        { id: 4, name: '答辩的自述报告成绩', content: '报告内容的完整性和表达能力', weight: 20 },
        { id: 5, name: '回答问题的情况', content: '问题理解和回答准确性', weight: 15 },
        { id: 6, name: '综合表现', content: '整体表现和态度', weight: 5 }
      ];
      ElMessage.success('已应用默认设置');
    };

    const saveIndicators = () => {
      if (totalWeight.value !== 100) {
        ElMessage.warning('总权值必须为100%');
        return;
      }

      // 验证指标名称和内容
      for (const indicator of indicators.value) {
        if (!indicator.name.trim()) {
          ElMessage.warning('请填写所有指标的名称');
          return;
        }
        if (!indicator.content.trim()) {
          ElMessage.warning('请填写所有指标的具体内容');
          return;
        }
      }

      ElMessage.success('毕业设计评价指标保存成功');
      // 调用API保存到后端
      console.log('保存的指标数据:', indicators.value);
    };

    const resetIndicators = () => {
      indicators.value = indicators.value.map(indicator => ({
        ...indicator,
        content: '',
        weight: 0
      }));
    };

    return {
      indicators,
      totalWeight,
      addIndicator,
      removeIndicator,
      applyDefaultIndicators,
      saveIndicators,
      resetIndicators
    };
  }
});
</script>

<style scoped>
.evaluation-design {
  padding: 20px;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px solid #ebeef5;
}

.total-weight {
  font-weight: bold;
}

.total-weight .error {
  color: #f56c6c;
}

.weight-warning {
  color: #e6a23c;
  font-size: 14px;
}

.default-indicators {
  margin-top: 30px;
}

.default-indicators h3 {
  margin-bottom: 15px;
  color: #333;
}

.default-indicators p {
  margin-bottom: 10px;
  color: #666;
  line-height: 1.6;
}

.action-buttons {
  margin-top: 30px;
  text-align: center;
}

.evaluation-manage {
  padding: 20px;
}
</style>