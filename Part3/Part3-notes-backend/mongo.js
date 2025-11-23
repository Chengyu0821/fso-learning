const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

// 连接字符串里的 `noteApp` 就是数据库名称
// 👉 MongoDB Atlas 不需要提前手动创建数据库
// 只要这里写了新名字（例如 noteApp），
// 在程序第一次向里面 save 数据时，Atlas 就会自动创建对应的 database。
const url = `mongodb+srv://420600821lcy_db_user:${password}@cluster0.3a2phip.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0`

// strictQuery: false 的意思是 —— 不强制按照 Schema 里的字段来解析查询条件。
// 若设为 true，查询条件里出现 Schema 之外的字段会报 warning。
// 默认要升级成 true，但 FSO 教程为了避免 warning，先显式设为 false。
mongoose.set('strictQuery',false)

// mongoose.connect：建立与 MongoDB Atlas 的 TCP 连接。
// { family: 4 } 的意思是强制使用 IPv4 连接。
// Atlas 只支持 IPv4，不强制设置有时会导致 “IPv6 连接失败” 的错误。
mongoose.connect(url, { family: 4 })

// 定义一个 Schema（模式），用于描述 document 在数据库里的结构
// MongoDB 本身是 schemaless（无固定结构的）
// 但 Mongoose 会在“应用层”给数据定义一个固定结构，以保证数据干净、可控
const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})

/*
const Note = mongoose.model('Note', noteSchema)

  第一个参数 'Note' 是“模型名称”（Model Name）
  ⚠️ Mongoose 会根据这个名称生成 collection 名：

      'Note' → 小写 → 'note' → 复数 → 'notes'

  所以最终数据库里的 collection 名会是：
      notes

  第二个参数是该模型使用的 Schema
*/
const Note = mongoose.model('Note', noteSchema)

const note = new Note({
  content: 'mongo.js is not easy',
  important: true,
})

note.save().then(() => {
  console.log('note saved!')
  // 关闭数据库连接，如果不关闭，程序不会退出
  // 因为保存是异步操作，只有在 .then() 回调里才能确保数据库写入已经完成，关闭连接才安全
  mongoose.connection.close()
})

// 📌 为什么关闭数据库连接必须写在 then() 里？
//
// 1) note.save() 是异步操作（需要时间和网络延迟）。
//    程序不会等待它立即完成。
//
// 2) 如果你把 mongoose.connection.close() 放在 save() 外面：
//
//       note.save()
//       mongoose.connection.close()   ← 会立即执行！！
//
//    程序会立刻把连接关掉，
//    导致 save() 的异步操作还没来得及写入数据库，连接就断了。
//    👉 数据永远不会被写入，程序直接退出。
//
// 3) 因此：必须等 save() 成功完成之后再关闭连接。
//    Promise.then() 的回调只会在保存成功后执行，
//    所以把 close() 放在回调内部是唯一正确方式。



