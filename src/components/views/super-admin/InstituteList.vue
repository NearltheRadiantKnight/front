<template>
  <div class="institute-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>院系列表</span>
          <el-button type="primary" @click="showAddDialog = true">
            <i class="el-icon-plus"></i> 添加院系
          </el-button>
        </div>
      </template>

      <el-table :data="instituteList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="院系名称" />
        <el-table-column prop="code" label="院系代码" width="120" />
        <el-table-column prop="dean" label="院长" width="120" />
        <el-table-column prop="teacherCount" label="教师数量" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button type="text" size="small" @click="editInstitute(scope.row)">编辑</el-button>
            <el-button type="text" size="small" @click="viewDetail(scope.row)">详情</el-button>
            <el-button type="text" size="small" @click="deleteInstitute(scope.row)" style="color: #f56c6c;">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog v-model="showAddDialog" :title="dialogTitle" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="院系名称" required>
          <el-input v-model="form.name" placeholder="请输入院系名称" />
        </el-form-item>
        <el-form-item label="院系代码" required>
          <el-input v-model="form.code" placeholder="请输入院系代码" />
        </el-form-item>
        <el-form-item label="院长姓名">
          <el-input v-model="form.dean" placeholder="请输入院长姓名" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="院系简介">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入院系简介" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="saveInstitute">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

export default defineComponent({
  name: 'InstituteList',
  setup() {
    const instituteList = ref([
      { id: 1, name: '计算机学院', code: 'CS', dean: '张教授', teacherCount: 45, createTime: '2023-09-01' },
      { id: 2, name: '数学学院', code: 'MATH', dean: '李教授', teacherCount: 32, createTime: '2023-09-01' },
      { id: 3, name: '物理学院', code: 'PHY', dean: '王教授', teacherCount: 28, createTime: '2023-09-05' }
    ]);

    const showAddDialog = ref(false);
    const dialogTitle = ref('添加院系');
    const form = ref({
      id: 0,
      name: '',
      code: '',
      dean: '',
      phone: '',
      email: '',
      description: ''
    });

    const editInstitute = (row: any) => {
      dialogTitle.value = '编辑院系';
      form.value = { ...row };
      showAddDialog.value = true;
    };

    const viewDetail = (row: any) => {
      ElMessage.info(`查看院系详情: ${row.name}`);
    };

    const deleteInstitute = async (row: any) => {
      try {
        await ElMessageBox.confirm(`确定删除院系 "${row.name}" 吗？`, '提示', {
          type: 'warning'
        });
        instituteList.value = instituteList.value.filter(item => item.id !== row.id);
        ElMessage.success('删除成功');
      } catch {
        // 用户取消删除
      }
    };

    const saveInstitute = () => {
      if (!form.value.name || !form.value.code) {
        ElMessage.warning('请填写院系名称和代码');
        return;
      }

      if (form.value.id) {
        // 编辑
        const index = instituteList.value.findIndex(item => item.id === form.value.id);
        if (index !== -1) {
          instituteList.value[index] = { ...form.value };
        }
      } else {
        // 新增
        form.value.id = instituteList.value.length + 1;
        form.value.createTime = new Date().toLocaleDateString();
        form.value.teacherCount = 0;
        instituteList.value.push({ ...form.value });
      }

      showAddDialog.value = false;
      ElMessage.success('保存成功');
      resetForm();
    };

    const resetForm = () => {
      form.value = {
        id: 0,
        name: '',
        code: '',
        dean: '',
        phone: '',
        email: '',
        description: ''
      };
    };

    return {
      instituteList,
      showAddDialog,
      dialogTitle,
      form,
      editInstitute,
      viewDetail,
      deleteInstitute,
      saveInstitute
    };
  }
});
</script>

<style scoped>
.institute-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>