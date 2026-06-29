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
                <el-table-column prop="realName" label="姓名" width="90" />
                <el-table-column prop="phone" label="联系电话" width="120" />
                <el-table-column prop="email" label="邮箱" width="180" />

                <el-table-column label="操作" width="120" fixed="right">
                    <template #default="scope">

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

        <!-- 管理小组对话框 -->
        <el-dialog
            v-model="manageDialogVisible"
            title="管理答辩小组"
            width="700px"
            @close="handleManageDialogClose"
        >
            <div class="teacher-info">
                <el-descriptions :column="2" border size="small">
                    <el-descriptions-item label="教师姓名">{{ selectedTeacher.name }}</el-descriptions-item>
                    <el-descriptions-item label="工号">{{ selectedTeacher.id }}</el-descriptions-item>
                </el-descriptions>
            </div>

            <div class="group-management">
                <!-- 已加入的小组 -->
                <div class="group-section">
                    <h4>已加入的小组</h4>
                    <el-table
                        :data="currentGroups"
                        style="width: 100%"
                        size="small"
                        empty-text="暂无小组"
                    >
                        <el-table-column prop="groupYear" label="年份" width="80">
                            <template #default="scope">
                                {{ scope.row.groupYear }}年
                            </template>
                        </el-table-column>
                        <el-table-column prop="groupId" label="小组编号" />
                        <el-table-column label="是否组长" width="100">
                            <template #default="scope">
                                <el-tag v-if="scope.row.isDefenseLeader" type="warning" size="small">组长</el-tag>
                                <span v-else>组员</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="100" fixed="right">
                            <template #default="scope">
                                <el-button
                                    type="text"
                                    size="small"
                                    @click="handleRemoveGroup(scope.row)"
                                    style="color: #f56c6c;"
                                >
                                    移除
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>

                <!-- 添加新小组 -->
                <div class="group-section">
                    <h4>添加新小组</h4>
                    <el-form ref="addGroupFormRef" :model="newGroupForm" label-width="100px">
                        <el-form-item label="答辩年份" required>
                            <el-select
                                v-model="newGroupForm.year"
                                placeholder="请选择年份"
                                @change="handleNewYearChange"
                                style="width: 100%"
                                clearable
                            >
                                <el-option
                                    v-for="year in yearOptions"
                                    :key="year.value"
                                    :label="`${year.label}年`"
                                    :value="year.value"
                                />
                            </el-select>
                            <div v-if="hasGroupInYear" style="color: #f56c6c; font-size: 12px; margin-top: 5px;">
                                注意：该教师已加入 {{ newGroupForm.year }} 年的小组，同一年只能参加一个小组
                            </div>
                        </el-form-item>
                        <el-form-item label="答辩小组" required>
                            <el-select
                                v-model="newGroupForm.groupId"
                                placeholder="请选择小组编号"
                                :disabled="!newGroupForm.year || hasGroupInYear"
                                style="width: 100%"
                                clearable
                            >
                                <el-option
                                    v-for="group in groupOptions"
                                    :key="group.id"
                                    :label="`小组#${group.id}`"
                                    :value="group.id"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="设为组长">
                            <el-switch
                                v-model="newGroupForm.isLeader"
                                :disabled="!newGroupForm.groupId || hasGroupInYear"
                            />
                            <div v-if="newGroupForm.isLeader" style="color: #e6a23c; font-size: 12px; margin-top: 5px;">
                                注意：设为组长后，该教师将成为该小组的负责人
                            </div>
                        </el-form-item>
                    </el-form>
                    <div class="add-group-actions">
                        <el-button
                            type="primary"
                            @click="handleAddGroup"
                            :disabled="!newGroupForm.groupId || hasGroupInYear || addingGroup"
                            :loading="addingGroup"
                        >
                            <i class="el-icon-plus"></i> 添加小组
                        </el-button>
                    </div>
                </div>
            </div>

            <template #footer>
                <el-button @click="manageDialogVisible = false">关闭</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '@/api';

export default defineComponent({
    name: 'TeacherManagement',
    setup() {
        const addFormRef = ref();
        const addGroupFormRef = ref();
        const loading = ref(false);
        const addDialogVisible = ref(false);
        const manageDialogVisible = ref(false);
        const addingGroup = ref(false);

        const searchKeyword = ref('');
        const teacherList = ref([] as any[]);
        const currentPage = ref(1);
        const pageSize = ref(10);
        const total = ref(0);
        const instituteId = ref(1);

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

        const selectedTeacher = ref({} as any);
        const currentGroups = ref([] as any[]);
        const yearOptions = ref([] as any[]);
        const groupOptions = ref([] as any[]);

        const newGroupForm = ref({
            year: null as number | null,
            groupId: null as number | null,
            isLeader: false
        });

        const hasGroupInYear = computed(() => {
            if (!newGroupForm.value.year) return false;
            return currentGroups.value.some(group =>
                group.groupYear === newGroupForm.value.year
            );
        });

        const loadTeachers = async () => {
            loading.value = true;
            try {
                console.log('加载教师列表，院系ID:', instituteId.value);

                const response = await request.get('/teachers/list', {
                    params: {
                        institute_id: instituteId.value,
                    }
                });

                console.log('教师列表响应:', response);

                // 注意：这里 response 已经是 data 了
                if (response && response.success === true) {
                    teacherList.value = response.data || [];
                    total.value = teacherList.value.length;
                } else {
                    teacherList.value = [];
                    total.value = 0;
                    console.warn('加载教师列表失败:', response?.message);
                }

            } catch (error) {
                console.error('加载教师列表失败:', error);
                ElMessage.error('加载失败');
                teacherList.value = [];
                total.value = 0;
            } finally {
                loading.value = false;
            }
        };

        const handleSearch = () => {
            currentPage.value = 1;
            loadTeachers();
        };

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
                // 准备请求数据
                const requestData = {
                    id: addForm.value.id,
                    realName: addForm.value.name,
                    phone: addForm.value.phone || '',
                    email: addForm.value.email || '',
                    InstId: instituteId.value // 使用当前管理员的院系ID
                };

                console.log('发送创建教师请求数据:', requestData);
                console.log('当前院系ID:', instituteId.value);

                // 注意：由于拦截器直接返回 data，这里的 response 就是后端返回的 data
                const response = await request.post('/teachers/create', requestData);

                console.log('创建教师响应:', response);

                // 直接检查 response，因为拦截器已经返回了 data
                if (response && response.success === true) {
                    ElMessage.success(response.message || '创建成功');
                    addDialogVisible.value = false;
                    loadTeachers();
                } else {
                    // 处理失败情况
                    const errorMsg = response?.message || '创建失败';
                    ElMessage.error(errorMsg);
                    console.warn('创建失败响应:', response);
                }

            } catch (error: any) {
                console.error('创建教师失败:', error);
                ElMessage.error('创建失败: ' + (error.message || '未知错误'));
            }
        };

        const handleQuickRemove = async (teacher: any, group: any) => {
            try {
                await ElMessageBox.confirm(
                    `确定要将 ${teacher.realName} 从"${group.groupYear}年 小组#${group.groupId}"中移除吗？`,
                    '确认移除',
                    {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }
                );

                await request.post('/teachers/remove-from-group', null, {
                    params: {
                        teacher_id: teacher.id,
                        group_id: group.groupId
                    }
                });

                loadTeachers();

                if (selectedTeacher.value.id === teacher.id) {
                    await loadTeacherGroups(teacher.id);
                }

                ElMessage.success('已从小组中移除');
            } catch (error: any) {
                if (error !== 'cancel') {
                    console.error('移除小组失败:', error);
                    ElMessage.error('移除失败');
                }
            }
        };

        const handleManageGroups = async (row: any) => {
            selectedTeacher.value = row;
            manageDialogVisible.value = true;

            // 加载教师当前的小组
            await loadTeacherGroups(row.id);

            // 加载年份选项
            await loadYearOptions();

            // 重置新增表单
            newGroupForm.value = {
                year: null,
                groupId: null,
                isLeader: false
            };
        };

        const loadTeacherGroups = async (teacherId: string) => {
            try {
                const response = await request.get(`/teachers/${teacherId}`);

                if (response.data) {
                    if (response.data.groups) {
                        currentGroups.value = response.data.groups.map((group: any) => {
                            return {
                                groupId: group.groupId,
                                groupYear: group.groupYear,
                                isDefenseLeader: group.isDefenseLeader || false
                            };
                        });
                    } else {
                        currentGroups.value = [];
                    }
                } else {
                    currentGroups.value = [];
                }
            } catch (error) {
                console.error("加载教师小组失败:", error);
                currentGroups.value = [];
            }
        };

        const loadYearOptions = async () => {
            try {
                const response = await request.get('/teachers/years');
                yearOptions.value = response.data.map((year: number) => ({
                    value: year,
                    label: year.toString()
                }));
            } catch (error) {
                console.error('加载年份选项失败:', error);
                yearOptions.value = [];
            }
        };

        const handleNewYearChange = async (year: number) => {
            newGroupForm.value.groupId = null;
            newGroupForm.value.isLeader = false;

            if (!year) {
                groupOptions.value = [];
                return;
            }

            try {
                const response = await request.get('/teachers/groups-by-year', {
                    params: { year }
                });

                groupOptions.value = response.data.map((id: number) => ({ id }));
            } catch (error) {
                console.error('加载小组选项失败:', error);
                groupOptions.value = [];
            }
        };

       const handleAddGroup = async () => {
           if (!newGroupForm.value.groupId) {
               ElMessage.warning('请选择小组');
               return;
           }

           if (hasGroupInYear.value) {
               ElMessage.warning('同一年只能参加一个答辩小组');
               return;
           }

           addingGroup.value = true;
           try {
               const response = await request.post('/teachers/add-to-group', null, {
                   params: {
                       teacher_id: selectedTeacher.value.id,
                       group_id: newGroupForm.value.groupId,
                       is_leader: newGroupForm.value.isLeader
                   }
               });

               if (response.success) {
                   // 根据is_leader显示不同的消息
                   if (newGroupForm.value.isLeader) {
                       ElMessage.success('成功加入小组');
                       // 注意：这里只是成功加入小组，但不一定是组长
                       // 如果小组已有组长，教师只是作为组员加入
                   } else {
                       ElMessage.success('成功加入小组');
                   }

                   // 重新加载小组列表
                   await loadTeacherGroups(selectedTeacher.value.id);

                   // 重新加载教师列表以更新显示
                   loadTeachers();

                   // 重置表单
                   newGroupForm.value = {
                       year: null,
                       groupId: null,
                       isLeader: false
                   };
               } else {
                   ElMessage.error(response.message || '添加失败');
               }
           } catch (error: any) {
               console.error('添加小组失败:', error);
               const errorMsg = error.response?.data?.message || '添加失败';
               ElMessage.error(errorMsg);
           } finally {
               addingGroup.value = false;
           }
       };


        const handleRemoveGroup = async (group: any) => {
            try {
                await ElMessageBox.confirm(
                    `确定要将教师从"${group.groupYear}年 小组#${group.groupId}"中移除吗？`,
                    '确认移除',
                    {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }
                );

                await request.post('/teachers/remove-from-group', null, {
                    params: {
                        teacher_id: selectedTeacher.value.id,
                        group_id: group.groupId
                    }
                });

                // 重新加载小组列表
                await loadTeacherGroups(selectedTeacher.value.id);

                // 重新加载教师列表
                loadTeachers();

                ElMessage.success('已从小组中移除');
            } catch (error: any) {
                if (error !== 'cancel') {
                    console.error('移除小组失败:', error);
                    ElMessage.error('移除失败');
                }
            }
        };

        const handleDelete = (row: any) => {
            ElMessageBox.confirm(
                `确定要删除教师 "${row.realName}"（${row.id}）吗？`,
                '确认删除',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }
            ).then(async () => {
                try {
                    await request.delete(`/teachers/delete/${row.id}`);

                    loadTeachers();

                    ElMessage.success('删除成功');
                } catch (error: any) {
                    console.error('删除教师失败:', error);
                    ElMessage.error(error.response?.data?.message || '删除失败');
                }
            }).catch(() => {});
        };

        const handleSizeChange = (size: number) => {
            pageSize.value = size;
            loadTeachers();
        };

        const handlePageChange = (page: number) => {
            currentPage.value = page;
            loadTeachers();
        };

        const handleManageDialogClose = () => {
            currentGroups.value = [];
            newGroupForm.value = {
                year: null,
                groupId: null,
                isLeader: false
            };
        };

        const init = () => {
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                try {
                    const info = JSON.parse(userInfo);
                    console.log('用户信息:', info); // 添加日志

                    // 尝试多种可能的字段名
                    instituteId.value = info.institute_id ||
                                       info.inst_id ||
                                       info.instituteId ||
                                       info.instId ||
                                       (info.institute && info.institute.id) ||
                                       1;

                    console.log('获取到的院系ID:', instituteId.value);

                } catch (error) {
                    console.error('解析用户信息失败:', error);
                    instituteId.value = 1; // 默认值
                }
            } else {
                console.warn('未找到用户信息');
                instituteId.value = 1; // 默认值
            }

            loadTeachers();
        };

        onMounted(() => {
            init();
        });

        return {
            addFormRef,
            addGroupFormRef,
            loading,
            addingGroup,
            addDialogVisible,
            manageDialogVisible,
            searchKeyword,
            teacherList,
            currentPage,
            pageSize,
            total,
            addForm,
            teacherRules,
            selectedTeacher,
            currentGroups,
            yearOptions,
            groupOptions,
            newGroupForm,
            hasGroupInYear,

            loadTeachers,
            handleSearch,
            handleAdd,
            handleAddSubmit,
            handleQuickRemove,
            handleManageGroups,
            handleNewYearChange,
            handleAddGroup,
            handleRemoveGroup,
            handleDelete,
            handleSizeChange,
            handlePageChange,
            handleManageDialogClose,
            init
        };
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

.groups-display {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.group-tag-item {
    margin-bottom: 4px;
}

.group-tag {
    display: inline-flex;
    align-items: center;
    cursor: default;
}

.group-tag .el-icon-close {
    margin-left: 4px;
    cursor: pointer;
}

.teacher-info {
    margin-bottom: 20px;
}

.group-management {
    max-height: 500px;
    overflow-y: auto;
}

.group-section {
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 1px solid #e8e8e8;
}

.group-section:last-child {
    border-bottom: none;
    margin-bottom: 0;
}

.group-section h4 {
    margin-bottom: 15px;
    color: #303133;
    font-size: 14px;
    font-weight: 600;
}

.add-group-actions {
    text-align: center;
    margin-top: 20px;
}
</style>
