const assert = require('node:assert')
const { describe, test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog= require('../models/blog')
const api = supertest(app)

beforeEach(async() => {
  await Blog.deleteMany()
  await Blog.insertMany(helper.initialBlogs)
})

describe('when there is initially some blogs saved', () => {

  test('blogs are returned as json', async() => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })
  
  test('blogs are returned with id instead of _id', async() => {
    const response = await api.get('/api/blogs')
    //取1
    const blogToView = response.body[0]
  
    // id 存在
    assert.ok(blogToView.id)
    // _id 不存在
    assert.strictEqual(blogToView._id, undefined)
  
  })
})

describe('addition of a new blog', () => {
  test('create a blog successfully', async() => {
    const newBlog= {
      title: "New Blog",
      author: "Chengyu Li",
      url: "http://www.google.com",
      likes: 3,
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const blogsAtEnd = await helper.blogsInDb()
  
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
  
    const titles = blogsAtEnd.map(b => b.title)
    assert(titles.includes("New Blog"))
  })
  
  test('create a blog that like property is missing, default to 0', async() => {
    const blogsAtBegin = await helper.blogsInDb()
    const newBlog= {
      title: "New Blog without like property",
      author: "Chengyu Li",
      url: "http://www.google.com",
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const blogsAtEnd = await helper.blogsInDb()
  
    assert.strictEqual(blogsAtEnd.length, blogsAtBegin.length + 1)
  
    const blogToView = blogsAtEnd[blogsAtEnd.length - 1]
  
    assert.strictEqual(blogToView.likes, 0)
  })
  
  test('create a blog that title or URL is missing', async() => {
    const blogsAtBegin = await helper.blogsInDb()
    const newBlogNoTitle = {
      author: "Chengyu Li",
      url: "http://www.google.com",
      likes: 2,
    }
  
    await api
      .post('/api/blogs')
      .send(newBlogNoTitle)
      .expect(400)
    
      const newBlogNoURL = {
        title: "URL property is missing",
        author: "Chengyu Li",
        likes: 2,
      } 
  
    await api
      .post('/api/blogs')
      .send(newBlogNoURL)
      .expect(400)
  
    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, blogsAtBegin.length) 
  })

})

describe('viewing a specific blog', () => {
  test('succeeds with a valid id', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToView = blogsAtStart[0]

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.deepStrictEqual(resultBlog.body, blogToView)
  })

  test('fails with statuscode 404 if blog does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()
    await api.get(`/api/blogs/${validNonexistingId}`).expect(404)
  })
})

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    const titles = blogsAtEnd.map(b => b.title)
    assert(!titles.includes(blogToDelete.content))

    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)
  })

  test('delete the blog with invalid Id', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const nonExistingId = await helper.nonExistingId()
    await api.delete(`/api/blogs/${nonExistingId}`).expect(204)
    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
  })
})

describe('updating a blog', () => { 
  test('succeeds in updating the likes of a blog', async () => {
    
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    await api.put(`/api/blogs/${blogToUpdate.id}`)
      .send({ ...blogToUpdate, likes: blogToUpdate.likes + 1 })
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
    const updatedBlog = blogsAtEnd.find(b => b.id === blogToUpdate.id)
    assert.strictEqual(updatedBlog.likes, blogToUpdate.likes + 1)
  })
})
 
 test('updating a blog with invalid id', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const nonExistingId = await helper.nonExistingId()
  await  api.put(`/api/blogs/${nonExistingId}`)
    .send({ likes: 10 })
    .expect(404)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
 })

after(async () => {
  await mongoose.connection.close()
})
