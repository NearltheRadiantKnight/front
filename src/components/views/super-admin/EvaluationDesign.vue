<template>
  <div class="evaluation-design">
    <el-card class="header-card">
      <div class="header-content">
        <div class="header-icon">
          <i class="el-icon-edit-outline"></i>
        </div>
        <div class="header-text">
          <h3>本科毕业论文答辩成绩表 - 评价指标设置</h3>
          <p>设置3个评价指标的具体内容和评分权值，总权值必须为100%</p>
        </div>
      </div>
    </el-card>

    <el-card class="indicators-card">
      <template #header>
        <div class="card-header">
          <span>评价指标管理</span>
          <div>
            <el-select v-model="year" style="width: 100%"
                       @change="loadSettings">
              <el-option
                  v-for="item in years"
                  :key="item"
                  :label="item"
                  :value="item"
              />
            </el-select>
          </div>
        </div>
      </template>
      <el-table :data="indicators" style="width: 100%">
        <el-table-column label="序号" type="index" width="60"/>
        <el-table-column label="评价指标" prop="name" width="150">
          <template #default="scope">
            <el-input v-model="scope.row.name" placeholder="指标名称"/>
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
            />
            %
          </template>
        </el-table-column>
      </el-table>
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
import {defineComponent, ref, computed} from 'vue';
import {ElMessage} from 'element-plus';
import request from "@/api";

export default defineComponent({
  name: 'EvaluationDesign',
  setup() {
    const indicators = ref([
      {id: 1, name: '设计质量1', content: '设计方案的创新性和实用性', weight: 20},
      {id: 2, name: '设计质量2', content: '设计过程的规范性和完整性', weight: 20},
      {id: 3, name: '设计质量3', content: '设计成果的技术含量和难度', weight: 20},
      {id: 4, name: '答辩的自述报告成绩', content: '报告内容的完整性和表达能力', weight: 20},
      {id: 5, name: '回答问题的情况', content: '问题理解和回答准确性', weight: 15},
      {id: 6, name: '综合表现', content: '整体表现和态度', weight: 5}
    ]);
    const saving = ref(false);
    const currentYear = new Date().getFullYear();

    const year = ref(currentYear);
    const years = ref([2024, 2025]);

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
        {id: 1, name: '设计质量1', content: '设计方案的创新性和实用性', weight: 20},
        {id: 2, name: '设计质量2', content: '设计过程的规范性和完整性', weight: 20},
        {id: 3, name: '设计质量3', content: '设计成果的技术含量和难度', weight: 20},
        {id: 4, name: '答辩的自述报告成绩', content: '报告内容的完整性和表达能力', weight: 20},
        {id: 5, name: '回答问题的情况', content: '问题理解和回答准确性', weight: 15},
        {id: 6, name: '综合表现', content: '整体表现和态度', weight: 5}
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

      request.post("/evaluation/save?type=2&year=" + year.value, {...indicators.value});

      ElMessage.success('毕业设计评价指标保存成功');
    };

    const resetIndicators = () => {
      indicators.value = indicators.value.map(indicator => ({
        ...indicator,
        content: '',
        weight: 0
      }));
    };

    const loadSettings = async () => {
      request.get("/evaluation/load?type=2&year=" + year.value).then((res: any) => {
        indicators.value = res.data;
      });
    };

    const allyear = () => {
      request.get("/defense/allyear").then(res => {
        years.value = [];
        for (let i = 0; i < res.data.length; i++) {
          years.value.push(res.data[i]["year"]);
        }
      });
    };

    return {
      indicators,
      totalWeight,
      year,
      years,
      allyear,
      loadSettings,
      applyDefaultIndicators,
      saveIndicators,
      resetIndicators
    };
  },
  mounted(): any {
    this.allyear();
  }
});
</script>

<style scoped>
.evaluation-thesis {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.header-card {
  margin-bottom: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  font-size: 48px;
  opacity: 0.9;
}

.header-text h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
}

.header-text p {
  margin: 0;
  opacity: 0.9;
}

.indicators-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.weight-summary {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.weight-stats {
  display: flex;
  gap: 40px;
  margin-bottom: 15px;
}

.weight-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.weight-item .label {
  font-weight: bold;
  color: #495057;
}

.weight-item .value {
  font-size: 18px;
  font-weight: bold;
}

.weight-item .value.success {
  color: #67c23a;
}

.weight-item .value.warning {
  color: #e6a23c;
}

.weight-item .value.error {
  color: #f56c6c;
}

.weight-progress {
  margin-top: 10px;
}

.default-example {
  margin-bottom: 20px;
}

.preview-card {
  margin-bottom: 20px;
}

.preview-table {
  border: 1px solid #dee2e6;
  border-radius: 4px;
  overflow: hidden;
}

.preview-header {
  padding: 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.preview-header h4 {
  margin: 0 0 5px 0;
  color: #212529;
}

.preview-header p {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

.preview-content {
  width: 100%;
  border-collapse: collapse;
}

.preview-content th {
  padding: 12px 15px;
  background: #e9ecef;
  border-bottom: 2px solid #dee2e6;
  text-align: left;
  font-weight: bold;
  color: #495057;
}

.preview-content td {
  padding: 12px 15px;
  border-bottom: 1px solid #dee2e6;
  color: #6c757d;
}

.preview-content tbody tr:hover {
  background-color: #f8f9fa;
}

.preview-content tbody tr:last-child td {
  border-bottom: none;
  background: #e9ecef;
  font-weight: bold;
  color: #212529;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}
</style>
