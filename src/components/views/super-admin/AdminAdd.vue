<template>
    <div class="admin-add">
        <el-card class="form-card">
            <template #header>
                <span><i class="el-icon-user"></i> 创建院系管理员</span>
            </template>

            <el-form ref="formRef" :model="form" :rules="rules" label-width="140px">
                <!-- 基本信息 -->
                <el-divider content-position="left">基本信息</el-divider>
                <el-form-item label="管理员姓名" prop="realName" required>
                    <el-input
                            v-model="form.realName"
                            placeholder="请输入管理员真实姓名"
                            style="width: 300px;"
                    />
                </el-form-item>

                <el-form-item label="所属院系" prop="institute" required>
                    <el-select
                            v-model="form.institute"
                            placeholder="请选择所属院系"
                            style="width: 300px;"
                            @change="handleInstituteChange"
                    >
                        <el-option
                                v-for="institute in availableInstitutes"
                                :key="institute.id"
                                :label="institute.name"
                                :value="institute.id"
                        />
                    </el-select>
                    <div class="form-tip">只能选择未安排管理员的院系</div>
                </el-form-item>

                <!-- 登录信息 -->
                <el-divider content-position="left">登录信息</el-divider>
                <el-form-item label="登录用户名" prop="username" required>
                    <el-input
                            v-model="form.username"
                            placeholder="请输入登录用户名"
                            style="width: 300px;"
                    />
                    <div class="form-tip">建议使用英文用户名，3-20个字符</div>
                </el-form-item>

                <el-form-item label="登录密码" prop="password" required>
                    <el-input
                            v-model="form.password"
                            type="password"
                            placeholder="请输入登录密码"
                            style="width: 300px;"
                            show-password
                    />
                    <div class="form-tip">密码长度6-20个字符</div>
                </el-form-item>

                <el-form-item label="确认密码" prop="confirmPassword" required>
                    <el-input
                            v-model="form.confirmPassword"
                            type="password"
                            placeholder="请再次输入密码"
                            style="width: 300px;"
                            show-password
                    />
                </el-form-item>

                <!-- 联系方式 -->
                <el-divider content-position="left">联系方式</el-divider>
                <el-form-item label="手机号码" prop="phone">
                    <el-input
                            v-model="form.phone"
                            placeholder="请输入手机号码"
                            style="width: 300px;"
                    />
                </el-form-item>

                <el-form-item label="电子邮箱" prop="email">
                    <el-input
                            v-model="form.email"
                            placeholder="请输入邮箱地址"
                            style="width: 300px;"
                    />
                </el-form-item>

                <!-- 提交按钮 -->
                <el-form-item>
                    <el-button type="primary" @click="submitForm" :loading="loading">
                        <i class="el-icon-check"></i> 创建管理员
                    </el-button>
                    <el-button @click="resetForm">
                        <i class="el-icon-refresh"></i> 重置
                    </el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 账号信息预览 -->
        <el-card class="preview-card" v-if="showPreview">
            <template #header>
                <span><i class="el-icon-info"></i> 账号信息预览</span>
            </template>
            <div class="preview-content">
                <p><strong>管理员姓名：</strong>{{ form.realName }}</p>
                <p><strong>所属院系：</strong>{{ selectedInstituteName || form.institute }}</p>
                <p><strong>登录用户名：</strong>{{ form.username }}</p>
                <p><strong>登录密码：</strong>{{ form.password }}</p>
                <p><strong>联系电话：</strong>{{ form.phone || '未填写' }}</p>
                <p><strong>邮箱地址：</strong>{{ form.email || '未填写' }}</p>
                <p><strong>创建时间：</strong>{{ previewInfo.createTime }}</p>
                <p><strong>账号状态：</strong>
                    <el-tag type="success" size="small">正常</el-tag>
                </p>
            </div>
            <div class="preview-tips">
                <p>✅ 请将此信息告知管理员</p>
                <p>✅ 建议首次登录后修改密码</p>
                <p>✅ 管理员可在院系管理页面重置密码</p>
            </div>
        </el-card>
    </div>
</template>

<script lang="ts">
import {defineComponent, ref, reactive, onMounted, computed} from 'vue';
import {ElMessage, FormInstance} from 'element-plus';
import request from '@/api';
import {instituteApi} from "@/api/institute.ts";
import {userApi} from "@/api/user.ts";

export default defineComponent({
    name: 'AdminAdd',
    methods:{
        loadAvailableInstitutes(){
            // 加载所有未安排管理员的院系
            instituteApi.getAvailableInstitutes().then((res:any)=>{
                this.instituteList = res.data;
            });
        },
    },
    mounted(): any {
        this.loadAvailableInstitutes();
    },
    setup() {
        const formRef = ref<FormInstance>();
        const loading = ref(false);
        const showPreview = ref(false);
        const instituteList = ref([]);

        const form = reactive({
            realName: '',
            institute: '',  // 改为单个院系ID
            username: '',
            password: '',
            confirmPassword: '',
            phone: '',
            email: ''
        });

        const previewInfo = reactive({
            createTime: new Date().toLocaleString()
        });

        // 计算属性：可用的院系（未安排管理员的）
        const availableInstitutes = computed(() => {
            return instituteList.value;
        });

        // 计算属性：选中的院系名称
        const selectedInstituteName = computed(() => {
            if (!form.institute) return '';
            const institute = instituteList.value.find((inst: any) => inst.id === form.institute);
            return institute ? institute.name : '';
        });

        const handleInstituteChange = (value: string) => {
            console.log('选择的院系ID:', value);
        };

        const validatePassword = (rule: any, value: string, callback: any) => {
            if (value !== form.password) {
                callback(new Error('两次输入密码不一致'));
            } else {
                callback();
            }
        };

        const validateUsername = (rule: any, value: string, callback: any) => {
            if (!/^[a-zA-Z][a-zA-Z0-9_]{2,19}$/.test(value)) {
                callback(new Error('用户名必须以字母开头，3-20位字母数字下划线'));
            } else {
                callback();
            }
        };

        const rules = {
            realName: [
                {required: true, message: '请输入管理员姓名', trigger: 'blur'},
                {min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur'}
            ],
            institute: [
                {required: true, message: '请选择所属院系', trigger: 'change'}
            ],
            username: [
                {required: true, message: '请输入登录用户名', trigger: 'blur'},
                {validator: validateUsername, trigger: 'blur'}
            ],
            password: [
                {required: true, message: '请输入密码', trigger: 'blur'},
                {min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur'}
            ],
            confirmPassword: [
                {required: true, message: '请确认密码', trigger: 'blur'},
                {validator: validatePassword, trigger: 'blur'}
            ],
            phone: [
                {pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur'}
            ],
            email: [
                {type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur'}
            ]
        };

        const submitForm = async () => {
            if (!formRef.value) return;

            const valid = await formRef.value.validate();
            if (!valid) return;

            loading.value = true;

            // 构造提交数据
            const submitData = {
                realName: form.realName,
                institute: form.institute,  // 单个院系ID
                username: form.username,
                password: form.password,
                phone: form.phone,
                email: form.email
            };

            userApi.createInstituteAdmin(submitData).then((res:any)=>{
                if (res.code === 200) {
                    ElMessage.success({
                        message: '院系管理员创建成功',
                        duration: 3000
                    });
                    showPreview.value = true;
                    previewInfo.createTime = new Date().toLocaleString();
                } else {
                    ElMessage.error(res.message || '创建失败');
                }
            }).catch((error:any)=>{
                ElMessage.error('创建失败，请重试: ' + error.message);
            }).finally(()=>{
                loading.value = false;
            });
        };

        const resetForm = () => {
            if (!formRef.value) return;
            formRef.value.resetFields();
            showPreview.value = false;
        };

        return {
            formRef,
            form,
            previewInfo,
            instituteList,
            availableInstitutes,
            selectedInstituteName,
            rules,
            loading,
            showPreview,
            submitForm,
            resetForm,
            handleInstituteChange
        };
    }
});
</script>

<style scoped>
.admin-add {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 20px;
}

.form-card {
    border-radius: 8px;
}

.preview-card {
    border-radius: 8px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border: 1px solid #dee2e6;
}

.preview-content p {
    margin-bottom: 10px;
    color: #495057;
    font-size: 14px;
    line-height: 1.8;
}

.preview-content strong {
    color: #212529;
    min-width: 100px;
    display: inline-block;
}

.preview-tips {
    margin-top: 20px;
    padding: 15px;
    background: #e3f2fd;
    border-radius: 4px;
    border-left: 4px solid #2196f3;
}

.preview-tips p {
    margin: 5px 0;
    color: #1976d2;
    font-size: 13px;
}

.form-tip {
    font-size: 12px;
    color: #6c757d;
    margin-top: 5px;
}

.el-divider {
    margin: 25px 0;
}
</style>