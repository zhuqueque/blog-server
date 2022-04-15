const express = require("express");
const router = express.Router();
const userDB = require("../../database/userinfo");
const fs = require('fs')

const multer = require('multer')

const path = require('path')

//鉴权：判断用户是否在线（登录） 防止未登录 的 提交操作 
// 请求到这里 进行处理  中间件处理  或者也可以在前端发起请求时 鉴别一下是否登录 vuex中的userinfo 
router.use((req, res, next) => {
  if (!req.session.userinfo) {
    return res.send({
      code: 5,
      txt: '未登录,不能修改个人信息'
    })
  }

  next()
})



router.post("/user", async (req, res) => {
  let { username } = req.body;
  let regUser = /^[\u4E00-\u9FA5A-Za-z][\u4E00-\u9FA5A-Za-z0-9]{0,7}$/
  if (regUser.test(username)) {
    // 判断新名字与数据库里的名字是否一致
    if (username === req.session.userinfo.username) {
      return res.send({
        code: 2,
        txt: "新用户名与原用户名是相同的，不可以修改"
      })
    }

    //验证用户名和密码是否正确
    let userDoc = await userDB.findOne({ username });
    if (userDoc) {
      return res.send({
        code: 3,
        txt: "该用户名已经被别人用了，请更换一个"
      })
    }

    //修改数据库中该数据的用户名
    await userDB.findByIdAndUpdate(req.session.userinfo._id, { username }); //{ username:username }

    //更新session里存储的用户的名字
    req.session.userinfo.username = username;
    res.send({
      code: 0,
      txt: "修改成功",
      data: req.session.userinfo   //提供最新的用户信息给前端
    })

  } else {
    res.send({
      code: 1, //你发过来的数据格式不规范
      txt: "你发过来的数据格式不规范"
    })
  }
});
router.post("/pass", async (req, res) => {
  let { password, password1 } = req.body;
  let regpass = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,16}$/
  if (regpass.test(password) && regpass.test(password1)) {
    // 判断密码与数据库里的密码是否一致
    let user = await userDB.findById(req.session.userinfo._id)

    if (password !== user.password) {
      return res.send({
        code: 2,
        txt: "修改失败:您的原密码有误 请确认后重试"
      })
    }

    if (password === password1) {
      return res.send({
        code: 3,
        txt: "修改失败:新密码不可与原密码相同"
      })
    }
    //修改数据库中该数据的密码
    await userDB.findByIdAndUpdate(req.session.userinfo._id, { password: password1 }); //{ username:username }

    res.send({
      code: 0,
      txt: "修改成功",
      data: req.session.userinfo   //提供最新的用户信息给前端
    })

  } else {
    res.send({
      code: 1, //你发过来的数据格式不规范
      txt: "修改失败:你发过来的数据格式不规范"
    })
  }
});



/* 
  请求图片缓存现象  
    第一次请求图片: http://localhost:8080/images/1.jpg
    修改图片后 图片在服务端的名字 还叫 1.jpg
    ( 浏览器会认为是同一张 图片 而去使用缓存 不会请求更新后的图片 )
    第二次请求图片: http://localhost:8080/images/1.jpg
*/
router.post("/photo", async (req, res) => {
  // 配置multer中间件处理表单上传的图片文件

  let photoName = null
  let upload = multer({
    storage: multer.diskStorage({ //配置项
      //配置项图片 设置文件存储在服务端的哪个目录
      destination(req, file, cb) {
        cb(null, path.join(__dirname, '../../public/images/photo'))
      },
      //设置文件名字 (防重名)   请求图片缓存现象  
      filename(req, file, cb) {
        let { ext } = path.parse(file.originalname);
        photoName = req.session.userinfo._id + new Date().getTime() + ext;


        cb(null, photoName);
      }
    })
  }).single("file"); //处理name名为file的控件上传的图片文件   name值要匹配


  upload(req, res, async (err) => {
    if (err) {
      res.send({
        code: 4,
        txt: "头像上传失败"
      })
    } else { //文件已经存储到服务端的指定目录了
      let photo = `/images/photo/${photoName}`;
      //改数据库里图片的路径
      await userDB.findByIdAndUpdate(req.session.userinfo._id, { photo });

      // 删除文件中的原头像  不要删默认图啊 
      if (!req.session.userinfo.photo.includes('lovely.gif')) {
        fs.unlink(path.join(__dirname, '../../public') + "/" + req.session.userinfo.photo, (err) => {

        })
      }


      //改session里图片的路径
      req.session.userinfo.photo = photo;

      //响应前端
      res.send({
        code: 0,
        txt: "头像修改成功",
        data: req.session.userinfo
      })
    }
  });
});


module.exports = router;