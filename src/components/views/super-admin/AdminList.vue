<template>
  <div class="admin-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>院系管理员列表</span>
          <div>
            <el-input v-model="searchKeyword" placeholder="搜索管理员" style="width: 200px; margin-right: 10px;" />
            <el-button type="primary" @click="$router.push('/super-admin/admin-add')">
              <i class="el-icon-plus"></i> 添加管理员
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="filteredAdmins" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="adminName" label="管理员姓名" />
        <el-table-column prop="username" label="登录用户名" />
        <el-table-column prop="institute" label="所属院系" />
        <el-table-column prop="phone" label="联系电话" width="120" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '正常' ? 'success' : 'danger'" size="small">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button type="text" size="small" @click="editAdmin(scope.row)">编辑</el-button>
            <el-button type="text" size="small" @click="resetPassword(scope.row)">重置密码</el-button>
            <el-button
              type="text"
              size="small"
              @click="toggleStatus(scope.row)"
              :style="{ color: scope.row.status === '正常' ? '#f56c6c' : '#67c23a' }"
            >
              {{ scope.row.status === '正常' ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { userApi } from '@/api';

export default defineComponent({
  name: 'AdminList',
  setup() {
    const admins = ref([
      { id: 1, adminName: '张管理员', username: 'cs_admin', institute: '计算机学院', phone: '13800138001', email: 'cs@university.edu', status: '正常' },
      { id: 2, adminName: '李管理员', username: 'math_admin', institute: '数学学院', phone: '13800138002', email: 'math@university.edu', status: '正常' },
      { id: 3, adminName: '王管理员', username: 'phy_admin', institute: '物理学院', phone: '13800138003', email: 'phy@university.edu', status: '禁用' }
    ]);

    const searchKeyword = ref('');

    const filteredAdmins = computed(() => {
      if (!searchKeyword.value) return admins.value;
      return admins.value.filter(admin =>
        admin.adminName.includes(searchKeyword.value) ||
        admin.username.includes(searchKeyword.value) ||
        admin.institute.includes(searchKeyword.value) ||
        admin.phone.includes(searchKeyword.value)
      );
    });

    const editAdmin = (row: any) => {
      ElMessage.info(`编辑管理员: ${row.adminName}`);
    };

    const resetPassword = async (row: any) => {
      try {
        await ElMessageBox.confirm(`确定要重置管理员 "${row.adminName}" 的密码吗？`, '提示', {
          type: 'warning'
        });
        ElMessage.success('密码已重置为: 123456');
      } catch {
        // 用户取消
      }
    };

    const toggleStatus = async (row: any) => {
      const newStatus = row.status === '正常' ? '禁用' : '正常';
      const action = row.status === '正常' ? '禁用' : '启用';

      try {
        await ElMessageBox.confirm(`确定要${action}管理员 "${row.adminName}" 吗？`, '提示', {
          type: 'warning'
        });
        row.status = newStatus;
        ElMessage.success(`${action}成功`);
      } catch {
        // 用户取消
      }
    };

    return {
      admins,
      searchKeyword,
      filteredAdmins,
      editAdmin,
      resetPassword,
      toggleStatus
    };
  }
});
</script>

<style scoped>
.admin-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>