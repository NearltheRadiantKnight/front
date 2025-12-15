<script lang="ts">
  export default {
    name: 'login',
    data(){
      return{
        user:{
          username:'',
          password:'',
        }
      }
    },
    methods:{
      login(){
        this.$axios({
          url:'/login',
          method:'post',
          data:{
            ...this.user
          }
        }).then((res: any)=>{
          console.log(res)
        })
      }
    }
  }
</script>

<template>
  <div id="login" class="bg">
<!--    <el-header></el-header>-->
    <el-row class="main-container">
      <el-col class="login-container" :lg="8" :xs="16" :md="10" :span="16">
        <div class="top">
          <span class="title">答辩管理系统</span>
        </div>
        <div class="bottom">
          <div class="content">
            <p class="title">账号登录</p>
            <el-form :label-position="'left'" label-width="80px" :model="user">
              <el-form-item label="用户名：">
                <el-input v-model="user.username" placeholder="请输入用户名"></el-input>
              </el-form-item>
              <el-form-item label="密码：">
                <el-input v-model="user.password" placeholder="请输入密码" type="password"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="login">登录</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </el-col>
    </el-row>
<!--    <el-footer></el-footer>-->
  </div>
</template>

<style scoped>
#login {
  font-size: 14px;
  color: #000;
  background-color: #fff;
}
.bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  overflow-y: auto;
  height: 100%;
  background: url('../../assets/img/loginbg.png')center top / cover no-repeat;
  background-color: #b6bccdd1 !important;
}
#login .main-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
#login .main-container .login-container {
}
#login .main-container .login-container .top {
  font-size: 30px;
  color: #ff962a;
  justify-content: center;
  display: flex;
}
#login .main-container .login-container .top .title{
  margin-top: 20px;
}
#login .main-container .login-container .bottom{
  display: flex;
  justify-content: center;
  background-color: #fff;
  border-radius: 5px;

}
#login .main-container .login-container .bottom .content{
}
#login .main-container .login-container .bottom .content .title{
  margin:30px 0px;
  text-align: center;
  font-size: 30px;
}
</style>
