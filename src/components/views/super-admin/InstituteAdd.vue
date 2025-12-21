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

                <el-form-item label="院长" prop="dean">
                    <el-select placeholder="选择院长"
                               v-model="form.deanId"
                               clearable
                               filterable
                    >
                        <el-option v-for="item in admins"
                                   :label="item.realName"
                                   :key="item.id"
                                   :value="item.id"
                                   @click.native="()=>{form.deanName=item.realName;}"
                                   ></el-option>
                    </el-select>
                </el-form-item>

                <el-form-item label="联系电话" prop="phone">
                    <el-input v-model="form.phone" placeholder="请输入联系电话"/>
                </el-form-item>

                <el-form-item label="邮箱地址" prop="email">
                    <el-input v-model="form.email" placeholder="请输入邮箱地址"/>
                </el-form-item>

                <el-form-item label="办公地址" prop="address">
                    <el-input v-model="form.address" placeholder="请输入办公地址"/>
                </el-form-item>

                <el-form-item label="院系简介" prop="description">
                    <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入院系简介"/>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="submitForm" :loading="loading">创建院系</el-button>
                    <el-button @click="resetForm">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <div class="preview-card">
            <h3>院系信息预览</h3>
            <div class="preview-content">
                <p><strong>院系名称：</strong>{{ form.name || '未填写' }}</p>
                <p><strong>院长：</strong>{{ form.deanName || '未填写' }}</p>
                <p><strong>联系电话：</strong>{{ form.phone || '未填写' }}</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import {ElMessage, type FormInstance} from 'element-plus';
import request from "@/api";
import {userApi} from "@/api/user.ts";

export default defineComponent({
    name: 'InstituteAdd',
    data(){
        return{
            formRef:ref<FormInstance>(),
            loading : ref(false),
            form : {
                name: '',
                deanName: '',
                deanId:'',
                phone: '',
                email: '',
                address: '',
                description: ''
            },
            admins:[]
        }
    },
    methods: {
        submitForm(){
            this.loading = true;
            request.post("/institute/add", {...this.form})
                    .then((res:any)=>{
                        if (res.code == 200) {
                            this.$router.push("/institute");
                            ElMessage.success("院系创建成功");
                        }
                        else{
                            ElMessage.error("创建失败");
                        }
                    }).catch(error=>{
                ElMessage.error('创建失败');
            }).finally(()=>{
                this.loading = false;
            });
        },
        resetForm() {
            if (!this.formRef.value) return;
            this.formRef.value.resetFields();
        },
        loadAdmin() {
            userApi.getInstituteAdmins().then((res: any) => {
                console.log(res.data)
                this.admins = res.data
            });
        }
    },
    mounted(): any {
      this.loadAdmin();
    },
    setup() {
        const rules = {
            name: [
                {required: true, message: '请输入院系名称', trigger: 'blur'},
                {min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur'}
            ],
            code: [
                {required: true, message: '请输入院系代码', trigger: 'blur'},
                {pattern: /^[A-Z]{2,6}$/, message: '请输入2-6位大写字母代码', trigger: 'blur'}
            ],
            email: [
                {type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur'}
            ],
            phone: [
                {pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur'}
            ]
        };

        return {
            rules,
        };
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
