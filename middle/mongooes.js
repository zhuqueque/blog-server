const mongooes = require('mongoose')

mongooes.connect("mongodb://localhost:27017/zhuqueBlog", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => { console.log('数据库连接成功'); })
  .catch(() => { console.log("数据库连接失败"); })