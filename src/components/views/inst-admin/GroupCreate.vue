<template>
  <div class="group-create">
    <el-page-header @back="goBack" title="返回">
      <template #content>
        <span class="page-header-title">创建答辩小组</span>
        <span v-if="selectedYear" style="margin-left: 20px; color: #666;">
          （{{ selectedYear }}年）
        </span>
      </template>
    </el-page-header>

    <el-card class="create-card">
      <el-form :model="groupForm" :rules="rules" label-width="120px">
        <el-form-item label="答辩年份：" prop="year">
          <el-select
            v-model="groupForm.year"
            placeholder="请选择答辩年份"
            style="width: 200px"
            @change="handleYearChange"
          >
            <el-option
              v-for="year in availableYears"
              :key="year.year"
              :label="`${year.year}年`"
              :value="year.year"
            />
          </el-select>
          <el-button
            type="text"
            @click="goToYearManagement"
            style="margin-left: 10px"
          >
            管理答辩年份
          </el-button>
        </el-form-item>

        <!-- 其他表单字段 -->
        <el-form-item label="小组名称：" prop="name">
          <el-input v-model="groupForm.name" placeholder="请输入小组名称" style="width: 300px" />
        </el-form-item>

        <el-form-item label="答辩组长：" prop="admin_id">
          <el-select
            v-model="groupForm.admin_id"
            placeholder="请选择答辩组长"
            filterable
            style="width: 300px"
          >
            <el-option
              v-for="teacher in availableTeachers"
              :key="teacher.id"
              :label="teacher.real_name || teacher.name"
              :value="teacher.id"
            />
          </el-select>
          <div class="form-tip">每个教师只能担任一个答辩小组的组长</div>
        </el-form-item>

        <el-form-item label="初始状态：" prop="status">
          <el-radio-group v-model="groupForm.status">
            <el-radio :label="0">未开始</el-radio>
            <el-radio :label="1">进行中</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="备注：" prop="remark">
          <el-input
            v-model="groupForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
            style="width: 400px"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            创建小组
          </el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ElMessage } from 'element-plus';
import request from '@/api';

export default defineComponent({
  name: 'GroupCreate',
  data() {
    return {
      groupForm: {
        year: null as number | null,
        name: '',
        admin_id: '', // 调整为下划线
        status: 0,
        remark: '',
        institute_id: null as number | null // 调整为下划线
      },
      availableYears: [] as any[],
      availableTeachers: [] as any[],
      submitting: false,
      selectedYear: null as number | null,
      rules: {
        year: [{ required: true, message: '请选择答辩年份', trigger: 'change' }],
        name: [{ required: true, message: '请输入小组名称', trigger: 'blur' }],
        admin_id: [{ required: true, message: '请选择答辩组长', trigger: 'change' }]
      }
    };
  },
  methods: {
    async loadAvailableYears() {
      try {
        const response = await request.get('/defense-year/list', {
          params: { institute_id: this.groupForm.institute_id }
        });
        if (response.code === 200) {
          this.availableYears = response.data.filter((year: any) => year.status !== 2);
        }
      } catch (error) {
        console.error('加载年份失败:', error);
      }
    },

    async handleYearChange(year: number) {
      this.selectedYear = year;
      await this.loadAvailableTeachers(year);
    },

    async loadAvailableTeachers(year: number) {
      try {
        const response = await request.get('/defense-year/available-teachers', {
          params: { year, institute_id: this.groupForm.institute_id }
        });
        if (response.code === 200) {
          this.availableTeachers = response.data;
        }
      } catch (error) {
        console.error('加载教师失败:', error);
      }
    },

    async handleSubmit() {
      this.submitting = true;
      try {
        const response = await request.post('/defense-year/create-group', this.groupForm);
        if (response.code === 200) {
          ElMessage.success('答辩小组创建成功');
          this.goBack();
        } else {
          ElMessage.error(response.message || '创建失败');
        }
      } catch (error) {
        console.error('创建小组失败:', error);
        ElMessage.error('创建失败');
      } finally {
        this.submitting = false;
      }
    },

    goBack() {
      this.$router.back();
    },

    goToYearManagement() {
      this.$router.push('/inst-admin/defense-year');
    }
  },
  mounted() {
    const yearParam = this.$route.query.year;
    if (yearParam) {
      const year = parseInt(yearParam as string);
      this.groupForm.year = year;
      this.selectedYear = year;
    }

    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const info = JSON.parse(userInfo);
        this.groupForm.institute_id = info.institute_id || info.instId || 1;
      } catch (error) {
        console.error('解析用户信息失败:', error);
      }
    }

    this.loadAvailableYears();

    if (this.groupForm.year) {
      this.loadAvailableTeachers(this.groupForm.year);
    }
  }
});
</script>

<style scoped>
.group-create {
  padding: 20px;
}

.create-card {
  margin-top: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.page-header-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}
</style>
