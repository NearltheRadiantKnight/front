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
                    </div>
                </div>
            </template>

            <el-table :data="teacherList" style="width: 100%" v-loading="loading">
                <el-table-column prop="id" label="工号" width="100" />
                <el-table-column prop="name" label="姓名" width="90" />
                <el-table-column prop="phone" label="联系电话" width="120" />
                <el-table-column prop="email" label="邮箱" width="180" />
                <el-table-column label="角色" width="100">
                    <template #default="scope">
                        <el-tag v-if="scope.row.isAdmin" type="success" size="small">管理员</el-tag>
                        <el-tag v-else type="info" size="small">教师</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="答辩组长" width="100">
                    <template #default="scope">
                        <el-tag v-if="scope.row.isDefenseLeader" type="warning" size="small">组长</el-tag>
                        <span v-else style="color: #999;">-</span>
                    </template>
                </el-table-column>
                <el-table-column label="所属小组" width="150">
                    <template #default="scope">
                        <div v-if="scope.row.groupId">
                            <div>小组ID: {{ scope.row.groupId }}</div>
                            <div v-if="scope.row.groupName" style="font-size: 12px; color: #666;">
                                {{ scope.row.groupName }}
                            </div>
                        </div>
                        <span v-else style="color: #999;">未分配</span>
                    </template>
                </el-table-column>
                <el-table-column prop="groupYear" label="答辩年份" width="100">
                    <template #default="scope">
                        <span v-if="scope.row.groupYear">{{ scope.row.groupYear }}年</span>
                        <span v-else style="color: #999;">-</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="scope">
                        <el-button type="text" size="small" @click="handleAssignGroup(scope.row)">
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

        <!-- 添加教师对话框 -->
        <el-dialog
            v-model="addDialogVisible"
            title="添加教师"
            width="500px"
        >
            <el-form ref="addFormRef" :model="addForm" :rules="teacherRules" label-width="100px">
                <el-form-item label="工号" prop="id" required>
                    <el-input v-model="addForm.id" placeholder="请输入工号" />
                </el-form-item>
                <el-form-item label="姓名" prop="name" required>
                    <el-input v-model="addForm.name" placeholder="请输入姓名" />
                </el-form-item>
                <el-form-item label="联系电话" prop="phone">
                    <el-input v-model="addForm.phone" placeholder="请输入联系电话" />
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email" placeholder="请输入邮箱" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="addDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleAddSubmit">保存</el-button>
            </template>
        </el-dialog>

        <!-- 分配小组对话框 -->
        <el-dialog
            v-model="assignDialogVisible"
            title="分配答辩小组"
            width="500px"
        >
            <el-form ref="assignFormRef" :model="assignForm" label-width="100px">
                <el-form-item label="教师信息">
                    <div style="padding: 8px; background: #f5f7fa; border-radius: 4px;">
                        {{ selectedTeacher.name }}（{{ selectedTeacher.id }}）
                    </div>
                </el-form-item>
                <el-form-item label="选择年份" required>
                    <el-select
                        v-model="assignForm.year"
                        placeholder="请选择年份"
                        @change="handleYearChange"
                        style="width: 100%"
                        clearable
                    >
                        <el-option
                            v-for="year in yearOptions"
                            :key="year.year"
                            :label="`${year.year}年`"
                            :value="year.year"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="选择小组" required>
                    <el-select
                        v-model="assignForm.groupId"
                        placeholder="请选择小组"
                        :disabled="!assignForm.year"
                        style="width: 100%"
                        clearable
                    >
                        <el-option
                            v-for="group in groupOptions"
                            :key="group.id"
                            :label="group.name"
                            :value="group.id"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="设为组长">
                    <el-switch
                        v-model="assignForm.isLeader"
                        :disabled="!assignForm.groupId"
                    />
                    <div v-if="assignForm.isLeader" style="color: #e6a23c; font-size: 12px; margin-top: 5px;">
                        注意：设为组长后，该教师将成为该小组的负责人
                    </div>
                </el-form-item>
                <el-form-item label="操作说明" v-if="selectedTeacher.groupId">
                    <div style="color: #f56c6c; font-size: 12px;">
                        注意：该教师已有分配的小组（{{ selectedTeacher.groupName }}），重新分配将覆盖原有设置
                    </div>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="assignDialogVisible = false">取消</el-button>
                <el-button type="danger" @click="handleRemoveGroup" :disabled="!selectedTeacher.groupId">
                    移除小组
                </el-button>
                <el-button type="primary" @click="handleAssignSubmit" :disabled="!assignForm.groupId">
                    确认分配
                </el-button>
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
        const addFormRef = ref();
        const assignFormRef = ref();
        const loading = ref(false);
        const addDialogVisible = ref(false);
        const assignDialogVisible = ref(false);

        const searchKeyword = ref('');
        const teacherList = ref([] as any[]);
        const currentPage = ref(1);
        const pageSize = ref(10);
        const total = ref(0);
        const instituteId = ref(1);

        // 添加表单
        const addForm = ref({
            id: '',
            name: '',
            phone: '',
            email: '',
            instituteId: instituteId.value
        });

        const teacherRules = {
            id: [
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
                { pattern: /^1[3-9]\d{9}$|^$/, message: '请输入正确的手机号码或留空', trigger: 'blur' }
            ]
        };

        // 分配小组表单
        const selectedTeacher = ref({} as any);
        const assignForm = ref({
            year: null as number | null,
            groupId: null as number | null,
            isLeader: false
        });
        const yearOptions = ref([] as any[]);
        const groupOptions = ref([] as any[]);

        // 加载教师列表
        const loadTeachers = async () => {
            loading.value = true;
            try {
                const response = await request.get('/teachers/list', {
                    params: {
                        institute_id: instituteId.value,
                    }
                });

                if (response.code === 200) {
                    // 处理字段映射
                    teacherList.value = (response.data || []).map(teacher => {
                        // 生成显示名称
                        let displayName = '未知教师';
                        if (teacher.realName) {
                            displayName = teacher.realName;
                        } else if (teacher.id) {
                            // 使用工号生成默认名称
                            displayName = `教师${teacher.id.slice(-4)}`;
                        }

                        return {
                            id: teacher.id,
                            name: displayName,
                            realName: teacher.realName, // 保留原始字段
                            phone: teacher.phone || '-',
                            email: teacher.email || '-',
                            instituteId: teacher.instituteId,
                            instituteName: teacher.instituteName,
                            isDefenseLeader: teacher.isDefenseLeader,
                            groupId: teacher.groupId,
                            groupName: teacher.groupName,
                            groupYear: teacher.groupYear,
                            isAdmin: teacher.isAdmin || teacher.role === 1
                        };
                    });
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
            addForm.value = {
                id: '',
                name: '',
                phone: '',
                email: '',
                instituteId: instituteId.value
            };
            addDialogVisible.value = true;
        };

        const handleAddSubmit = async () => {
            if (!addFormRef.value) return;

            const valid = await addFormRef.value.validate();
            if (!valid) return;

            try {
                const response = await request.post('/teachers/create', {
                    id: addForm.value.id,
                    realName: addForm.value.name,
                    phone: addForm.value.phone,
                    email: addForm.value.email,
                    instituteId: addForm.value.instituteId
                    // 不传 isAdmin，后端默认为 false
                });

                if (response.code === 200) {
                    ElMessage.success('创建成功');
                    addDialogVisible.value = false;
                    loadTeachers();
                } else {
                    ElMessage.error(response.message || '创建失败');
                }
            } catch (error: any) {
                console.error('创建教师失败:', error);
                ElMessage.error(error.response?.data?.message || '创建失败');
            }
        };

        // 分配小组
        const handleAssignGroup = (row: any) => {
            selectedTeacher.value = row;
            assignForm.value = {
                year: row.groupYear || null,
                groupId: row.groupId || null,
                isLeader: row.isDefenseLeader || false
            };
            loadYearOptions();
            assignDialogVisible.value = true;
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
            assignForm.value.groupId = null;
            assignForm.value.isLeader = false;

            if (!year) {
                groupOptions.value = [];
                return;
            }

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
            if (!assignForm.value.groupId) {
                ElMessage.warning('请选择小组');
                return;
            }

            try {
                const params: any = {
                    teacher_id: selectedTeacher.value.id,
                    group_id: assignForm.value.groupId
                };

                if (assignForm.value.isLeader) {
                    // 如果是设为组长，调用组长设置接口
                    const response = await request.post('/teachers/set-leader', null, { params });
                    if (response.code === 200) {
                        ElMessage.success('分配小组成功（已设为组长）');
                        assignDialogVisible.value = false;
                        loadTeachers();
                    } else {
                        ElMessage.error(response.message || '分配失败');
                    }
                } else {
                    // 如果不是组长，调用分配教师到小组的接口（需要后端提供）
                    const response = await request.post('/teachers/assign-group', null, { params });
                    if (response.code === 200) {
                        ElMessage.success('分配小组成功');
                        assignDialogVisible.value = false;
                        loadTeachers();
                    } else {
                        ElMessage.error(response.message || '分配失败');
                    }
                }
            } catch (error) {
                console.error('分配小组失败:', error);
                ElMessage.error('分配失败');
            }
        };

        // 移除小组
        const handleRemoveGroup = async () => {
            try {
                const response = await request.post('/teachers/remove-group', null, {
                    params: { teacher_id: selectedTeacher.value.id }
                });
                if (response.code === 200) {
                    ElMessage.success('已从小组中移除');
                    assignDialogVisible.value = false;
                    loadTeachers();
                } else {
                    ElMessage.error(response.message || '移除失败');
                }
            } catch (error) {
                console.error('移除小组失败:', error);
                ElMessage.error('移除失败');
            }
        };

        // 删除教师
        const handleDelete = (row: any) => {
            ElMessageBox.confirm(
                `确定要删除教师 "${row.name}"（${row.id}）吗？`,
                '确认删除',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }
            ).then(async () => {
                try {
                    const response = await request.delete(`/teachers/delete/${row.id}`);
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
            addFormRef,
            assignFormRef,
            loading,
            addDialogVisible,
            assignDialogVisible,
            searchKeyword,
            teacherList,
            currentPage,
            pageSize,
            total,
            addForm,
            teacherRules,
            selectedTeacher,
            assignForm,
            yearOptions,
            groupOptions,

            loadTeachers,
            handleSearch,
            handleAdd,
            handleAddSubmit,
            handleAssignGroup,
            handleYearChange,
            handleAssignSubmit,
            handleRemoveGroup,
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

.el-button--text {
    padding: 5px;
}

.el-tag {
    margin: 0;
}
</style>
