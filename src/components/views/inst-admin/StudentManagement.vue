<template>
    <div class="student-management">
        <el-card class="main-card">
            <template #header>
                <div class="card-header">
                    <span><i class="el-icon-user-solid"></i> 学生管理</span>
                    <div class="header-actions">
                        <el-input
                            v-model="searchKeyword"
                            placeholder="搜索学生姓名/学号"
                            style="width: 200px; margin-right: 10px;"
                            @input="handleSearch"
                        >
                            <template #prefix>
                                <i class="el-icon-search"></i>
                            </template>
                        </el-input>
                        <el-button type="success" @click="handleDownloadTemplate" :loading="templateDownloading">
                            <el-icon><Download /></el-icon> 下载Excel模板
                        </el-button>
                        <el-button type="warning" @click="importDialogVisible = true">
                            <el-icon><Upload /></el-icon> 批量导入
                        </el-button>
                        <el-button type="primary" @click="handleAdd">
                            <i class="el-icon-plus"></i> 添加学生
                        </el-button>
                    </div>
                </div>
            </template>

            <el-table :data="studentList" style="width: 100%" v-loading="loading">
                <el-table-column prop="studentId" label="学号" width="100" />
                <el-table-column prop="name" label="姓名" width="90" />
                <el-table-column prop="phone" label="联系电话" width="120" />
                <el-table-column label="答辩小组" width="150">
                    <template #default="scope">
                        <el-tag v-if="scope.row.dbgroup" size="small">
                            {{ scope.row.dbgroup }}
                        </el-tag>
                        <span v-else style="color: #999;">未分配</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180" fixed="right">
                    <template #default="scope">
                        <el-button type="text" size="small" @click="handleEdit(scope.row)">编辑</el-button>

                        <el-button
                            type="text"
                            size="small"
                            @click="handleDelete(scope.row)"
                            style="color: #f56c6c;"
                        >
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination">
                <el-pagination
                    v-model:current-page="currentPage"
                    v-model:page-size="pageSize"
                    :total="total"
                    :page-sizes="[10, 20, 50, 100]"
                    layout="total, sizes, prev, pager, next, jumper"
                    @size-change="handleSizeChange"
                    @current-change="handlePageChange"
                />
            </div>
        </el-card>

        <!-- 学生编辑对话框 -->
        <el-dialog
            v-model="editDialogVisible"
            :title="isEditMode ? '编辑学生' : '添加学生'"
            width="500px"
        >
            <!-- 模板中使用前端字段名：student_id, name, phone, email -->
            <el-form ref="studentFormRef" :model="studentForm" :rules="studentRules" label-width="100px">
                <el-form-item label="学号" prop="student_id" required>
                    <el-input
                        v-model="studentForm.student_id"
                        placeholder="请输入学号"
                        :disabled="isEditMode"
                    />
                </el-form-item>
                <el-form-item label="姓名" prop="name" required>
                    <el-input v-model="studentForm.name" placeholder="请输入姓名" />
                </el-form-item>
                <el-form-item label="联系电话" prop="phone">
                    <el-input v-model="studentForm.phone" placeholder="请输入联系电话" />
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="studentForm.email" placeholder="请输入邮箱" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="editDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSubmit">保存</el-button>
            </template>
        </el-dialog>

        <!-- 批量导入对话框 -->
        <el-dialog
            v-model="importDialogVisible"
            title="批量导入学生"
            width="600px"
            :close-on-click-modal="false"
            @closed="handleImportDialogClosed"
        >
            <div class="import-dialog-content">
                <!-- 步骤提示 -->
                <div class="import-tips">
                    <el-alert
                        title="导入说明"
                        type="info"
                        :closable="false"
                        show-icon
                    >
                        <template #default>
                            <div>
                                <p>1. 请先点击"下载Excel模板"获取模板文件</p>
                                <p>2. 按照模板格式填写学生信息（学号、姓名、联系电话、邮箱）</p>
                                <p>3. 选择填好的Excel文件进行上传</p>
                            </div>
                        </template>
                    </el-alert>
                </div>

                <!-- 文件上传区域 -->
                <el-upload
                    ref="uploadRef"
                    class="import-upload"
                    drag
                    action=""
                    :auto-upload="false"
                    :limit="1"
                    accept=".xlsx,.xls"
                    :on-change="handleFileChange"
                    :on-exceed="handleExceed"
                    :on-remove="handleRemoveFile"
                    :file-list="importFileList"
                >
                    <el-icon class="el-icon--upload"><Upload /></el-icon>
                    <div class="el-upload__text">
                        将Excel文件拖到此处，或<em>点击上传</em>
                    </div>
                    <template #tip>
                        <div class="el-upload__tip">
                            仅支持 .xlsx / .xls 格式文件
                        </div>
                    </template>
                </el-upload>

                <!-- 导入结果展示 -->
                <div v-if="importResult" class="import-result">
                    <el-divider />
                    <el-alert
                        v-if="importResult.successCount > 0 && importResult.failureCount === 0"
                        :title="`导入成功！共成功导入 ${importResult.successCount} 条学生记录`"
                        type="success"
                        show-icon
                        :closable="false"
                    />
                    <el-alert
                        v-else-if="importResult.successCount > 0 && importResult.failureCount > 0"
                        :title="`导入完成！成功 ${importResult.successCount} 条，失败 ${importResult.failureCount} 条，共 ${importResult.totalCount} 条`"
                        type="warning"
                        show-icon
                        :closable="false"
                    />
                    <el-alert
                        v-else
                        :title="`导入失败！共 ${importResult.failureCount} 条记录导入失败，请查看下方明细`"
                        type="error"
                        show-icon
                        :closable="false"
                    />

                    <!-- 失败明细表格 -->
                    <div v-if="importResult.errorRows && importResult.errorRows.length > 0" class="failure-details">
                        <h4>失败明细：</h4>
                        <el-table :data="importResult.errorRows" max-height="250" border size="small">
                            <el-table-column prop="rowNum" label="行号" width="70" align="center" />
                            <el-table-column prop="reason" label="失败原因" />
                        </el-table>
                    </div>
                </div>
            </div>

            <template #footer>
                <el-button @click="importDialogVisible = false">关闭</el-button>
                <el-button
                    type="primary"
                    :loading="importUploading"
                    :disabled="!importFile"
                    @click="handleImportSubmit"
                >
                    {{ importUploading ? '导入中...' : '开始导入' }}
                </el-button>
            </template>
        </el-dialog>

    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Upload, Download } from '@element-plus/icons-vue';
import type { UploadFile, UploadInstance, UploadRawFile, UploadUserFile } from 'element-plus';
import request from '@/api';

// 导入结果类型
interface ImportResult {
  successCount: number;
  failureCount: number;
  totalCount: number;
  errorRows: Array<{
    rowNum: number;
    reason: string;
  }>;
}

export default defineComponent({
    name: 'StudentManagement',
    components: {
      Upload,
      Download
    },
  setup: function () {
    // Refs 声明
    const studentFormRef = ref();
    const uploadRef = ref<UploadInstance>();
    const loading = ref(false);
    const editDialogVisible = ref(false);
    const assignDialogVisible = ref(false);
    const isEditMode = ref(false);
    const importDialogVisible = ref(false);
    const importUploading = ref(false);
    const templateDownloading = ref(false);

    const searchKeyword = ref('');
    const studentList = ref([] as any[]);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const total = ref(0);

    const instituteId = ref(1);

    // 批量导入相关
    const importFile = ref<UploadRawFile | null>(null);
    const importFileList = ref<UploadUserFile[]>([]);
    const importResult = ref<ImportResult | null>(null);

    // 表单相关 - 使用前端字段名
    const studentForm = ref({
      student_id: '',          // 前端字段名：学号
      name: '',                // 前端字段名：姓名
      phone: '',               // 前端字段名：电话
      email: '',               // 前端字段名：邮箱
      institute_id: instituteId.value  // 前端字段名：学院ID
    });

    // 表单验证规则 - 使用前端字段名
    const studentRules = {
      student_id: [
        {required: true, message: '请输入学号', trigger: 'blur'},
        {pattern: /^\d{7,12}$/, message: '学号为7-12位数字', trigger: 'blur'}
      ],
      name: [
        {required: true, message: '请输入姓名', trigger: 'blur'},
        {min: 2, max: 20, message: '长度在2到20个字符', trigger: 'blur'}
      ],
      email: [
        {type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur'}
      ],
      phone: [
        {pattern: /^1[3-9]\d{9}$|^$/, message: '请输入正确的手机号码或留空', trigger: 'blur'}
      ]
    };

    // 分配小组相关
    const selectedStudent = ref({} as any);
    const selectedYear = ref(null as number | null);
    const selectedGroupId = ref(null as number | null);
    const yearOptions = ref([] as any[]);
    const groupOptions = ref([] as any[]);

    // 加载学生列表
    const loadStudents = async () => {
      loading.value = true;
      try {
        const response = await request.get('/students/list', {
          params:{
            institute_id: instituteId.value,
            currentpage: currentPage.value,
            pagesize: pageSize.value
          }
        });
        if (response.code === 200) {
          studentList.value = response.data || [];
          request.get("/students/count",{
            params:{
              institute_id: instituteId.value
            }
          }).then(res=>{
            total.value = res.data;
          });
        }
      } catch (error) {
        console.error('加载学生失败:', error);
        ElMessage.error('加载失败');
      } finally {
        loading.value = false;
      }
    };

    // 搜索
    const handleSearch = () => {
      currentPage.value = 1;
      loadStudents();
    };

    // 添加学生
    const handleAdd = () => {
      isEditMode.value = false;
      studentForm.value = {
        student_id: '',
        name: '',
        phone: '',
        email: '',
        institute_id: instituteId.value
      };
      editDialogVisible.value = true;
    };

    // 编辑学生
    const handleEdit = (row: any) => {
      isEditMode.value = true;
      // 将后端字段名转换为前端字段名
      studentForm.value = {
        student_id: row.id || row.studentId,    // 学号转换
        name: row.name || row.realName,         // 姓名转换
        phone: row.tel || row.phone,            // 电话转换
        email: row.email,
        institute_id: instituteId.value
      };
      editDialogVisible.value = true;
    };

    // 保存学生 - 提交时转换字段名
    const handleSubmit = async () => {
      if (!studentFormRef.value) return;

      const valid = await studentFormRef.value.validate();
      if (!valid) return;

      try {
        const url = isEditMode.value ? '/students/update' : '/students/create';

        // 转换字段名：前端字段名 -> 后端字段名
        const requestData = {
          id: studentForm.value.student_id,          // 转换为后端 id
          realName: studentForm.value.name,          // 转换为后端 realName
          tel: studentForm.value.phone,              // 转换为后端 tel
          email: studentForm.value.email,
          instituteId: studentForm.value.institute_id // 转换为后端 instituteId
        };

        console.log('提交的数据:', requestData); // 调试用

        const response = await request.post(url, requestData);

        if (response.code === 200) {
          ElMessage.success(isEditMode.value ? '更新成功' : '创建成功');
          editDialogVisible.value = false;
          loadStudents();
        } else {
          ElMessage.error(response.message || '操作失败');
        }
      } catch (error: any) {
        console.error('保存学生失败:', error);
        ElMessage.error(error.response?.data?.message || '操作失败');
      }
    };

    const loadYearOptions = async () => {
      try {
        const response = await request.get('/defense/allyear');
        if (response.code === 200) {
          yearOptions.value = response.data;
        }
      } catch (error) {
        console.error('加载年份失败:', error);
      }
    };

    const handleYearChange = async (year: number) => {
      try {
        const response = await request.get('/groups/all', {
          params: {year, institute_id: instituteId.value}
        });
        if (response.code === 200) {
          groupOptions.value = response.data;
        }
      } catch (error) {
        console.error('加载小组失败:', error);
      }
    };

    const handleAssignSubmit = async () => {
      if (!selectedGroupId.value) {
        ElMessage.warning('请选择小组');
        return;
      }
      await request.post('/students/assign-group', {
        student_id: selectedStudent.value.id,
        group_id: selectedGroupId.value
      }).then(res=>{
        ElMessage.success('分配成功');
        loadStudents();
      }).catch(err=>{
        ElMessage.error(err.message);
      });
    };

    // 删除学生
    const handleDelete = (row: any) => {
      ElMessageBox.confirm(
          `确定要删除学生 "${row.realName || row.name}"（${row.id}）吗？`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
      ).then(async () => {
        try {
          const response = await request.delete(`/students/delete/${row.id}`);
          if (response.code === 200) {
            ElMessage.success('删除成功');
            loadStudents();
          }
        } catch (error) {
          console.error('删除失败:', error);
          ElMessage.error('删除失败');
        }
      }).catch(() => {
      });
    };

    // 分页
    const handleSizeChange = (size: number) => {
      pageSize.value = size;
      loadStudents();
    };

    const handlePageChange = (page: number) => {
      currentPage.value = page;
      loadStudents();
    };

    // 下载Excel模板
    const handleDownloadTemplate = async () => {
      templateDownloading.value = true;
      try {
        const response = await request.get('/students/import/template', {
          responseType: 'blob'
        });
        // response 此时为 Blob 数据（被拦截器处理后可能直接是 data）
        const blob = new Blob([response as any], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = '学生导入模板.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        ElMessage.success('模板下载成功');
      } catch (error: any) {
        console.error('下载模板失败:', error);
        // 如果返回的是错误JSON（blob），尝试解析
        if (error?.response?.data instanceof Blob) {
          try {
            const text = await error.response.data.text();
            const json = JSON.parse(text);
            ElMessage.error(json?.message || '下载模板失败');
          } catch {
            ElMessage.error('下载模板失败');
          }
        } else {
          ElMessage.error('下载模板失败');
        }
      } finally {
        templateDownloading.value = false;
      }
    };

    // 文件选择变化
    const handleFileChange = (file: UploadFile) => {
      importFile.value = file.raw || null;
      importResult.value = null; // 重新选择文件时清除之前的结果
    };

    // 超出文件数量限制
    const handleExceed = () => {
      ElMessage.warning('只能上传一个文件，请先移除已有文件');
    };

    // 移除文件
    const handleRemoveFile = () => {
      importFile.value = null;
      importResult.value = null;
    };

    // 提交批量导入
    const handleImportSubmit = async () => {
      if (!importFile.value) {
        ElMessage.warning('请先选择Excel文件');
        return;
      }

      importUploading.value = true;
      importResult.value = null;

      try {
        const formData = new FormData();
        formData.append('file', importFile.value);
        formData.append('institute_id', String(instituteId.value));

        const response = await request.post('/students/import/excel', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 60000 // 导入可能耗时较长
        }) as any;

        if (response.code === 200) {
          const data = response.data;
          // 兼容后端返回的字段格式
          if (typeof data === 'object' && data !== null) {
            importResult.value = {
              successCount: data.successCount ?? 0,
              failureCount: data.failureCount ?? data.failCount ?? 0,
              totalCount: data.totalCount ?? 0,
              errorRows: data.errorRows ?? data.failures ?? []
            };
          } else {
            // data 为基础类型（数字），视为成功数量
            const num = typeof data === 'number' ? data : Number(data) || 0;
            importResult.value = {
              successCount: num,
              failureCount: 0,
              totalCount: num,
              errorRows: []
            };
          }
          if (importResult.value.successCount > 0) {
            loadStudents(); // 有成功记录时刷新列表
          }
        } else {
          ElMessage.error(response.message || '导入失败');
        }
      } catch (error: any) {
        console.error('批量导入失败:', error);
        ElMessage.error(error?.response?.data?.message || '批量导入失败，请检查文件格式');
      } finally {
        importUploading.value = false;
      }
    };

    // 导入对话框关闭时重置状态
    const handleImportDialogClosed = () => {
      importFile.value = null;
      importFileList.value = [];
      importResult.value = null;
      importUploading.value = false;
      uploadRef.value?.clearFiles();
    };

    // 初始化
    const init = () => {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        try {
          const info = JSON.parse(userInfo);
          instituteId.value = info.InstId;
        } catch (error) {
          console.error('解析用户信息失败:', error);
        }
      }

      loadStudents();
      loadYearOptions();
    };

    return {
      studentFormRef,
      uploadRef,
      loading,
      editDialogVisible,
      assignDialogVisible,
      isEditMode,
      importDialogVisible,
      importUploading,
      templateDownloading,
      searchKeyword,
      studentList,
      currentPage,
      pageSize,
      total,
      studentForm,
      studentRules,
      selectedStudent,
      selectedYear,
      selectedGroupId,
      yearOptions,
      groupOptions,
      importFile,
      importFileList,
      importResult,

      loadStudents,
      handleSearch,
      handleAdd,
      handleEdit,
      handleSubmit,
      handleYearChange,
      handleAssignSubmit,
      handleDelete,
      handleSizeChange,
      handlePageChange,
      handleDownloadTemplate,
      handleFileChange,
      handleExceed,
      handleRemoveFile,
      handleImportSubmit,
      handleImportDialogClosed,
      init
    };
  },
    mounted() {
        this.init();
    }
});
</script>

<style scoped>
.student-management {
    padding: 20px;
}

.main-card {
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
}

.pagination {
    margin-top: 20px;
    text-align: center;
}

.el-button--text {
    padding: 5px;
}

.import-dialog-content {
    padding: 0 10px;
}

.import-tips {
    margin-bottom: 20px;
}

.import-tips p {
    margin: 4px 0;
    font-size: 13px;
    line-height: 1.6;
}

.import-upload {
    margin-bottom: 10px;
}

.import-result {
    margin-top: 10px;
}

.failure-details {
    margin-top: 15px;
}

.failure-details h4 {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: #303133;
}
</style>
