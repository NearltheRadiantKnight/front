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
                        <el-tag v-if="scope.row.groupName" size="small">
                            {{ scope.row.groupName }}
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
                            @click="handleAssignGroup(scope.row)"
                            :disabled="!hasActiveYears"
                        >
                            分配小组
                        </el-button>
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

        <!-- 分配小组对话框 -->
        <el-dialog
            v-model="assignDialogVisible"
            title="分配答辩小组"
            width="500px"
        >
            <el-form label-width="100px">
                <el-form-item label="学生信息">
                    <div>{{ selectedStudent.name }}（{{ selectedStudent.studentId }}）</div>
                </el-form-item>
                <el-form-item label="选择年份">
                    <el-select
                        v-model="selectedYear"
                        placeholder="请选择年份"
                        @change="handleYearChange"
                        style="width: 100%"
                    >
                        <el-option
                            v-for="year in yearOptions"
                            :key="year.year"
                            :label="`${year.year}年`"
                            :value="year.year"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="选择小组">
                    <el-select
                        v-model="selectedGroupId"
                        placeholder="请选择小组"
                        :disabled="!selectedYear"
                        style="width: 100%"
                    >
                        <el-option
                            v-for="group in groupOptions"
                            :key="group.id"
                            :label="group.name"
                            :value="group.id"
                        />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="assignDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleAssignSubmit">分配</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '@/api';

export default defineComponent({
    name: 'StudentManagement',
    setup() {
        // Refs 声明
        const studentFormRef = ref();
        const loading = ref(false);
        const editDialogVisible = ref(false);
        const assignDialogVisible = ref(false);
        const isEditMode = ref(false);

        const searchKeyword = ref('');
        const studentList = ref([] as any[]);
        const currentPage = ref(1);
        const pageSize = ref(10);
        const total = ref(0);

        const instituteId = ref(1);

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
                { required: true, message: '请输入学号', trigger: 'blur' },
                { pattern: /^\d{7,12}$/, message: '学号为7-12位数字', trigger: 'blur' }
            ],
            name: [
                { required: true, message: '请输入姓名', trigger: 'blur' },
                { min: 2, max: 20, message: '长度在2到20个字符', trigger: 'blur' }
            ],
            email: [
                { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
            ],
            phone: [
                { pattern: /^1[3-9]\d{9}$|^$/, message: '请输入正确的手机号码或留空', trigger: 'blur' }
            ]
        };

        // 分配小组相关
        const selectedStudent = ref({} as any);
        const selectedYear = ref(null as number | null);
        const selectedGroupId = ref(null as number | null);
        const yearOptions = ref([] as any[]);
        const groupOptions = ref([] as any[]);
        const hasActiveYears = ref(false);

        // 加载学生列表
        const loadStudents = async () => {
            loading.value = true;
            try {
                const response = await request.get('/api/students/list', {
                    params: {
                        institute_id: instituteId.value,
                        page: currentPage.value,
                        size: pageSize.value,
                        search: searchKeyword.value
                    }
                });

                if (response.code === 200) {
                    studentList.value = response.data.list || [];
                    total.value = response.data.total || 0;
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
                const url = isEditMode.value ? '/api/students/update' : '/api/students/create';

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

        // 分配小组
        const handleAssignGroup = (row: any) => {
            selectedStudent.value = row;
            selectedYear.value = null;
            selectedGroupId.value = null;
            loadYearOptions();
            assignDialogVisible.value = true;
        };

        const loadYearOptions = async () => {
            try {
                const response = await request.get('/api/defense-year/list', {
                    params: { institute_id: instituteId.value }
                });
                if (response.code === 200) {
                    yearOptions.value = response.data;
                    hasActiveYears.value = yearOptions.value.some((year: any) => year.status === 1);
                }
            } catch (error) {
                console.error('加载年份失败:', error);
            }
        };

        const handleYearChange = async (year: number) => {
            try {
                const response = await request.get('/api/defense-year/groups', {
                    params: { year, institute_id: instituteId.value }
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

            try {
                const response = await request.post('/api/students/assign-group', {
                    student_id: selectedStudent.value.id, // 使用学号作为student_id
                    group_id: selectedGroupId.value
                });

                if (response.code === 200) {
                    ElMessage.success('分配成功');
                    assignDialogVisible.value = false;
                    loadStudents();
                } else {
                    ElMessage.error(response.message || '分配失败');
                }
            } catch (error) {
                console.error('分配小组失败:', error);
                ElMessage.error('分配失败');
            }
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
                    const response = await request.delete(`/api/students/delete/${row.id}`);
                    if (response.code === 200) {
                        ElMessage.success('删除成功');
                        loadStudents();
                    }
                } catch (error) {
                    console.error('删除失败:', error);
                    ElMessage.error('删除失败');
                }
            }).catch(() => {});
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

        // 初始化
        const init = () => {
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                try {
                    const info = JSON.parse(userInfo);
                    instituteId.value = info.institute_id || info.instId || 1;
                } catch (error) {
                    console.error('解析用户信息失败:', error);
                }
            }

            loadStudents();
        };

        return {
            studentFormRef,
            loading,
            editDialogVisible,
            assignDialogVisible,
            isEditMode,
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
            hasActiveYears,

            loadStudents,
            handleSearch,
            handleAdd,
            handleEdit,
            handleSubmit,
            handleAssignGroup,
            handleYearChange,
            handleAssignSubmit,
            handleDelete,
            handleSizeChange,
            handlePageChange,
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
</style>