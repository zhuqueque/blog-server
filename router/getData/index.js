const express = require('express')
const router = express.Router()

const userDB = require('../../database/userinfo') //userinfo表的操作对象 

const msgDB = require('../../database/message') //message表的操作对象 
const linkDB = require('../../database/link') //message表的操作对象 

// 请求留言数据
router.get('/msg', async (req, res) => {
  // .populate('author')加了这个 会通过 id 去查询 返回author作者的 userinfo内的表信息 
  // 不要password admin 和 _v 版本号 
  let msgDoc = await msgDB
    .find({}, {}, { sort: { date: -1 } })
    .populate('author', { password: 0, _v: 0, admin: 0 }) //获取author关联表中 除了对象中属性的其他信息
    .populate('children.author', { password: 0, _v: 0, admin: 0 }) //获取查询写子级回复的用户信息
    .populate('children.replyUser', { password: 0, _v: 0, admin: 0 }) //获取子级回复里存储的父级评论的用户信息
  res.send({
    code: 0,
    txt: '成功',
    data: msgDoc
  })
})

//获取友链数据
router.get("/link", async (req,res)=>{
  let linkDoc = await linkDB.find();
  res.send({
      code:0,
      txt:"成功获取友链数据",
      data: linkDoc
  });
});

module.exports = router 