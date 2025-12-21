<template>
    <div class="institute-list">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>院系列表</span>
                    <el-button type="primary" @click="()=>{this.$router.push('/instituteadd');}">
                        <i class="el-icon-plus"></i> 添加院系
                    </el-button>
                </div>
            </template>

            <el-table :data="this.instituteList" style="width: 100%">
                <el-table-column prop="id" label="ID" width="80"/>
                <el-table-column prop="name" label="院系名称" width="120"/>
                <el-table-column label="院系管理员" width="120">
                    <template #default="scope">
                        {{ scope.row.adminName || '未设置' }}
                    </template>
                </el-table-column>
                <el-table-column prop="teacherCount" label="教师人数" width="100"/>
                <el-table-column prop="studentCount" label="学生人数" width="100"/>
                <el-table-column label="操作" width="200">
                    <template #default="scope">
                        <el-button type="text" size="small" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button type="text" size="small" @click="handleDelete(scope.row)" style="color: #f56c6c;">
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 添加/编辑对话框 -->
        <el-dialog v-model="showDialog" :title="dialogTitle" width="500px">
            <el-form :model="form" label-width="100px">
                <el-form-item label="院系名称" required>
                    <el-input v-model="form.name" placeholder="请输入院系名称"/>
                </el-form-item>
                <el-form-item label="院系管理员" required>
                    <el-select v-model="form.adminId" placeholder="请选择院系管理员" style="width: 100%" :empty-values="[null,undefined]">
                        <el-option :value="''" label="无管理员"/>
                        <el-option
                                v-for="item in this.admins"
                                :key="item.id"
                                :label="item.id"
                                :value="item.id"
                        />
                    </el-select>
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
import request from "@/api";
import {instituteApi} from "@/api/institute.ts";
import {userApi} from "@/api/user.ts";

export default defineComponent({
    name: 'InstituteList',
    data(){
        return{
            admins:[],
            instituteList : [],
            showDialog: ref(false),
            dialogTitle: ref('添加院系'),
            isEditMode : ref(false),
            form : {
                id: 0,
                name: '',
                adminId: '',
            }
        }
    },
    methods:{
        loadAdmin() {
            userApi.getInstituteAdmins().then((res: any) => {
                console.log(res.data)
                this.admins = res.data
            });
        },
        loadInstituteList(){
            instituteApi.getInstitutes().then((res:any)=>{ this.instituteList=res.data})
        },
        handleEdit(row: any){
            this.dialogTitle = '编辑院系';
            this.isEditMode = true;
            this.form = {...row};
            this.showDialog = true;
        },
        handleSave() {
            if (!this.form.name.trim()) {
                ElMessage.warning('请填写院系名称');
                return;
            }
            if (this.isEditMode) {
                request.post("/institute/update", {...this.form}).then((res:any)=>{
                    ElMessage.success('院系信息已更新');
                    window.location.reload();
                });
            }
            this.showDialog = false;
        },
        async handleDelete(row:any){
            await ElMessageBox.confirm(`确定删除院系 "${row.name}" 吗？`, '警告', {
                type: 'warning',
                confirmButtonText: '确定',
                cancelButtonText: '取消'
            }).then(()=>{
                request.post("/institute/delete", {"id":row.id}).then((res:any)=>{
                    ElMessage.success('院系已删除');
                    window.location.reload();
                ElMessage({
                    type:'success',
                    message:'删除成功'
                })
            }).catch(()=>{});
            });
        },
        resetForm() {
            this.form = {
                id: 0,
                name: '',
                adminId: ''
            };
        }

    },
    mounted(): any {
        this.loadInstituteList();
        this.loadAdmin();
    }
});
</script>

<style scoped>
.institute-list {
    padding: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
}

.el-card {
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.el-table {
    margin-top: 10px;
}

.el-table-column {
    text-align: center;
}

.el-button--text {
    padding: 5px;
}
</style>
