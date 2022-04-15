//注册路由的业务逻辑处理  
// 1.监听登录
// 2.获取登录提交的数据
// 3.校验     判断数据库中是否已经存在数据
// 4.用户名不存在 则返回 用户名不存在,请先注册
// 5.用户名存在 密码不正确  返回您的密码有误
// 6.用户名存在 密码也正确  登录成功   
const express = require('express')
const router = express.Router()

//引入用户表对象
const userDB = require('../../database/userinfo');

router.post('/', async (req, res) => {
  let { username, password } = req.body

  //不信任前端的前提(必须不信任)
  let regUser = /^[\u4E00-\u9FA5A-Za-z][\u4E00-\u9FA5A-Za-z0-9]{0,7}$/
  let regpass = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,16}$/
  if (regUser.test(username) && regpass.test(password)) {
    //校验完成 
    //查询 数据库中是否存在用户名 
    let result = await userDB.findOne({ username }) //有数据返回数据对象 无数据就会返回null 

    if (result) {
      //有存在相同数据  有重名数据 则返回重名 
      if (result.password === password) {
        //登录成功
        //将用户的信息数据存到 session中  
        let userinfo = {
          username: result.username,
          admin: result.admin,
          _id: result._id,
          photo: result.photo,
        }
        req.session.userinfo = userinfo;
        //响应 把session带上 
        res.send({
          code: 0,
          txt: '登录成功',
          data: userinfo
        })


      } else {//密码不匹配
        res.send({
          code: 2,
          txt: '密码不正确'
        })
      }
    } else {
      //用户不存在 请先注册
      res.send({
        code: 3,
        txt: '用户名不存在,请先注册'
      })
    }

  } else {
    res.send({
      code: 1,
      txt: '格式有误'
    })
  }

})

// 检查登录 持久登录 
router.post('/isCheck', (req, res) => {
  let data = req.session.userinfo;
  if (data) {
    res.send({
      code: 0,
      txt: '已经登录',
      data
    })
  } else {
    res.send({
      code: 1,
      txt: '未登录',
      data: {}
    })
  }
})

//退出登录 
router.post('/quitLogin', (req, res) => {
  // console.log(1);
  req.session.destroy()
  res.send({
    code: 0,
    txt: '已退出登录'
  })
})

module.exports = router