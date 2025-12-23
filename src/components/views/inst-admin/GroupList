<template>
  <div class="group-list">
    <el-page-header @back="goBack" title="返回">
      <template #content>
        <span class="page-header-title">答辩小组列表</span>
      </template>
    </el-page-header>

    <el-card>
      <!-- 小组列表内容 -->
      <el-table :data="groups">
        <el-table-column prop="name" label="小组名称" />
        <el-table-column prop="year" label="年份" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button type="text" @click="viewGroup(scope.row)">查看</el-button>
            <el-button type="text" @click="editGroup(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'GroupList',
  methods: {
    goBack() {
      this.$router.back();
    },
    viewGroup(group: any) {
      this.$router.push({
        path: '/inst-admin/group-detail',
        query: { id: group.id }
      });
    },
    editGroup(group: any) {
      this.$router.push({
        path: '/inst-admin/group-edit',
        query: { id: group.id }
      });
    }
  }
});
</script>