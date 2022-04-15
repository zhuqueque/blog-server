//对后台管理的路由监听的入口文件
const express = require("express");
const router = express.Router();

//鉴权：判断当前发起请求的用户是否具备管理员权限
router.use((req,res,next)=>{
    //判断用户是否已登录(在线) || 该用户的admin是否为true
    if(!req.session.userinfo || (!req.session.userinfo.admin)){
        // 用户没有登录    接着执行后面的    用户的admin为false
        return res.send({code:6, txt:"您没有管理员权限，请以管理员的账号登录"})
    }
    next();
});

router.post("/isCheck", (req,res)=>{
    res.send({code:0, txt:"欢迎管理员登录"});
});

//监听 对友链增删改的路由
router.use("/link", require("./link"));  


module.exports = router;

// // /administer/link/addData
