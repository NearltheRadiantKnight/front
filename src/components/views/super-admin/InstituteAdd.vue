<template>
    <div class="institute-add">
        <el-card>
            <template #header>
                <span>创建新院系</span>
            </template>

            <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
                <el-form-item label="院系名称" prop="name">
                    <el-input v-model="form.name" placeholder="请输入院系名称"/>
                </el-form-item>

                <el-form-item label="院系管理员">
                    <el-select
                        placeholder="选择院系管理员（可选）"
                        v-model="form.adminId"
                        clearable
                        filterable
                        style="width: 100%"
                    >
                        <el-option label="暂不分配管理员" :value="null"></el-option>
                        <el-option
                            v-for="item in admins"
                            :label="item.realName"
                            :key="item.id"
                            :value="item.id"
                        ></el-option>
                    </el-select>
                    <div class="form-tip">创建院系时可以选择不分配管理员，后续可以再分配</div>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="submitForm" :loading="loading">创建院系</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <div class="preview-card">
            <h3>院系信息预览</h3>
            <div class="preview-content">
                <p><strong>院系名称：</strong>{{ form.name || '未填写' }}</p>
                <p><strong>管理员：</strong>{{ selectedAdminName }}</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ElMessage } from 'element-plus';
import request from "@/api";
import { userApi } from "@/api/user.ts";

export default defineComponent({
    name: 'InstituteAdd',
    data() {
        return {
            formRef: null as any,
            loading: false,
            form: {
                name: '',
                adminId: null as string | null
            },
            admins: [] as any[],
            rules: {
                name: [
                    { required: true, message: '请输入院系名称', trigger: 'blur' },
                    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
                ]
            }
        };
    },
    computed: {
        selectedAdminName(): string {
            if (this.form.adminId === null || this.form.adminId === '') {
                return '暂未分配';
            }
            const admin = this.admins.find((a: any) => a.id === this.form.adminId);
            return admin ? admin.realName : '';
        }
    },
    methods: {
        async submitForm() {
            try {
                const formRef = this.$refs.formRef as any;
                if (!formRef) return;

                const valid = await formRef.validate();
                if (!valid) {
                    ElMessage.error('请填写必填项');
                    return;
                }

                this.loading = true;

                const requestData = {
                    name: this.form.name,
                    adminId: this.form.adminId
                };

                const res = await request.post("/institute/add", requestData);

                if (res.code == 200) {
                    ElMessage.success("院系创建成功");
                    this.$router.push("/admin/institute");
                } else {
                    ElMessage.error("创建失败: " + res.message);
                }
            } catch (error: any) {
                ElMessage.error('创建失败: ' + (error.message || '未知错误'));
            } finally {
                this.loading = false;
            }
        },
        async loadAdmin() {
            try {
                const res = await userApi.getInstituteAdmins();
                this.admins = res.data || [];
            } catch (error) {
                console.error('加载管理员列表失败:', error);
            }
        }
    },
    mounted() {
        this.loadAdmin();
    }
});
</script>

<style scoped>
.institute-add {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 20px;
    padding: 20px;
}

.preview-card {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #e9ecef;
}

.preview-card h3 {
    margin-bottom: 15px;
    color: #333;
    border-bottom: 1px solid #dee2e6;
    padding-bottom: 10px;
}

.preview-content p {
    margin-bottom: 10px;
    color: #666;
}

.form-tip {
    font-size: 12px;
    color: #999;
    margin-top: 5px;
}
</style>