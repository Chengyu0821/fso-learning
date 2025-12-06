const assert = require('node:assert')
const { describe, test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog= require('../models/blog')
const api = supertest(app)

const bcrypt = require('bcrypt')
const User = require('../models/user')

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
  let token

  beforeEach(async () => {
    // 这里只处理用户，博客仍然使用最外层 beforeEach 已经插入的 initialBlogs
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })
    await user.save()

    const loginRes = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret' })
      .expect(200)

    token = loginRes.body.token
  })


  test('create a blog successfully', async() => {
    const newBlog= {
      title: 'New Blog',
      author: 'Chengyu Li',
      url: 'http://www.google.com',
      likes: 3,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(b => b.title)
    assert(titles.includes('New Blog'))
  })

  test('create a blog that like property is missing, default to 0', async() => {
    const blogsAtBegin = await helper.blogsInDb()
    const newBlog= {
      title: 'New Blog without like property',
      author: 'Chengyu Li',
      url: 'http://www.google.com',
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
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
      author: 'Chengyu Li',
      url: 'http://www.google.com',
      likes: 2,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlogNoTitle)
      .expect(400)

    const newBlogNoURL = {
      title: 'URL property is missing',
      author: 'Chengyu Li',
      likes: 2,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
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
  let token
  let blogToDelete

  beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    // 先创建 root 用户
    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })
    await user.save()

    const loginRes = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret' })
      .expect(200)

    token = loginRes.body.token

    const newBlog = {
      title: 'blog to delete',
      author: 'Chengyu Li',
      url: 'http://example.com',
      likes: 1,
    }

    const createdBlogResponse = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    blogToDelete = createdBlogResponse.body
  })

  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    const titles = blogsAtEnd.map(b => b.title)
    assert(!titles.includes(blogToDelete.content))

    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)
  })

  test('delete the blog with invalid Id', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const nonExistingId = await helper.nonExistingId()

    await api
      .delete(`/api/blogs/${nonExistingId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)

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

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('expected `username` to be unique'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if username length is less than 3', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'YZ',
      name: 'Ethan He',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('username'))
    assert(result.body.error.includes('is shorter than the minimum allowed length'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails with invalid passward', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'YZHE',
      name: 'Ethan He',
      password: '12',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('password must be at least 3 characters long'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

})

describe('login', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('succeeds with valid username and password', async () => {
    const result = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret' })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    // 返回里应该有 token、username 等
    assert.ok(result.body.token)
    assert.strictEqual(result.body.username, 'root')
    // 如果你在 login 响应里还有 name，可以顺带断言一下
    // assert.strictEqual(result.body.name, 'Matti Luukkainen')
  })

  test('fails with 401 if username does not exist', async () => {
    const result = await api
      .post('/api/login')
      .send({ username: 'nonexisting', password: 'sekret' })
      .expect(401)
      .expect('Content-Type', /application\/json/)

    // FSO 推荐统一用 "invalid username or password"
    assert(result.body.error.includes('invalid'))
  })

  test('fails with 401 if password is wrong', async () => {
    const result = await api
      .post('/api/login')
      .send({ username: 'root', password: 'wrongpassword' })
      .expect(401)
      .expect('Content-Type', /application\/json/)

    assert(result.body.error.includes('invalid'))
  })
})

describe('unothorized cases', () => {
  let userBToken
  let userAToken
  let blogIdByA
  beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    // create the userA
    const passwordHashA = await bcrypt.hash('passwordA', 10)
    const userA = new User({ username: 'userA', passwordHash: passwordHashA })
    await userA.save()

    const loginA = await api
      .post('/api/login')
      .send({ username: 'userA', password: 'passwordA' })

    userAToken = loginA.body.token

    // create the userB
    const passwordHashB = await bcrypt.hash('passwordB', 10)
    const userB = new User({ username: 'userB', passwordHash: passwordHashB })
    await userB.save()

    const loginB = await api
      .post('/api/login')
      .send({ username: 'userB', password: 'passwordB' })

    userBToken = loginB.body.token

    const newBlog = {
      title: 'blog for test',
      author: 'Chengyu Li',
      url: 'http://example.com',
      likes: 1,
    }

    const createdBlog= await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${userAToken}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    blogIdByA = createdBlog.body.id
  })

  test('userB cannot delete blog created by userA', async () => {
    const blogsAtStart = await helper.blogsInDb()

    await api
      .delete(`/api/blogs/${blogIdByA}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .expect(403)

    const blogsAtEnd = await helper.blogsInDb()

    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
  })


  test('unorthorised user post', async () => {
    const newBlog2 = {
      title: 'blog for test2',
      author: 'Chengyu Li',
      url: 'http://example.com',
      likes: 1,
    }

    const blogsAtStart = await helper.blogsInDb()

    await api
      .post('/api/blogs')
      .send(newBlog2)
      .expect(401)

    const blogsAtEnd = await helper.blogsInDb()

    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
  })

  test('unorthorised user delete', async () => {
    const blogsAtStart = await helper.blogsInDb()

    await api
      .delete(`/api/blogs/${blogIdByA}`)
      .expect(401)

    const blogsAtEnd = await helper.blogsInDb()

    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
  })
})

after(async () => {
  await mongoose.connection.close()
})
