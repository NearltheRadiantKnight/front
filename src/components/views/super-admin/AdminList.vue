<template>
    <div class="admin-list">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>院系管理员列表</span>
                    <div>
                        <el-input v-model="searchKeyword" placeholder="搜索管理员"
                                  style="width: 200px; margin-right: 10px;"/>
                        <el-button type="primary" @click="$router.push('adminadd')">
                            <i class="el-icon-plus"></i> 添加管理员
                        </el-button>
                    </div>
                </div>
            </template>

            <el-table :data="admins" style="width: 100%">
                <el-table-column prop="realName" label="管理员姓名"/>
                <el-table-column prop="id" label="登录用户名"/>
                <el-table-column prop="pwd" label="所属院系"/>
                <el-table-column prop="phone" label="联系电话" width="120"/>
                <el-table-column prop="email" label="邮箱"/>
                <el-table-column label="操作" width="200">
                    <template #default="scope">
                        <el-button type="text" size="small" @click="this.editAdmin(scope.row)">编辑</el-button>
                        <el-button type="text" size="small" @click="resetPassword(scope.row)">重置密码</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <el-dialog v-model="showDialog" :title="dialogTitle" width="500px">
            <el-form :model="form" label-width="100px">
                <el-form-item label="管理员名称" required>
                    <el-input v-model="form.realName" placeholder="请输入管理员名称"/>
                </el-form-item>
                <el-form-item label="登录账号" required>
                    <el-input v-model="form.id" placeholder="请输入登录账号"/>
                </el-form-item>
                <el-form-item label="电话">
                    <el-input v-model="form.phone" placeholder="请输入电话"/>
                </el-form-item>
                <el-form-item label="邮箱">
                    <el-input v-model="form.email" placeholder="请输入邮箱"/>
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
import {defineComponent, ref, computed} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import {userApi} from '@/api/user.ts';
import {instituteApi} from "@/api/institute.ts";

export default defineComponent({
    name: 'AdminList',
    data() {
        return {
            instituteList:[],
            admins: [],
            showDialog: ref(false),
            dialogTitle: ref('修改管理员'),
            isEditMode : ref(false),
            form : {
                realName:'',
                id:'',
                phone:'',
                email:''
            }
        }
    },
    methods: {
        loadAdmin() {
            userApi.getInstituteAdmins().then((res: any) => {
                console.log(res.data);
                this.admins = res.data
            });
        },
        loadInstituteList(){
            instituteApi.getInstitutes().then((res:any)=>{ this.instituteList=res.data})
        },
        editAdmin(row:any) {
            this.dialogTitle = '编辑管理员';
            this.isEditMode = true;
            this.form = {...row};
            this.showDialog = true;
        },
        handleSave(){
            userApi.updateAdmin({...this.form}).then((res=>{
                ElMessage.success('修改成功');
                this.showDialog = false;
                this.isEditMode = false;
                window.location.reload();
            }));
        }
    },
    mounted(): any {
        this.loadAdmin();
        this.loadInstituteList();
    },
    setup() {
        const searchKeyword = ref('');

        const resetPassword = async (row: any) => {
            try {
                await ElMessageBox.confirm(`确定要重置管理员 "${row.adminName}" 的密码吗？`, '提示', {
                    type: 'warning'
                });
                ElMessage.success('密码已重置为: 123456');
            } catch {
                // 用户取消
            }
        };

        const toggleStatus = async (row: any) => {
            const newStatus = row.status === '正常' ? '禁用' : '正常';
            const action = row.status === '正常' ? '禁用' : '启用';

            try {
                await ElMessageBox.confirm(`确定要${action}管理员 "${row.adminName}" 吗？`, '提示', {
                    type: 'warning'
                });
                row.status = newStatus;
                ElMessage.success(`${action}成功`);
            } catch {
                // 用户取消
            }
        };

        return {
            searchKeyword,
            resetPassword,
            toggleStatus
        };
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