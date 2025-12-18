<template>
  <div class="admin-add">
    <el-card class="form-card">
      <template #header>
        <span><i class="el-icon-user"></i> 创建院系管理员</span>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="140px">
        <!-- 基本信息 -->
        <el-divider content-position="left">基本信息</el-divider>
        <el-form-item label="管理员姓名" prop="adminName" required>
          <el-input
            v-model="form.adminName"
            placeholder="请输入管理员真实姓名"
            style="width: 300px;"
          />
        </el-form-item>

        <el-form-item label="所属院系" prop="institute" required>
          <el-select
            v-model="form.institute"
            placeholder="请选择所属院系"
            style="width: 300px;"
            @change="handleInstituteChange"
          >
            <el-option
              v-for="institute in instituteOptions"
              :key="institute.id"
              :label="institute.name"
              :value="institute.name"
            />
          </el-select>
          <el-button
            type="text"
            @click="showInstituteDialog = true"
            style="margin-left: 10px;"
          >
            <i class="el-icon-plus"></i> 添加院系
          </el-button>
        </el-form-item>

        <!-- 登录信息 -->
        <el-divider content-position="left">登录信息</el-divider>
        <el-form-item label="登录用户名" prop="username" required>
          <el-input
            v-model="form.username"
            placeholder="请输入登录用户名"
            style="width: 300px;"
          />
          <div class="form-tip">建议使用英文用户名，3-20个字符</div>
        </el-form-item>

        <el-form-item label="登录密码" prop="password" required>
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入登录密码"
            style="width: 300px;"
            show-password
          />
          <div class="form-tip">密码长度6-20个字符</div>
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword" required>
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            style="width: 300px;"
            show-password
          />
        </el-form-item>

        <!-- 联系方式 -->
        <el-divider content-position="left">联系方式</el-divider>
        <el-form-item label="手机号码" prop="phone">
          <el-input
            v-model="form.phone"
            placeholder="请输入手机号码"
            style="width: 300px;"
          />
        </el-form-item>

        <el-form-item label="电子邮箱" prop="email">
          <el-input
            v-model="form.email"
            placeholder="请输入邮箱地址"
            style="width: 300px;"
          />
        </el-form-item>

        <el-form-item label="办公电话">
          <el-input
            v-model="form.officePhone"
            placeholder="请输入办公电话"
            style="width: 300px;"
          />
        </el-form-item>

        <el-form-item label="办公地址">
          <el-input
            v-model="form.officeAddress"
            placeholder="请输入办公地址"
            style="width: 300px;"
          />
        </el-form-item>

        <!-- 权限设置 -->
        <el-divider content-position="left">权限设置</el-divider>
        <el-form-item label="管理员权限">
          <el-checkbox-group v-model="form.permissions">
            <el-checkbox label="teacher_manage" name="type">教师管理</el-checkbox>
            <el-checkbox label="defense_manage" name="type">答辩管理</el-checkbox>
            <el-checkbox label="student_manage" name="type">学生管理</el-checkbox>
            <el-checkbox label="score_manage" name="type">成绩管理</el-checkbox>
            <el-checkbox label="template_manage" name="type">模板管理</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="loading">
            <i class="el-icon-check"></i> 创建管理员
          </el-button>
          <el-button @click="resetForm">
            <i class="el-icon-refresh"></i> 重置
          </el-button>
          <el-button @click="generateAccountInfo">
            <i class="el-icon-document"></i> 生成账号信息
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 账号信息预览 -->
    <el-card class="preview-card" v-if="showPreview">
      <template #header>
        <span><i class="el-icon-info"></i> 账号信息预览</span>
      </template>
      <div class="preview-content">
        <p><strong>管理员姓名：</strong>{{ form.adminName }}</p>
        <p><strong>所属院系：</strong>{{ form.institute }}</p>
        <p><strong>登录用户名：</strong>{{ form.username }}</p>
        <p><strong>登录密码：</strong>{{ form.password }}</p>
        <p><strong>联系电话：</strong>{{ form.phone || '未填写' }}</p>
        <p><strong>邮箱地址：</strong>{{ form.email || '未填写' }}</p>
        <p><strong>创建时间：</strong>{{ previewInfo.createTime }}</p>
        <p><strong>账号状态：</strong><el-tag type="success" size="small">正常</el-tag></p>
      </div>
      <div class="preview-tips">
        <p>✅ 请将此信息告知管理员</p>
        <p>✅ 建议首次登录后修改密码</p>
        <p>✅ 管理员可在院系管理页面重置密码</p>
      </div>
    </el-card>

    <!-- 添加院系对话框 -->
    <el-dialog v-model="showInstituteDialog" title="添加新院系" width="500px">
      <el-form :model="instituteForm" label-width="100px">
        <el-form-item label="院系名称" required>
          <el-input v-model="instituteForm.name" placeholder="请输入院系名称" />
        </el-form-item>
        <el-form-item label="院系代码" required>
          <el-input v-model="instituteForm.code" placeholder="请输入院系代码" />
        </el-form-item>
        <el-form-item label="院系简介">
          <el-input v-model="instituteForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showInstituteDialog = false">取消</el-button>
        <el-button type="primary" @click="addInstitute">添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue';
import { ElMessage, FormInstance } from 'element-plus';
import { instituteApi, userApi } from '@/api';

export default defineComponent({
  name: 'AdminAdd',
  setup() {
    const formRef = ref<FormInstance>();
    const loading = ref(false);
    const showPreview = ref(false);
    const showInstituteDialog = ref(false);

    const form = reactive({
      adminName: '',
      institute: '',
      username: '',
      password: '',
      confirmPassword: '',
      phone: '',
      email: '',
      officePhone: '',
      officeAddress: '',
      permissions: ['teacher_manage', 'defense_manage', 'student_manage']
    });

    const instituteForm = reactive({
      name: '',
      code: '',
      description: ''
    });

    const previewInfo = reactive({
      createTime: new Date().toLocaleString()
    });

    const instituteOptions = ref([
      { id: 1, name: '计算机学院', code: 'CS' },
      { id: 2, name: '数学学院', code: 'MATH' },
      { id: 3, name: '物理学院', code: 'PHY' },
      { id: 4, name: '化学学院', code: 'CHEM' },
      { id: 5, name: '机械工程学院', code: 'ME' },
      { id: 6, name: '电子信息学院', code: 'EE' },
      { id: 7, name: '经济管理学院', code: 'ECON' },
      { id: 8, name: '外国语学院', code: 'FL' }
    ]);

    const validatePassword = (rule: any, value: string, callback: any) => {
      if (value !== form.password) {
        callback(new Error('两次输入密码不一致'));
      } else {
        callback();
      }
    };

    const validateUsername = (rule: any, value: string, callback: any) => {
      if (!/^[a-zA-Z][a-zA-Z0-9_]{2,19}$/.test(value)) {
        callback(new Error('用户名必须以字母开头，3-20位字母数字下划线'));
      } else {
        callback();
      }
    };

    const rules = {
      adminName: [
        { required: true, message: '请输入管理员姓名', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
      ],
      institute: [
        { required: true, message: '请选择所属院系', trigger: 'change' }
      ],
      username: [
        { required: true, message: '请输入登录用户名', trigger: 'blur' },
        { validator: validateUsername, trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        { validator: validatePassword, trigger: 'blur' }
      ],
      phone: [
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
      ],
      email: [
        { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
      ]
    };

    const handleInstituteChange = (value: string) => {
      // 自动生成用户名建议
      if (!form.username && value) {
        const instituteCode = instituteOptions.value.find(inst => inst.name === value)?.code || '';
        form.username = instituteCode.toLowerCase() + '_admin';
      }
    };

    const addInstitute = () => {
      if (!instituteForm.name || !instituteForm.code) {
        ElMessage.warning('请填写院系名称和代码');
        return;
      }

      const newInstitute = {
        id: instituteOptions.value.length + 1,
        name: instituteForm.name,
        code: instituteForm.code
      };

      instituteOptions.value.push(newInstitute);
      form.institute = newInstitute.name;

      showInstituteDialog.value = false;
      instituteForm.name = '';
      instituteForm.code = '';
      instituteForm.description = '';

      ElMessage.success('院系添加成功');
    };

    const submitForm = async () => {
      if (!formRef.value) return;

      const valid = await formRef.value.validate();
      if (!valid) return;

      loading.value = true;
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1500));

        ElMessage.success({
          message: '院系管理员创建成功',
          duration: 3000
        });

        showPreview.value = true;
        previewInfo.createTime = new Date().toLocaleString();

      } catch (error) {
        console.error('创建失败:', error);
        ElMessage.error('创建失败，请重试');
      } finally {
        loading.value = false;
      }
    };

    const resetForm = () => {
      if (!formRef.value) return;
      formRef.value.resetFields();
      showPreview.value = false;

      // 重置为默认值
      form.permissions = ['teacher_manage', 'defense_manage', 'student_manage'];
      form.officePhone = '';
      form.officeAddress = '';
    };

    const generateAccountInfo = () => {
      if (!form.adminName || !form.institute || !form.username || !form.password) {
        ElMessage.warning('请先填写基本信息');
        return;
      }

      showPreview.value = true;
      previewInfo.createTime = new Date().toLocaleString();
    };

    return {
      formRef,
      form,
      instituteForm,
      previewInfo,
      instituteOptions,
      rules,
      loading,
      showPreview,
      showInstituteDialog,
      handleInstituteChange,
      addInstitute,
      submitForm,
      resetForm,
      generateAccountInfo
    };
  }
});
</script>

<style scoped>
.admin-add {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  padding: 20px;
}

.form-card {
  border-radius: 8px;
}

.preview-card {
  border-radius: 8px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
}

.preview-content p {
  margin-bottom: 10px;
  color: #495057;
  font-size: 14px;
  line-height: 1.8;
}

.preview-content strong {
  color: #212529;
  min-width: 100px;
  display: inline-block;
}

.preview-tips {
  margin-top: 20px;
  padding: 15px;
  background: #e3f2fd;
  border-radius: 4px;
  border-left: 4px solid #2196f3;
}

.preview-tips p {
  margin: 5px 0;
  color: #1976d2;
  font-size: 13px;
}

.form-tip {
  font-size: 12px;
  color: #6c757d;
  margin-top: 5px;
}

.el-divider {
  margin: 25px 0;
}
</style>