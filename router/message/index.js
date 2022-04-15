const express = require('express')
const router = express.Router()

const userDB = require('../../database/userinfo') //userinfo表的操作对象 

const msgDB = require('../../database/message') //message表的操作对象 

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
//发表 留言的路由 
router.post("/publish", async (req, res) => {
  let { msg } = req.body
  msg = msg.trim()
  // 验证数据格式
  if (!msg || msg.length > 100) {
    return res.send({
      code: 1,
      txt: '提交的留言格式有误'
    })
  }

  // 将评论 存到数据库
  await msgDB.create({
    content: msg,
    author: req.session.userinfo._id //当前发表这条评论的作者的 id 
  })

  res.send({
    code: 0,
    txt: '评论发表成功'
  })

})


router.post('/likes/comment', async (req, res) => {
  let { commentId } = req.body

  if (!commentId) {
    return res.send({
      code: 1,
      txt: '你点赞的评论飞了'
    })
  }
  //  likeUser 点赞人id
  //  commentId 点赞的评论的id

  let msgExist = await msgDB.findById(commentId)

  if (!msgExist) {
    return res.send({
      code: 2,
      txt: '你点赞的评论飞了'
    })
  }
  //判断是否点过赞 
  let userid = req.session.userinfo._id
  let isLike = msgExist.likes.includes(userid)
  if (isLike) { //有点赞 则取消赞
    await msgDB.findByIdAndUpdate(commentId, { $pull: { likes: userid } }) //删除likes 数组中的这个id 

  } else { //没点赞 加上赞
    await msgDB.findByIdAndUpdate(commentId, { $push: { likes: userid } }) //添加likes
  }
  res.send({
    code: 0,
    txt: '操作成功'
  })
})


//处理 二级评论 
router.post('/children', async (req, res) => {
  let { msg, commentId,replyUser } = req.body
  msg = msg.trim()
  // 验证数据格式
  if (!msg || msg.length > 100) {
    return res.send({
      code: 1,
      txt: '提交的回复格式有误'
    })
  }
  if (!commentId) {
    return res.send({
      code: 1,
      txt: '你回复的评论飞了'
    })
  }

  let msgExist = await msgDB.findById(commentId)
  if (!msgExist) {
    return res.send({
      code: 1,
      txt: '你回复的评论飞了'
    })
  }
  //父级评论的作者 是否存在 
  let msg2Exist = await userDB.findById(replyUser)
  if (!msg2Exist) {
    return res.send({
      code: 1,
      txt: '你回复的评论飞了'
    })
  }


  // 将评论 存到数据库replyUser
  await msgDB.findByIdAndUpdate(commentId, {
    $push: {
      children: {
        //留言内容  可以不用必选
        content: msg,
        // 关联字段  回复人的id
        author: req.session.userinfo._id,
        replyUser, //这条回复的父级评论的作者id  被回复人的id 用于 操作 @朱雀 @阿飞
      }
    }
  })
  res.send({
    code: 0,
    txt: '评论发表成功',
    data: {replyUser:replyUser.username}
  })
})


//处理 二级点赞
router.post("/likes/reply", async (req,res)=>{
  let {parentId, childId, childIndex} = req.body;
  let parentDoc =  await msgDB.findById(parentId);//父文档
  let childDoc = await parentDoc.children.id(childId);//子文档。当前点赞的子级回复数据

  //父级评论的id是否存在
  if(!parentDoc) return res.send({code:1, message:"父级评论的id不存在，没有这条父评论"});
  //子级评论的id是否存在
  if(!childDoc) return res.send({code:1, message:"子级评论的id不存在，没有这条子回复"});

  //修改子评论的likes
  let userId = req.session.userinfo._id; //当前发起请求的用户的id
  //判断用户是否点过赞 / 判断当前点击按钮的用户是否存在likes数组中
  if(childDoc.likes.includes(userId)){
      //存在，点过赞了，要取消赞
      await msgDB.findByIdAndUpdate(parentId, { 
          $pull:{
              [`children.${childIndex}.likes`]:userId
          } 
      }); //在数组中删除该用户id
  }else{
      //没点过赞，要点赞
      await msgDB.findByIdAndUpdate(parentId, { 
          $push:{
              [`children.${childIndex}.likes`]:userId
          } 
      }); //在数组中删除该用户id
  }
  res.send({
      code:0,
      txt:"点赞/取消点赞的操作已经完成"
  })
});



module.exports = router