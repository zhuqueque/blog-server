//创建表规则 得到表操作对象 
const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const linkSchema = new Schema({ //用户表规则  
  //友链名 链接 图标 描述
  linkname:{
    type:String,
    required:true
  },
  home:{
    type:String,
    required:true
  },
  logo:{ 
    type:String,
    default:false
  },
  description:{
    type:String,
    default:'该帅比没有任何描述 帅就完事了' 
  }
})

//导出userinfo 表的操作对象 以便在其他地方可以操作表  添加 查询 等操作 
module.exports = mongoose.model('linkinfo',linkSchema)