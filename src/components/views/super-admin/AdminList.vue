<template>
  <div class="admin-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>院系管理员列表</span>
          <div>
            <el-input v-model="searchKeyword" placeholder="搜索管理员"
                      style="width: 200px; margin-right: 10px;"/>
            <el-button type="primary" @click="$router.push('/admin/adminadd')">
              <i class="el-icon-plus"></i> 添加管理员
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="filteredAdmins" style="width: 100%">
        <el-table-column prop="realName" label="管理员姓名"/>
        <el-table-column prop="id" label="登录用户名"/>
        <el-table-column label="所属院系" width="150">
          <template #default="scope">
            {{ getInstituteName(scope.row.InstId) }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" width="120"/>
        <el-table-column prop="email" label="邮箱"/>
        <el-table-column label="操作" width="250">
          <template #default="scope">
            <el-button type="text" size="small" @click="editAdmin(scope.row)">编辑</el-button>
            <el-button type="text" size="small" @click="resetPassword(scope.row)">重置密码</el-button>
            <el-button type="text" size="small" style="color: #F56C6C" @click="deleteAdmin(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="showDialog" :title="dialogTitle" width="500px">
      <el-form :model="form" label-width="100px" :rules="formRules" ref="formRef">
        <el-form-item label="管理员姓名" prop="realName" required>
          <el-input v-model="form.realName" placeholder="请输入管理员姓名"/>
        </el-form-item>
        <el-form-item label="登录账号" prop="id" required>
          <el-input v-model="form.id" placeholder="请输入登录账号" :disabled="isEditMode"/>
        </el-form-item>
        <el-form-item label="所属院系" prop="Pwd" required>
          <el-select v-model="form.instituteId" placeholder="请选择所属院系" style="width: 100%">
            <el-option
                v-for="item in instituteList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话"/>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saveLoading">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref, computed} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import type {FormInstance, FormRules} from 'element-plus';
import {userApi} from '@/api/user.ts';
import {instituteApi} from "@/api/institute.ts";
import request from "@/api";

export default defineComponent({
  name: 'AdminList',
  data() {
    return {
      instituteList: [] as any[],
      admins: [] as any[],
      showDialog: false,
      dialogTitle: '修改管理员',
      isEditMode: false,
      saveLoading: false,
      searchKeyword: ref(''),
      form: {
        id: '',
        realName: '',
        instituteId: '',
        phone: '',
        email: ''
      },
      formRules: {
        realName: [
          { required: true, message: '请输入管理员姓名', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        id: [
          { required: true, message: '请输入登录账号', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        instituteId: [
          { required: true, message: '请选择所属院系', trigger: 'change' }
        ],
        phone: [
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        email: [
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ]
      } as FormRules
    }
  },
  computed: {
    filteredAdmins() {
      const keyword = this.searchKeyword?.toLowerCase() || '';
      if (!keyword) return this.admins;

      return this.admins.filter(admin =>
          (admin.realName && admin.realName.toLowerCase().includes(keyword)) ||
          (admin.id && admin.id.toLowerCase().includes(keyword)) ||
          (admin.phone && admin.phone.includes(keyword)) ||
          (admin.email && admin.email.toLowerCase().includes(keyword))
      );
    }
  },
  methods: {
    async loadAdmin() {
      try {
        const res = await userApi.getInstituteAdmins();
        console.log('管理员列表:', res.data);
        this.admins = res.data || [];
      } catch (error) {
        console.error('加载管理员失败:', error);
        ElMessage.error('加载管理员列表失败');
      }
    },
    async loadInstituteList() {
      try {
        const res = await instituteApi.getInstitutes();
        this.instituteList = res.data || [];
      } catch (error) {
        console.error('加载院系列表失败:', error);
        ElMessage.error('加载院系列表失败');
      }
    },
    getInstituteName(instituteId: string) {
      const institute = this.instituteList.find(item => item.id === instituteId);
      console.log('getInstituteName:', institute);
      return institute ? institute.name : '未知院系';

    },
    editAdmin(row: any) {
      this.dialogTitle = '编辑管理员';
      this.isEditMode = true;
      this.form = {
        id: row.id,
        realName: row.realName,
        instituteId: row.instituteId,
        phone: row.phone || '',
        email: row.email || ''
      };
      this.showDialog = true;
    },
    async handleSave() {
      const formRef = this.$refs.formRef as FormInstance;
      if (!formRef) return;

      try {
        await formRef.validate();
        this.saveLoading = true;

        if (this.isEditMode) {
          // 编辑模式
          await userApi.updateAdmin({...this.form});
          ElMessage.success('修改成功');
        }

        this.showDialog = false;
        await this.loadAdmin();
      } catch (error: any) {
        if (error && error.message !== 'validate') {
          ElMessage.error(error.message || '操作失败');
        }
      } finally {
        this.saveLoading = false;
      }
    },
    // 重置密码功能
    async resetPassword(row: any) {
      try {
        await ElMessageBox.confirm(
            `确定要重置管理员 "${row.realName}" 的密码吗？`,
            '提示',
            {
              type: 'warning',
              confirmButtonText: '确定',
              cancelButtonText: '取消'
            }
        );

        // 调用后端重置密码API
        const response = await request.post("/admin/resetPassword",{"id":row.id});

        // 根据后端返回结果处理
        if (response.code === 200) {
          ElMessage.success(response.message || '密码重置成功');

          if (response.data && response.data.newPassword) {
            await ElMessageBox.alert(
                `新密码为: ${response.data.newPassword}，请妥善保存`,
                '密码重置成功',
                {
                  confirmButtonText: '确定',
                  type: 'success'
                }
            );
          }
        } else {
          ElMessage.error(response.message || '密码重置失败');
        }
      } catch (error) {
        // 用户取消操作
        console.log('用户取消重置密码');
      }
    },
    // 删除管理员功能
    async deleteAdmin(row: any) {
      try {
        await ElMessageBox.confirm(
            `确定要删除管理员 "${row.realName}" 吗？此操作不可恢复！`,
            '提示',
            {
              type: 'warning',
              confirmButtonText: '删除',
              cancelButtonText: '取消',
              confirmButtonClass: 'el-button--danger'
            }
        );

        // 调用后端删除API
        const response = await request.post("/admin/delete",{"id":row.id});

        // 根据后端返回结果处理
        if (response.code === 200) {
          ElMessage.success(response.message || '删除成功');
          // 刷新管理员列表
          await this.loadAdmin();
        } else {
          ElMessage.error(response.message || '删除失败');
        }
      } catch (error) {
        // 用户取消操作
        console.log('用户取消删除操作');
      }
    }
  },
  mounted() {
    this.loadAdmin();
    this.loadInstituteList();
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