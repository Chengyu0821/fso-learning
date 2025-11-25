const blogsRouter = require('express').Router()
const { request, response } = require('../app')
const Blog = require('../models/blog')

blogsRouter.get('/', async(request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.get('/:id', async(request, response) => {
  const blog = await Blog.findById(request.params.id)

  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogsRouter.post('/', async(request, response) => {
  const body = request.body
  const blog = new Blog(request.body)

  const savedBlog = await blog.save()
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async(request, response) => {
  await Blog.findByIdAndDelete(request.params.id) 
  response.status(204).end()
})

blogsRouter.put('/:id', async(request, response) => {
  const { title, url, author, likes } = request.body

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,                   // 要更新的文档的 MongoDB _id
    { title, url, author, likes },       // 更新哪些字段
    { new: true, runValidators: true }   // 可选配置
  ) 
  // new: true → 返回更新后的对象
  // runValidators: true → 让 Mongoose validation 也跑

  if (!updatedBlog) {
    return response.status(404).end()
  }

  response.json(updatedBlog)
})

module.exports = blogsRouter