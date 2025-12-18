<script setup lang="ts">
import {ref} from 'vue'
import EvaluationDesign from "@/components/views/super-admin/EvaluationDesign.vue";
import EvaluationThesis from "@/components/views/super-admin/EvaluationThesis.vue";
const activeTab = ref('thesis');
</script>

<template>
<div class="page-content">
  <div class="evaluation-manage">
    <el-card>
      <template #header>
        <span>评价指标管理</span>
      </template>
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="本科毕业论文答辩成绩表" name="thesis">
          <EvaluationThesis />
        </el-tab-pane>
        <el-tab-pane label="本科毕业设计答辩成绩表" name="design">
          <EvaluationDesign />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</div>
</template>

<style scoped>

</style>
