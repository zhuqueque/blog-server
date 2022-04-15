//注册路由的业务逻辑处理  
// 1.监听注册
// 2.获取注册提交的数据
// 3.校验     判断数据库中是否已经存在重名数据
// 4.不存在 注册成功 新增数据库数据 
// 5.存在 返回您的用户名已经存在    
const express = require('express')
const router = express.Router()

//引入用户表对象
const userDB = require('../../database/userinfo');

//注册账号 总路由过来 /reg 所以此处不要在写/reg  不然的话 就是 /reg/reg 
router.post('/', async (req, res)=>{
  //get 提交的数据 req.query 
  //post 提交的数据 req.body 
  // console.log(req.body);
  let {username,password}  = req.body

  //不信任前端的前提(必须不信任)
  let regUser = /^[\u4E00-\u9FA5A-Za-z][\u4E00-\u9FA5A-Za-z0-9]{0,7}$/
  let regpass = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,16}$/
  if(regUser.test(username) && regpass.test(password)){ 
    //校验完成 
    //查询 数据库中是否已经存在重名数据  异步操作  result不一定 在同步获取时 能得到正确结果
    let result = await userDB.findOne({username}) //有数据返回数据对象 无数据就会返回null 

    if(result){
      //有存在相同数据  有重名数据 则返回重名 
      res.send({
        code : 2 ,
        txt :'用户已存在'
      })
    }else{
      //用户不存在 则添加  密码要做加密处理 一般是不对称加密 MD5 
      let userObj = await userDB.create({username,password}) //等待出完结果 在返回数据给前端
      let {photo,admin} = userObj
      res.send({
        code:0,
        txt:'注册成功,请登录',
        photo,
        admin,
        username,
        password
      })
    }
    
  }else{
    //校验失败
    // res.send('格式有误')
    res.send({ //通常 数据接口 约定 通过返回自定义的 状态码 以表示当前失败的类型 
      code:1 ,//格式不标准
      // code:2  其他的一些情况  
      txt:'格式有误'
    })
  }
  
})

module.exports = router 