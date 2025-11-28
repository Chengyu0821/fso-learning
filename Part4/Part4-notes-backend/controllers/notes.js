const notesRouter = require('express').Router()
// 核心要点： .Router() 的实际作用 = 允许你写“后缀路径”
// 补充： 可挂载的、可配置的、可复用的子应用，小型app（）

const Note = require('../models/note')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  // console.log('AUTHORIZATION HEADER:', authorization)
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    // return authorization.replace('Bearer  ', '')
    return authorization.substring(7)
  }
  return null
}

notesRouter.get('/', async (request, response) => { 
  const notes = await Note
    .find({}).populate('user', { username: 1, name: 1 })
  response.json(notes)
})

notesRouter.get('/:id', async (request, response) => {
  const note = await Note.findById(request.params.id)
    
  if (note) {
      response.json(note)
    } else {
      response.status(404).end()
    }
  }
    
)

notesRouter.post('/', async (request, response) => {
  const body = request.body
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = await User.findById(decodedToken.id)

  // const user = await User.findById(body.userId)

  if (!user) {
    return response.status(400).json({ error: 'userId missing or not valid' })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
    user: user._id
  })

  const savedNote = await note.save()
  user.notes = user.notes.concat(savedNote._id)
  await user.save()
  response.status(201).json(savedNote)
})

notesRouter.delete('/:id', async (request, response) => {
  await Note.findByIdAndDelete(request.params.id)

  response.status(204).end()
})

notesRouter.put('/:id', async (req, res) => {
  const { content, important } = req.body

  const updatedNote = await Note.findByIdAndUpdate(
    req.params.id,                     // 要更新的文档的 MongoDB _id
    { content, important },            // 更新哪些字段
    { new: true, runValidators: true } // 可选配置
  )
  // new: true → 返回更新后的对象
  // runValidators: true → 让 Mongoose validation 也跑

  if (!updatedNote) {
    return res.status(404).end()
  }

  res.json(updatedNote)
})

module.exports = notesRouter