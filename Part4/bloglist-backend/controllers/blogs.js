const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', (request, response) => {
  Blog.find({}).then((blogs) => {
    response.json(blogs)
  })
})

blogsRouter.post('/', (request, response, next) => {
  const blog = new Blog(request.body)

  blog
    .save()
    .then((savedBlog) => {
      response.status(201).json(savedBlog)
    })
    .catch(next) // 交给 errorHandler
})

module.exports = blogsRouter