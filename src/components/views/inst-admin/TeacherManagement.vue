<template>
    <div class="teacher-management">
        <el-card class="main-card">
            <template #header>
                <div class="card-header">
                    <span><i class="el-icon-s-custom"></i> 教师管理</span>
                    <div class="header-actions">
                        <el-input
                            v-model="searchKeyword"
                            placeholder="搜索教师姓名/工号"
                            style="width: 200px; margin-right: 10px;"
                            @input="handleSearch"
                        >
                            <template #prefix>
                                <i class="el-icon-search"></i>
                            </template>
                        </el-input>
                        <el-button type="primary" @click="handleAdd">
                            <i class="el-icon-plus"></i> 添加教师
                        </el-button>
                        <el-button type="success" @click="showImportDialog = true">
                            <i class="el-icon-upload"></i> 导入
                        </el-button>
                    </div>
                </div>
            </template>

            <el-table :data="teacherList" style="width: 100%" v-loading="loading">
                <el-table-column prop="teacherId" label="工号" width="100" />
                <el-table-column prop="name" label="姓名" width="90" />
                <el-table-column prop="title" label="职称" width="90" />
                <el-table-column prop="department" label="系部" width="120" />
                <el-table-column prop="phone" label="联系电话" width="120" />
                <el-table-column prop="email" label="邮箱" width="180" />
                <el-table-column label="答辩组长" width="100">
                    <template #default="scope">
                        <el-tag
                            v-if="scope.row.isGroupLeader"
                            type="success"
                            size="small"
                        >
                            组长
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="所在小组" width="150">
                    <template #default="scope">
                        <span v-if="scope.row.groupName">{{ scope.row.groupName }}</span>
                        <span v-else style="color: #999;">无</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="scope">
                        <el-button type="text" size="small" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button
                            type="text"
                            size="small"
                            @click="handleSetLeader(scope.row)"
                            :disabled="scope.row.isGroupLeader"
                        >
                            设为组长
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

        <!-- 教师编辑对话框 -->
        <el-dialog
            v-model="editDialogVisible"
            :title="isEditMode ? '编辑教师' : '添加教师'"
            width="500px"
        >
            <el-form ref="teacherFormRef" :model="teacherForm" :rules="teacherRules" label-width="100px">
                <el-form-item label="工号" prop="teacher_id" required>
                    <el-input
                        v-model="teacherForm.teacher_id"
                        placeholder="请输入工号"
                        :disabled="isEditMode"
                    />
                </el-form-item>
                <el-form-item label="姓名" prop="name" required>
                    <el-input v-model="teacherForm.name" placeholder="请输入姓名" />
                </el-form-item>
                <el-form-item label="职称" prop="title">
                    <el-select v-model="teacherForm.title" placeholder="请选择职称" style="width: 100%">
                        <el-option label="教授" value="教授" />
                        <el-option label="副教授" value="副教授" />
                        <el-option label="讲师" value="讲师" />
                        <el-option label="助教" value="助教" />
                    </el-select>
                </el-form-item>
                <el-form-item label="系部" prop="department">
                    <el-input v-model="teacherForm.department" placeholder="请输入系部" />
                </el-form-item>
                <el-form-item label="联系电话" prop="phone">
                    <el-input v-model="teacherForm.phone" placeholder="请输入联系电话" />
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="teacherForm.email" placeholder="请输入邮箱" />
                </el-form-item>
                <el-form-item label="是否管理员" prop="is_admin">
                    <el-switch v-model="teacherForm.is_admin" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="editDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSubmit">保存</el-button>
            </template>
        </el-dialog>

        <!-- 设为组长对话框 -->
        <el-dialog
            v-model="leaderDialogVisible"
            title="设为答辩组长"
            width="500px"
        >
            <el-form label-width="100px">
                <el-form-item label="教师信息">
                    <div>{{ selectedTeacher.name }}（{{ selectedTeacher.teacherId }}）</div>
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
                <el-button @click="leaderDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSetLeaderSubmit">设为组长</el-button>
            </template>
        </el-dialog>

        <!-- 导入对话框 -->
        <el-dialog
            v-model="showImportDialog"
            title="导入教师数据"
            width="500px"
        >
            <div class="import-instructions">
                <h4>导入说明：</h4>
                <ol>
                    <li>下载模板文件，按要求填写数据</li>
                    <li>支持Excel格式（.xlsx, .xls）</li>
                    <li>每次最多导入200条记录</li>
                    <li>工号不能重复</li>
                </ol>
            </div>

            <el-upload
                class="upload-demo"
                drag
                action="/api/teachers/import"
                :before-upload="beforeUpload"
                :on-success="handleImportSuccess"
                :on-error="handleImportError"
                :show-file-list="false"
                accept=".xlsx,.xls"
            >
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                <div class="el-upload__tip" slot="tip">只能上传excel文件，且不超过10MB</div>
            </el-upload>

            <template #footer>
                <el-button @click="showImportDialog = false">关闭</el-button>
                <el-button type="primary" @click="downloadTemplate">下载模板</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '@/api';

export default defineComponent({
    name: 'TeacherManagement',
    setup() {
        const teacherFormRef = ref();
        const loading = ref(false);
        const editDialogVisible = ref(false);
        const leaderDialogVisible = ref(false);
        const showImportDialog = ref(false);
        const isEditMode = ref(false);

        const searchKeyword = ref('');
        const teacherList = ref([] as any[]);
        const currentPage = ref(1);
        const pageSize = ref(10);
        const total = ref(0);

        const instituteId = ref(1);

        // 表单相关
        const teacherForm = ref({
            id: '',
            teacher_id: '',
            name: '',
            title: '',
            department: '',
            phone: '',
            email: '',
            is_admin: false,
            institute_id: instituteId.value
        });

        const teacherRules = {
            teacher_id: [
                { required: true, message: '请输入工号', trigger: 'blur' },
                { pattern: /^\d{6,10}$/, message: '工号为6-10位数字', trigger: 'blur' }
            ],
            name: [
                { required: true, message: '请输入姓名', trigger: 'blur' },
                { min: 2, max: 20, message: '长度在2到20个字符', trigger: 'blur' }
            ],
            email: [
                { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
            ],
            phone: [
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
            ]
        };

        // 设为组长相关
        const selectedTeacher = ref({} as any);
        const selectedYear = ref(null as number | null);
        const selectedGroupId = ref(null as number | null);
        const yearOptions = ref([] as any[]);
        const groupOptions = ref([] as any[]);

        // 加载教师列表
        const loadTeachers = async () => {
            loading.value = true;
            try {
                const response = await request.get('/api/teachers/list', {
                    params: {
                        institute_id: instituteId.value,
                        page: currentPage.value,
                        size: pageSize.value,
                        search: searchKeyword.value
                    }
                });

                if (response.code === 200) {
                    // 映射字段：后端返回下划线，前端用驼峰
                    teacherList.value = (response.data.list || []).map((teacher: any) => ({
                        id: teacher.id,
                        teacherId: teacher.teacher_id || teacher.teacherId,
                        name: teacher.name,
                        title: teacher.title,
                        department: teacher.department,
                        phone: teacher.phone,
                        email: teacher.email,
                        isGroupLeader: teacher.is_group_leader || teacher.isGroupLeader,
                        groupName: teacher.group_name || teacher.groupName,
                        isAdmin: teacher.is_admin || teacher.isAdmin
                    }));
                    total.value = response.data.total || 0;
                }
            } catch (error) {
                console.error('加载教师失败:', error);
                ElMessage.error('加载失败');
            } finally {
                loading.value = false;
            }
        };

        // 搜索
        const handleSearch = () => {
            currentPage.value = 1;
            loadTeachers();
        };

        // 添加教师
        const handleAdd = () => {
            isEditMode.value = false;
            teacherForm.value = {
                id: '',
                teacher_id: '',
                name: '',
                title: '',
                department: '',
                phone: '',
                email: '',
                is_admin: false,
                institute_id: instituteId.value
            };
            editDialogVisible.value = true;
        };

        // 编辑教师
        const handleEdit = (row: any) => {
            isEditMode.value = true;
            teacherForm.value = {
                id: row.id,
                teacher_id: row.teacherId,
                name: row.name,
                title: row.title,
                department: row.department,
                phone: row.phone,
                email: row.email,
                is_admin: row.isAdmin,
                institute_id: instituteId.value
            };
            editDialogVisible.value = true;
        };

        // 保存教师
        const handleSubmit = async () => {
            if (!teacherFormRef.value) return;

            const valid = await teacherFormRef.value.validate();
            if (!valid) return;

            try {
                const url = isEditMode.value ? '/api/teachers/update' : '/api/teachers/create';
                const response = await request.post(url, teacherForm.value);

                if (response.code === 200) {
                    ElMessage.success(isEditMode.value ? '更新成功' : '创建成功');
                    editDialogVisible.value = false;
                    loadTeachers();
                } else {
                    ElMessage.error(response.message || '操作失败');
                }
            } catch (error) {
                console.error('保存教师失败:', error);
                ElMessage.error('操作失败');
            }
        };

        // 设为组长
        const handleSetLeader = (row: any) => {
            selectedTeacher.value = row;
            selectedYear.value = null;
            selectedGroupId.value = null;
            loadYearOptions();
            leaderDialogVisible.value = true;
        };

        const loadYearOptions = async () => {
            try {
                const response = await request.get('/api/defense-year/list', {
                    params: { institute_id: instituteId.value }
                });
                if (response.code === 200) {
                    yearOptions.value = response.data.filter((year: any) => year.status === 1);
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
                    groupOptions.value = response.data.filter((group: any) => !group.admin_id && !group.adminId);
                }
            } catch (error) {
                console.error('加载小组失败:', error);
            }
        };

        const handleSetLeaderSubmit = async () => {
            if (!selectedGroupId.value) {
                ElMessage.warning('请选择小组');
                return;
            }

            try {
                const response = await request.post('/api/groups/set-leader', {
                    group_id: selectedGroupId.value,
                    teacher_id: selectedTeacher.value.id
                });

                if (response.code === 200) {
                    ElMessage.success('设置组长成功');
                    leaderDialogVisible.value = false;
                    loadTeachers();
                } else {
                    ElMessage.error(response.message || '设置失败');
                }
            } catch (error) {
                console.error('设置组长失败:', error);
                ElMessage.error('设置失败');
            }
        };

        // 删除教师
        const handleDelete = (row: any) => {
            ElMessageBox.confirm(
                `确定要删除教师 "${row.name}"（${row.teacherId}）吗？`,
                '确认删除',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }
            ).then(async () => {
                try {
                    const response = await request.delete(`/api/teachers/delete/${row.id}`);
                    if (response.code === 200) {
                        ElMessage.success('删除成功');
                        loadTeachers();
                    }
                } catch (error) {
                    console.error('删除失败:', error);
                    ElMessage.error('删除失败');
                }
            }).catch(() => {});
        };

        // 导入相关
        const beforeUpload = (file: File) => {
            const isExcel = file.type === 'application/vnd.ms-excel' ||
                          file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            const isLt10M = file.size / 1024 / 1024 < 10;

            if (!isExcel) {
                ElMessage.error('只能上传Excel文件!');
                return false;
            }
            if (!isLt10M) {
                ElMessage.error('文件大小不能超过10MB!');
                return false;
            }
            return true;
        };

        const handleImportSuccess = (response: any) => {
            if (response.code === 200) {
                ElMessage.success('导入成功');
                showImportDialog.value = false;
                loadTeachers();
            } else {
                ElMessage.error(response.message || '导入失败');
            }
        };

        const handleImportError = () => {
            ElMessage.error('导入失败');
        };

        const downloadTemplate = () => {
            window.open('/api/teachers/template', '_blank');
        };

        // 分页
        const handleSizeChange = (size: number) => {
            pageSize.value = size;
            loadTeachers();
        };

        const handlePageChange = (page: number) => {
            currentPage.value = page;
            loadTeachers();
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

            loadTeachers();
        };

        return {
            teacherFormRef,
            loading,
            editDialogVisible,
            leaderDialogVisible,
            showImportDialog,
            isEditMode,
            searchKeyword,
            teacherList,
            currentPage,
            pageSize,
            total,
            teacherForm,
            teacherRules,
            selectedTeacher,
            selectedYear,
            selectedGroupId,
            yearOptions,
            groupOptions,

            loadTeachers,
            handleSearch,
            handleAdd,
            handleEdit,
            handleSubmit,
            handleSetLeader,
            handleYearChange,
            handleSetLeaderSubmit,
            handleDelete,
            beforeUpload,
            handleImportSuccess,
            handleImportError,
            downloadTemplate,
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
.teacher-management {
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

.import-instructions {
    margin-bottom: 20px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 4px;
}

.import-instructions h4 {
    margin-bottom: 10px;
    color: #333;
}

.import-instructions ol {
    margin-left: 20px;
    color: #666;
}

.import-instructions li {
    margin-bottom: 5px;
}

.upload-demo {
    text-align: center;
}

.upload-demo .el-upload-dragger {
    width: 100%;
    height: 180px;
}

.el-button--text {
    padding: 5px;
}

.el-tag {
    margin: 0;
}
</style>