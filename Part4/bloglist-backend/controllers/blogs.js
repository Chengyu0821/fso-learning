const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const middleware = require('../utils/middleware')


blogsRouter.get('/', async(request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { blogs: 0 })

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

blogsRouter.post('/', middleware.userExtractor, async(request, response) => {
  const body = request.body
  const user = request.user

  if (!user) {
    return response.status(400).json({ error: 'userId is missing or not valid' })
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id
  })

  const savedBlog = await blog.save()

  // 将新创建的 blog 的 id 添加到 user.blogs 数组中
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', middleware.userExtractor, async(request, response) => {
  // find the blog
  const blogId = request.params.id
  const blog = await Blog.findById(blogId)
  if (!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  const user = request.user

  if ( blog.user.toString() !== user.id.toString() ) {
    return response.status(403).json({ error: 'not authorized to delete this blog' })
  }

  await Blog.findByIdAndDelete(blogId)
  return response.status(204).end()

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