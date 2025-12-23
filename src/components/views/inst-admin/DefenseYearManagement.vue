<template>
  <div class="defense-year-management">
    <div class="page-title">
      <h2>答辩年份管理</h2>
      <p class="subtitle">管理本学院的答辩年份，每个年份可以包含多个答辩小组</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #36a3f7;">
            <i class="el-icon-date"></i>
          </div>
          <div class="stat-content">
            <h3>{{ yearList.length }}</h3>
            <p>答辩年份总数</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #34bfa3;">
            <i class="el-icon-s-operation"></i>
          </div>
          <div class="stat-content">
            <h3>{{ totalGroups }}</h3>
            <p>答辩小组总数</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #ffb822;">
            <i class="el-icon-loading"></i>
          </div>
          <div class="stat-content">
            <h3>{{ inProgressYears }}</h3>
            <p>进行中年份</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #f4516c;">
            <i class="el-icon-finished"></i>
          </div>
          <div class="stat-content">
            <h3>{{ completedYears }}</h3>
            <p>已结束年份</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button type="primary" @click="handleCreateYear">
        <i class="el-icon-plus"></i>新增答辩年份
      </el-button>
      <el-button type="success" @click="handleCreateGroup" :disabled="!selectedYear">
        <i class="el-icon-s-operation"></i>创建答辩小组
      </el-button>
      <el-button @click="refreshList">
        <i class="el-icon-refresh"></i>刷新
      </el-button>
    </div>

    <!-- 年份列表 -->
    <el-card class="year-list-card">
      <el-table
        :data="yearList"
        style="width: 100%"
        v-loading="loading"
        @row-click="handleYearRowClick"
        :row-class-name="getRowClassName"
      >
        <el-table-column type="expand">
          <template #default="scope">
            <div class="year-details">
              <h4>{{ scope.row.year }}年答辩小组详情</h4>
              <el-table :data="scope.row.groups" size="small">
                <el-table-column prop="id" label="小组ID" width="100" />
                <el-table-column prop="admin_name" label="组长" width="120" />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="subScope">
                    <el-tag :type="getGroupStatusType(subScope.row.status)" size="small">
                      {{ getGroupStatusText(subScope.row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="creator_name" label="创建人" width="120" />
                <el-table-column prop="created_at" label="创建时间" width="180" />
                <el-table-column label="操作" width="180">
                  <template #default="subScope">
                    <el-button type="text" size="small" @click.stop="handleEditGroup(subScope.row)">
                      编辑
                    </el-button>
                    <el-button type="text" size="small" @click.stop="handleManageGroup(subScope.row)">
                      管理
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="year" label="答辩年份" width="120" fixed>
          <template #default="scope">
            <div class="year-header">
              <span class="year-badge">{{ scope.row.year }}年</span>
              <i v-if="scope.row.status === 1" class="el-icon-loading" style="color: #409eff; margin-left: 5px;"></i>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="状态统计" width="300">
          <template #default="scope">
            <div class="status-stats">
              <el-tag type="info" size="small">{{ scope.row.not_started_groups || 0 }}个未开始</el-tag>
              <el-tag type="primary" size="small">{{ scope.row.in_progress_groups || 0 }}个进行中</el-tag>
              <el-tag type="success" size="small">{{ scope.row.completed_groups || 0 }}个已结束</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="total_groups" label="小组总数" width="100" />

        <el-table-column prop="first_created" label="首次创建" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.first_created) }}
          </template>
        </el-table-column>

        <el-table-column prop="last_updated" label="最后更新" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.last_updated) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button-group>
              <el-button
                  type="primary"
                  size="small"
                  @click.stop="handleEditYear(scope.row)"
              >
                管理
              </el-button>

              <el-button
                  type="success"
                  size="small"
                  @click.stop="handleCreateGroupInYear(scope.row)"
              >
                新增小组
              </el-button>

              <el-button
                  type="danger"
                  size="small"
                  @click.stop="handleDeleteYear(scope.row)"
                  :disabled="scope.row.total_groups > 0"
              >
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增年份对话框 -->
    <el-dialog
        title="新增答辩年份"
        v-model="yearDialogVisible"
        width="500px"
    >
      <el-form
          ref="yearFormRef"
          :model="yearForm"
          :rules="yearRules"
          label-width="100px"
      >
        <el-form-item label="答辩年份：" prop="year">
          <el-input-number
              v-model="yearForm.year"
              :min="2020"
              :max="2030"
              :step="1"
              controls-position="right"
              placeholder="请输入答辩年份"
              style="width: 100%"
          />
          <div class="form-tip">请输入4位数字年份，如：2025</div>
        </el-form-item>

        <el-form-item label="初始状态：" prop="status">
          <el-radio-group v-model="yearForm.status">
            <el-radio :label="0">未开始</el-radio>
            <el-radio :label="1">进行中</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="创建小组：" prop="create_group">
          <el-switch v-model="yearForm.create_group" />
          <div class="form-tip">是否同时创建一个默认的答辩小组</div>
        </el-form-item>

        <el-form-item v-if="yearForm.create_group" label="小组名称：" prop="group_name">
          <el-input v-model="yearForm.group_name" placeholder="请输入小组名称" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="yearDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitYear" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 年份管理对话框 -->
    <el-dialog
        :title="`${selectedYear?.year}年答辩管理`"
        v-model="manageDialogVisible"
        width="800px"
    >
      <div v-if="selectedYear">
        <!-- 年份状态管理 -->
        <div class="year-manage-section">
          <h4>年份状态管理</h4>
          <div class="status-control">
            <el-radio-group v-model="selectedYear.status">
              <el-radio-button :label="0">未开始</el-radio-button>
              <el-radio-button :label="1">进行中</el-radio-button>
              <el-radio-button :label="2">已结束</el-radio-button>
            </el-radio-group>
            <el-button type="primary" @click="handleUpdateYearStatus" :loading="updating">
              更新状态
            </el-button>
          </div>
          <div class="status-tips">
            <p><i class="el-icon-info"></i> 更新状态将影响该年份下所有答辩小组</p>
          </div>
        </div>

        <!-- 小组列表管理 -->
        <div class="group-manage-section">
          <h4>答辩小组管理</h4>
          <el-table :data="selectedYear.groups" size="small">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="admin_name" label="组长" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getGroupStatusType(scope.row.status)" size="small">
                  {{ getGroupStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="creator_name" label="创建人" width="120" />
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button type="text" size="small" @click="handleEditGroupStatus(scope.row)">
                  修改状态
                </el-button>
                <el-button type="text" size="small" @click="handleDeleteGroup(scope.row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="manageDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '@/api';

export default defineComponent({
  name: 'DefenseYearManagement',
  data() {
    return {
      loading: false,
      yearList: [] as any[],
      selectedYear: null as any,

      yearDialogVisible: false,
      manageDialogVisible: false,
      submitting: false,
      updating: false,

      yearForm: {
        year: new Date().getFullYear(),
        status: 0,
        create_group: true,
        group_name: '',
        institute_id: null as number | null
      },

      yearRules: {
        year: [
          { required: true, message: '请选择答辩年份', trigger: 'blur' },
          { pattern: /^\d{4}$/, message: '年份必须为4位数字', trigger: 'blur' }
        ],
        group_name: [
          { required: true, message: '请输入小组名称', trigger: 'blur' }
        ]
      },

      instituteId: 1
    };
  },

  computed: {
    totalGroups(): number {
      return this.yearList.reduce((sum, year) => sum + (year.total_groups || 0), 0);
    },
    inProgressYears(): number {
      return this.yearList.filter(year => year.status === 1).length;
    },
    completedYears(): number {
      return this.yearList.filter(year => year.status === 2).length;
    }
  },

  methods: {
    // 加载年份列表
    async loadYearList() {
      this.loading = true;
      try {
        const response = await request.get('/api/defense-year/list', {
          params: { institute_id: this.instituteId }
        });

        if (response.code === 200) {
          this.yearList = response.data;
        } else {
          ElMessage.error(response.message || '加载失败');
        }
      } catch (error) {
        console.error('加载答辩年份失败:', error);
        ElMessage.error('加载失败');
      } finally {
        this.loading = false;
      }
    },

    // 新增答辩年份
    handleCreateYear() {
      this.yearForm = {
        year: new Date().getFullYear(),
        status: 0,
        create_group: true,
        group_name: `${new Date().getFullYear()}年答辩小组`,
        institute_id: this.instituteId
      };
      this.yearDialogVisible = true;
    },

    // 提交新增年份
    async handleSubmitYear() {
      const formRef = this.$refs.yearFormRef as any;
      if (!formRef) return;

      await formRef.validate(async (valid: boolean) => {
        if (!valid) return;

        this.submitting = true;
        try {
          const response = await request.post('/api/defense-year/create', this.yearForm);

          if (response.code === 200) {
            ElMessage.success('答辩年份创建成功');
            this.yearDialogVisible = false;
            this.loadYearList();
          } else {
            ElMessage.error(response.message || '创建失败');
          }
        } catch (error) {
          console.error('创建答辩年份失败:', error);
          ElMessage.error('创建失败');
        } finally {
          this.submitting = false;
        }
      });
    },

    // 年份行点击
    handleYearRowClick(row: any) {
      this.selectedYear = row;
    },

    // 年份行样式
    getRowClassName({ row }: any) {
      if (row.status === 1) {
        return 'year-in-progress';
      } else if (row.status === 2) {
        return 'year-completed';
      }
      return '';
    },

    // 管理年份
    handleEditYear(year: any) {
      this.selectedYear = year;
      this.manageDialogVisible = true;
    },

    // 更新年份状态
    async handleUpdateYearStatus() {
      if (!this.selectedYear) return;

      this.updating = true;
      try {
        const response = await request.post('/api/defense-year/update-status', null, {
          params: {
            year: this.selectedYear.year,
            institute_id: this.selectedYear.institute_id,
            status: this.selectedYear.status
          }
        });

        if (response.code === 200) {
          ElMessage.success('状态更新成功');
          this.loadYearList();
        } else {
          ElMessage.error(response.message || '更新失败');
        }
      } catch (error) {
        console.error('更新状态失败:', error);
        ElMessage.error('更新失败');
      } finally {
        this.updating = false;
      }
    },

    // 在年份下创建小组
    handleCreateGroupInYear(year: any) {
      this.$router.push({
        path: '/inst-admin/group-create',
        query: { year: year.year }
      });
    },

    // 删除年份
    async handleDeleteYear(year: any) {
      if (year.total_groups > 0) {
        ElMessage.warning('该年份下已有答辩小组，请先删除所有小组');
        return;
      }

      try {
        await ElMessageBox.confirm(
          `确定要删除 ${year.year} 年的答辩年份吗？`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );

        const response = await request.delete(`/api/defense-year/delete/${year.year}`, {
          params: { institute_id: year.institute_id }
        });

        if (response.code === 200) {
          ElMessage.success('删除成功');
          this.loadYearList();
        } else {
          ElMessage.error(response.message || '删除失败');
        }
      } catch (error: any) {
        if (error !== 'cancel') {
          ElMessage.error(error.message || '删除失败');
        }
      }
    },

    // 获取小组状态类型
    getGroupStatusType(status: number): string {
      const types: Record<number, string> = {
        0: 'info',
        1: 'primary',
        2: 'success'
      };
      return types[status] || 'info';
    },

    // 获取小组状态文本
    getGroupStatusText(status: number): string {
      const texts: Record<number, string> = {
        0: '未开始',
        1: '进行中',
        2: '已结束'
      };
      return texts[status] || '未知';
    },

    // 格式化日期
    formatDate(dateStr: string): string {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    // 刷新列表
    refreshList() {
      this.loadYearList();
    },

    // 创建答辩小组
    handleCreateGroup() {
      this.$router.push('/inst-admin/group-create');
    },

    // 编辑小组
    handleEditGroup(group: any) {
      this.$router.push({
        path: '/inst-admin/group-edit',
        query: { id: group.id }
      });
    },

    // 管理小组
    handleManageGroup(group: any) {
      this.$router.push({
        path: '/inst-admin/group-manage',
        query: { id: group.id }
      });
    },

    // 编辑小组状态
    handleEditGroupStatus(group: any) {
      console.log('编辑小组状态:', group);
    },

    // 删除小组
    handleDeleteGroup(group: any) {
      console.log('删除小组:', group);
    }
  },

  mounted() {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const info = JSON.parse(userInfo);
        this.instituteId = info.institute_id || info.instId || 1;
      } catch (error) {
        console.error('解析用户信息失败:', error);
      }
    }

    this.loadYearList();
  }
});
</script>

<style scoped>
.defense-year-management {
  height: 100%;
}

.page-title h2 {
  color: #333;
  margin-bottom: 10px;
  font-size: 24px;
}

.subtitle {
  color: #666;
  margin-bottom: 30px;
}

.stats-row {
  margin-bottom: 30px;
}

.stat-card {
  text-align: center;
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  transition: transform 0.3s;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  color: white;
  font-size: 24px;
}

.stat-content h3 {
  font-size: 28px;
  margin: 0 0 5px 0;
  color: #333;
}

.stat-content p {
  color: #666;
  margin: 0;
}

.action-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.year-list-card {
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.year-header {
  display: flex;
  align-items: center;
}

.year-badge {
  display: inline-block;
  padding: 4px 12px;
  background: #f0f9ff;
  border: 1px solid #409eff;
  border-radius: 4px;
  color: #409eff;
  font-weight: bold;
  font-size: 16px;
}

.status-stats {
  display: flex;
  gap: 10px;
}

.year-details {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 4px;
  margin: 10px 0;
}

.year-details h4 {
  margin-bottom: 15px;
  color: #333;
}

.year-manage-section,
.group-manage-section {
  margin-bottom: 30px;
}

.year-manage-section h4,
.group-manage-section h4 {
  margin-bottom: 15px;
  color: #333;
  border-left: 4px solid #409eff;
  padding-left: 10px;
}

.status-control {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 15px;
}

.status-tips {
  padding: 10px;
  background: #f0f9ff;
  border-radius: 4px;
  color: #666;
  font-size: 13px;
}

.status-tips i {
  margin-right: 5px;
  color: #409eff;
}

/* 行样式 */
:deep(.year-in-progress) {
  background-color: #f0f9ff !important;
}

:deep(.year-completed) {
  background-color: #f0f9ff !important;
  opacity: 0.8;
}

:deep(.el-table__expand-icon) {
  font-size: 16px;
}

:deep(.el-table__expanded-cell) {
  background-color: #f8f9fa;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}
</style>