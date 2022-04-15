//创建表规则 得到表操作对象 
const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const msgSchema = new Schema({ //用户表规则 
  // 留言用户 留言内容 留言时间 点赞数  回复留言(二级评论/子评论)   要和userinfo的用户 进行一个关联
  content: { //留言内容 
    type: String,
    required: true
  },
  time: {//时间以后端为准
    type: Number,
    default: Date.now() //自动生成时间戳 (毫秒数)
  },
  likes: [//区分谁点击的 爱心  用数组 存所有点赞了这条评论的用户 _id 
    { type: Schema.Types.ObjectId },
  ],
  // 关联字段
  author: { //当前发表这条评论的用户 
    type: Schema.Types.ObjectId,
    ref: 'userinfo',//关联到用户信息表 
    required: true
  },

  children: [ //回复留言(二级评论/子评论) 子文档
    {
      //留言内容  可以不用必选
      content: String,
      time: {//时间以后端为准
        type: Number,
        default: Date.now() //自动生成时间戳 (毫秒数)
      },
      likes: [//区分谁点击的 爱心  用数组 存所有点赞了这条评论的用户 _id 
        { type: Schema.Types.ObjectId },
      ],
      // 关联字段
      author: { //写回复的用户
        type: Schema.Types.ObjectId,
        ref: 'userinfo',//关联到用户信息表
      },
      replyUser: { //当前回复的 作者的id 
        type: Schema.Types.ObjectId,
        ref: 'userinfo',//关联到用户信息表
      },
    }
  ]
})

//导出 message 表的操作对象 以便在其他地方可以操作表  添加 查询 等操作 
module.exports = mongoose.model('message', msgSchema)