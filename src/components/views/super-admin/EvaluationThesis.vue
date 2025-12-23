<template>
    <div class="evaluation-thesis">
        <!-- 头部信息 -->
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
        <router-view/>
        <!-- 指标管理 -->
        <el-card class="indicators-card">
            <template #header>
                <div class="card-header">
                    <span>评价指标管理</span>
                    <div>
                        <el-select v-model="year" style="width: 100%"
                                   @change="loadSettings">
                            <el-option
                                    v-for="item in this.years"
                                    :key="item"
                                    :label="item"
                                    :value="item"
                            />
                        </el-select>
                    </div>
                </div>
            </template>

            <!-- 指标表格 -->
            <el-table :data="indicators" style="width: 100%" border>
                <el-table-column label="序号" type="index" width="80" align="center"/>

                <el-table-column label="指标名称" width="180">
                    <template #default="scope">
                        <el-input
                                v-model="scope.row.name"
                                placeholder="请输入指标名称"
                                @change="validateIndicator(scope.row)"
                        />
                    </template>
                </el-table-column>

                <el-table-column label="具体内容描述">
                    <template #default="scope">
                        <el-input
                                v-model="scope.row.content"
                                type="textarea"
                                :rows="2"
                                placeholder="请输入具体的评价内容和标准"
                                resize="none"
                                @change="validateIndicator(scope.row)"
                        />
                    </template>
                </el-table-column>

                <el-table-column label="评分标准" width="180">
                    <template #default="scope">
                        <el-input
                                v-model="scope.row.criteria"
                                placeholder="如：优(90-100)、良(80-89)"
                                @change="validateIndicator(scope.row)"
                        />
                    </template>
                </el-table-column>

                <el-table-column label="权值(%)" width="140" align="center">
                    <template #default="scope">
                        <el-input-number
                                v-model="scope.row.weight"
                                :min="0"
                                :max="100"
                                :step="5"
                                :precision="0"
                                size="small"
                                controls-position="right"
                                @change="updateTotalWeight"
                        />
                    </template>
                </el-table-column>

            </el-table>

            <!-- 权值统计 -->
            <div class="weight-summary">
                <div class="weight-stats">
                    <div class="weight-item">
                        <span class="label">总权值：</span>
                        <span class="value" :class="totalWeightClass">{{ totalWeight }}%</span>
                    </div>
                    <div class="weight-item">
                        <span class="label">状态：</span>
                        <el-tag :type="totalWeight === 100 ? 'success' : 'danger'" size="small">
                            {{ totalWeight === 100 ? '有效' : '无效' }}
                        </el-tag>
                    </div>
                </div>

                <div class="weight-progress">
                    <el-progress
                            :percentage="totalWeight"
                            :stroke-width="10"
                            :color="totalWeight === 100 ? '#67c23a' : '#e6a23c'"
                            :show-text="false"
                    />
                </div>
            </div>
        </el-card>

        <!-- 默认设置示例 -->
        <el-card class="default-example">
            <template #header>
                <span><i class="el-icon-info"></i> 默认设置示例（建议参考）</span>
            </template>

            <el-table :data="defaultExamples" style="width: 100%">
                <el-table-column label="指标名称" prop="name" width="150"/>
                <el-table-column label="具体内容" prop="content"/>
                <el-table-column label="建议权值" prop="weight" width="100" align="center">
                    <template #default="scope">
                        <el-tag size="small">{{ scope.row.weight }}%</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="100" align="center">
                    <template #default="scope">
                        <el-button type="text" size="small" @click="applyExample(scope.row)">应用</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 操作按钮 -->
        <div class="action-buttons">
            <el-button
                    type="primary"
                    size="large"
                    @click="saveSettings"
                    :disabled="totalWeight !== 100 || !isValid"
                    :loading="saving"
            >
                <i class="el-icon-check"></i> 保存设置
            </el-button>
            <el-button size="large" @click="resetSettings">
                <i class="el-icon-refresh"></i> 重置
            </el-button>
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent, ref, computed, reactive} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import request from "@/api";

export default defineComponent({
    name: 'EvaluationThesis',
    setup() {
        const saving = ref(false);
        const currentYear = new Date().getFullYear();

        // 指标数据
        const indicators = ref([
            {
                id: 1,
                name: '论文质量',
                content: '论文选题意义、研究内容、创新性、规范性、工作量等',
                criteria: '优(90-100)、良(80-89)、中(70-79)、及格(60-69)、不及格(0-59)',
                weight: 40
            },
            {
                id: 2,
                name: '答辩的自述报告',
                content: '报告内容完整性、逻辑性、表达能力、时间控制、PPT制作等',
                criteria: '优(90-100)、良(80-89)、中(70-79)、及格(60-69)、不及格(0-59)',
                weight: 30
            },
            {
                id: 3,
                name: '回答问题的情况',
                content: '问题理解准确性、回答逻辑性、知识掌握程度、思维敏捷性等',
                criteria: '优(90-100)、良(80-89)、中(70-79)、及格(60-69)、不及格(0-59)',
                weight: 30
            }
        ]);
        const year = ref(currentYear);
        const years = ref([2024,2025]);

        // 默认示例
        const defaultExamples = ref([
            {id: 1, name: '论文质量', content: '选题意义、研究内容、创新性、规范性、工作量等', weight: 40},
            {id: 2, name: '论文撰写质量', content: '结构完整性、逻辑性、文字表达、格式规范等', weight: 30},
            {id: 3, name: '答辩表现', content: '报告陈述、问题回答、综合表现等', weight: 30}
        ]);

        // 计算总权值
        const totalWeight = computed(() => {
            return indicators.value.reduce((sum, item) => sum + item.weight, 0);
        });

        // 验证是否有效
        const isValid = computed(() => {
            if (totalWeight.value !== 100) return false;
            for (const indicator of indicators.value) {
                if (!indicator.name?.trim() || !indicator.content?.trim()) {
                    return false;
                }
            }
            return true;
        });

        // 权值状态样式
        const totalWeightClass = computed(() => {
            if (totalWeight.value === 100) return 'success';
            if (totalWeight.value > 100) return 'error';
            return 'warning';
        });

        // 更新总权值
        const updateTotalWeight = () => {
            // 自动调整权值逻辑
            if (totalWeight.value > 100) {
                ElMessage.warning({
                    message: `总权值${totalWeight.value}%超过100%，请调整`,
                    duration: 2000
                });
            }
        };

        // 验证单个指标
        const validateIndicator = (indicator: any) => {
            if (indicator.weight < 0) indicator.weight = 0;
            if (indicator.weight > 100) indicator.weight = 100;
        };

        // 应用示例
        const applyExample = (example: any) => {
            const emptyIndicator = indicators.value.find(item => !item.name.trim());
            if (emptyIndicator) {
                emptyIndicator.name = example.name;
                emptyIndicator.content = example.content;
                emptyIndicator.weight = example.weight;
            } else {
                ElMessage.info('请先添加一个空指标或编辑现有指标');
            }
        };

        // 恢复默认设置
        const resetToDefault = () => {
            indicators.value = [
                {
                    id: 1,
                    name: '论文质量',
                    content: '论文选题意义、研究内容、创新性、规范性、工作量等',
                    criteria: '优(90-100)、良(80-89)、中(70-79)、及格(60-69)、不及格(0-59)',
                    weight: 40
                },
                {
                    id: 2,
                    name: '答辩的自述报告',
                    content: '报告内容完整性、逻辑性、表达能力、时间控制、PPT制作等',
                    criteria: '优(90-100)、良(80-89)、中(70-79)、及格(60-69)、不及格(0-59)',
                    weight: 30
                },
                {
                    id: 3,
                    name: '回答问题的情况',
                    content: '问题理解准确性、回答逻辑性、知识掌握程度、思维敏捷性等',
                    criteria: '优(90-100)、良(80-89)、中(70-79)、及格(60-69)、不及格(0-59)',
                    weight: 30
                }
            ];
            ElMessage.success('已恢复默认设置');
        };

        // 保存设置
        const saveSettings = async () => {
            if (totalWeight.value !== 100) {
                ElMessage.warning('总权值必须为100%');
                return;
            }

            // 验证所有指标
            for (const [index, indicator] of indicators.value.entries()) {
                if (!indicator.name?.trim()) {
                    ElMessage.warning(`请填写第${index + 1}个指标的名称`);
                    return;
                }
                if (!indicator.content?.trim()) {
                    ElMessage.warning(`请填写第${index + 1}个指标的具体内容`);
                    return;
                }
            }

            saving.value = true;
            try {
                console.log({...indicators.value});
                request.post("/evaluation/save", {...indicators.value});

                ElMessage.success({
                    message: '毕业论文评价指标保存成功',
                    duration: 3000
                });

                // 这里可以调用后端API保存数据
                console.log('保存的数据:', indicators.value);

            } catch (error) {
                console.error('保存失败:', error);
                ElMessage.error('保存失败，请重试');
            } finally {
                saving.value = false;
            }
        };

        const loadSettings = async () => {
            request.get("/evaluation/load").then((res: any) => {
                indicators.value = res.data;
                console.log(indicators.value);
                console.log(res.data);
            });

        };

        // 重置设置
        const resetSettings = () => {


            ElMessageBox.confirm('确定要重置所有设置吗？', '提示', {
                type: 'warning'
            }).then(() => {
                indicators.value = indicators.value.map(indicator => ({
                    ...indicator,
                    name: '',
                    content: '',
                    criteria: '',
                    weight: 0
                }));
                ElMessage.success('已重置所有设置');
            });
        };

        return {
            indicators,
            defaultExamples,
            totalWeight,
            totalWeightClass,
            isValid,
            saving,
            currentYear,
            year,
            years,
            updateTotalWeight,
            validateIndicator,
            applyExample,
            resetToDefault,
            saveSettings,
            loadSettings,
            resetSettings
        };
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
