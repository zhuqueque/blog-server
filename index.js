const express = require('express')
const app = express()

//监听端口
app.listen(4000)

//连接数据库
require("./middle/mongooes")

//中间件
app.use(express.json())//对提交的数据进行格式化处理 

app.use(express.urlencoded({ extended: true })) //提前处理请求传过来的数据 
//静态目录 
app.use(express.static('./public'))

//允许跨域 
app.use(require('./middle/cors'))

//配置 session  会在所有的请求对象身上 添加一个 session对象 req.session
app.use(require('./middle/session'))

//设置路由监听  :  所有路由 都在 router index.js中处理  
app.use('/', require("./router/index"))

// 单页面 不管去哪个页面 都在根组件下 
/* 
  session 服务端 
  cookie 客户端 

  1.用户登录成功后 在服务端接收到的request中设置session里的内容 
  2.session 配置 要给cookie里添加一条关键数据 
  3.当每次发起请求时，cookie过来到后端时，session会去识别cookie里面有没有对应的数据 

*/