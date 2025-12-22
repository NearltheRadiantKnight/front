const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
    transpileDependencies: true,

    //-----------------------Axios跨域请求-----------------------------------------
    devServer:{
        port:8080,
        host:"127.0.0.1",
        https:false,
        open:false,
        proxy: {
            '/api': {  //为用于替换的的标识字符串
                target: 'http://localhost:8081',
                changeOrigin: true,
                ws: true,
                pathRewrite: {
                    '^/api': ''
                }
            },
            /* 可以同步配置多个转发目标
            '/phpUrl': {  //为用于替换的的标识字符串
              target: 'http://192.168.1.8:8080/VueApi',//Axios跨域请求的IP
              changeOrigin: true,
              ws: true,
              pathRewrite: {
                  '^/phpUrl': '' //不用改
              }
           }  */

        }
    }
    //----------------------------------------------------------------------------

})
