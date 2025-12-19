<template>
  <div class="institute-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>院系列表</span>
          <el-button type="primary" @click="handleAdd">
            <i class="el-icon-plus"></i> 添加院系
          </el-button>
        </div>
      </template>

      <el-table :data="instituteList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="院系名称" width="120" />
        <el-table-column label="院系管理员" width="120">
          <template #default="scope">
            {{ getAdminName(scope.row.instAdmin) || '未设置' }}
          </template>
        </el-table-column>
        <el-table-column prop="teacherNum" label="教师人数" width="100" />
        <el-table-column prop="studentNum" label="学生人数" width="100" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button type="text" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="text" size="small" @click="handleView(scope.row)">详情</el-button>
            <el-button type="text" size="small" @click="handleDelete(scope.row)" style="color: #f56c6c;">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog v-model="showDialog" :title="dialogTitle" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="院系名称" required>
          <el-input v-model="form.name" placeholder="请输入院系名称" />
        </el-form-item>
        <el-form-item label="院系管理员" required>
          <el-select v-model="form.instAdmin" placeholder="请选择院系管理员" style="width: 100%">
            <el-option label="未设置" value="" />
            <el-option
                v-for="admin in adminOptions"
                :key="admin.id"
                :label="admin.name"
                :value="admin.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="教师人数">
          <el-input-number v-model="form.teacherNum" :min="0" placeholder="请输入教师人数" />
        </el-form-item>
        <el-form-item label="学生人数">
          <el-input-number v-model="form.studentNum" :min="0" placeholder="请输入学生人数" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 定义院系数据类型接口
interface Institute {
  id: number;
  name: string;
  instAdmin: number | string; // 存储管理员ID
  teacherNum: number;
  studentNum: number;
}

interface AdminOption {
  id: number;
  name: string;
}

export default defineComponent({
  name: 'InstituteList',
  setup() {
    // 模拟管理员数据（可从API获取）
    const adminOptions = ref<AdminOption[]>([
      { id: 1, name: '张三' },
      { id: 2, name: '李四' },
      { id: 3, name: '王五' },
      { id: 4, name: '赵六' }
    ]);

    // 初始化数据，包含所有字段
    const instituteList = ref<Institute[]>([
      { id: 1, name: '计算机学院', instAdmin: 1, teacherNum: 50, studentNum: 800 },
      { id: 2, name: '数学学院', instAdmin: 2, teacherNum: 40, studentNum: 600 },
      { id: 3, name: '物理学院', instAdmin: 3, teacherNum: 35, studentNum: 500 },
      { id: 4, name: '文学院', instAdmin: '', teacherNum: 25, studentNum: 400 },
      { id: 5, name: '商学院', instAdmin: 4, teacherNum: 60, studentNum: 1200 }
    ]);

    // 计算属性：为每个院系添加管理员姓名
    const instituteListWithAdminName = computed(() => {
      return instituteList.value.map(institute => ({
        ...institute,
        instAdminName: getAdminName(institute.instAdmin) || '未设置'
      }));
    });

    const showDialog = ref(false);
    const dialogTitle = ref('添加院系');
    const isEditMode = ref(false);

    // 表单数据，包含所有字段
    const form = ref<Institute>({
      id: 0,
      name: '',
      instAdmin: '',
      teacherNum: 0,
      studentNum: 0
    });

    // 获取管理员姓名
    const getAdminName = (adminId: number | string): string => {
      if (!adminId) return '';
      const admin = adminOptions.value.find(item => item.id == adminId);
      return admin ? admin.name : '';
    };

    onMounted(() => {
      // 可以在这里加载真实数据
      loadInstituteList();
    });

    const loadInstituteList = () => {
      // 这里可以调用API获取数据
      console.log('加载院系列表数据');
    };

    const handleAdd = () => {
      dialogTitle.value = '添加院系';
      isEditMode.value = false;
      resetForm();
      showDialog.value = true;
    };

    const handleEdit = (row: Institute) => {
      dialogTitle.value = '编辑院系';
      isEditMode.value = true;
      form.value = { ...row };
      showDialog.value = true;
    };

    const handleView = (row: Institute) => {
      const adminName = getAdminName(row.instAdmin) || '未设置';

      ElMessageBox.alert(`
        <div style="text-align: left;">
          <p><strong>院系ID：</strong>${row.id}</p>
          <p><strong>院系名称：</strong>${row.name}</p>
          <p><strong>院系管理员：</strong>${adminName}</p>
          <p><strong>教师人数：</strong>${row.teacherNum}</p>
          <p><strong>学生人数：</strong>${row.studentNum}</p>
        </div>
      `, '院系详情', {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定'
      });
    };

    const handleDelete = async (row: Institute) => {
      try {
        await ElMessageBox.confirm(`确定删除院系 "${row.name}" 吗？`, '警告', {
          type: 'warning',
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        });

        instituteList.value = instituteList.value.filter(item => item.id !== row.id);
        ElMessage.success('删除成功');
      } catch {
        // 用户取消删除
      }
    };

    const handleSave = () => {
      if (!form.value.name.trim()) {
        ElMessage.warning('请填写院系名称');
        return;
      }

      if (isEditMode.value) {
        // 编辑
        const index = instituteList.value.findIndex(item => item.id === form.value.id);
        if (index !== -1) {
          instituteList.value[index] = { ...form.value };
        }
        ElMessage.success('院系信息已更新');
      } else {
        // 新增
        const newId = instituteList.value.length > 0
            ? Math.max(...instituteList.value.map(item => item.id)) + 1
            : 1;
        form.value.id = newId;
        instituteList.value.push({ ...form.value });
        ElMessage.success('院系添加成功');
      }

      showDialog.value = false;
    };

    const resetForm = () => {
      form.value = {
        id: 0,
        name: '',
        instAdmin: '',
        teacherNum: 0,
        studentNum: 0
      };
    };

    return {
      instituteList,
      instituteListWithAdminName,
      adminOptions,
      showDialog,
      dialogTitle,
      form,
      getAdminName,
      handleAdd,
      handleEdit,
      handleView,
      handleDelete,
      handleSave
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
  padding: 10px 0;
}

.el-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.el-table {
  margin-top: 10px;
}

.el-table-column {
  text-align: center;
}

.el-button--text {
  padding: 5px;
}
</style>