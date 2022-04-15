const express = require('express')
const router = express.Router()

//注册路由 总路由 
router.use("/reg",require("./register/index"))

//登录路由
router.use("/login",require("./login/index"))

//监听修改用户信息 的路由 
router.use("/personal",require("./personal/index"))
// /personal/user 
// /personal/pass 
// /personal/photo 


//监听评论 的路由  避免和前端路由冲突  
router.use("/msg",require("./message/index"))
// /msg/publish

//监听获取评论 / 文章  的路由 
router.use("/getdata",require("./getData/index"))
// /msg/publish


//监听后台管理的操作路由
router.use("/administer", require("./admin/index")); 



module.exports = router  