//创建表规则 得到表操作对象 
const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const userSchema = new Schema({ //用户表规则 
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  admin: { //就我一个管理员  
    type: Boolean,
    default: false
  },
  photo: {
    type: String,
    default: '/images/photo/lovely.gif'
  }
})

//导出userinfo 表的操作对象 以便在其他地方可以操作表  添加 查询 等操作 
module.exports = mongoose.model('userinfo', userSchema)