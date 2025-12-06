import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import BlogForm from './components/BlogForm'
import LoginForm from './components/LoginForm'
import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs )
    )
  }, [])

  useEffect(() => {
    // 1. 从浏览器的 localStorage 中获取存储的用户登录信息
    //    'loggedNoteappUser' 是存储时使用的键名
    const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')

    // 2. 检查是否存在存储的用户信息
    if (loggedUserJSON) {
      // 3. 将 JSON 字符串解析为 JavaScript 对象
      const user = JSON.parse(loggedUserJSON)

      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async (username, password) => {
    try {
      const user = await loginService.login({ username, password })
      // 将用户对象存储到浏览器的 localStorage 中
      window.localStorage.setItem(
        'loggedNoteappUser',      // 键名：用于后续检索的标识符
        JSON.stringify(user)      // 值：将用户对象转换为 JSON 字符串存储
      )

      blogService.setToken(user.token)
      setUser(user)

      setNotification({ message: `welcome ${user.username}`, type: 'success' })
      setTimeout(() => setNotification(null), 5000)
    } catch {
      setNotification({ message: 'wrong credentials', type: 'error' })
      setTimeout(() => {
        setNotification(null)
      }, 5000)
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedNoteappUser')
    blogService.setToken(null)
    setUser(null)
  }

  const addBlog = async (blogObject) => {
    try {
      const returnBlog = await blogService.create(blogObject)
      setBlogs(blogs.concat(returnBlog))

      setNotification({
        message: `a new blog ${returnBlog.title} by ${returnBlog.author} added`,
        type: 'success'
      })
      setTimeout(() => setNotification(null), 5000)

    } catch (error) {
      setNotification({
        message: error.response?.data?.error || 'failed to create blog',
        type: 'error'
      })
      setTimeout(() => setNotification(null), 5000)
    }
  }

  const deleteBlog = async (blog) => {
    const ok = window.confirm(`remove the blog ${blog.title} by ${user.username}`)

    if (!ok) {
      return
    }

    const idToDelete = blog.id

    try {
      await blogService.remove(idToDelete)

      setBlogs(prevBlogs =>
        prevBlogs.filter(b => b.id !== idToDelete)
      )
    } catch (error) {
      setNotification({
        message: error.response?.data?.error || 'Delete blog failed',
        type: 'error'
      })
      setTimeout(() => setNotification(null), 5000)
    }
  }

  const blogForm = () => (
    <Togglable buttonLabel='Create New Blog'>
      <BlogForm createBlog={addBlog}/>
    </Togglable>
  )

  /* Handle the like event */
  const handleLike = async (blog, isLike) => {
    const newLike = isLike ? blog.likes + 1 : blog.likes - 1

    const newBlog = {
      ...blog,
      likes: newLike
    }

    try {
      const updatedBlog = await blogService.update(blog.id, newBlog)
      setBlogs(prevBlogs =>
        prevBlogs.map(oldBlog =>
          oldBlog.id === blog.id ? updatedBlog : oldBlog
        )
      )
    } catch (error) {
      setNotification({
        message: error.response?.data?.error || 'Update blog failed',
        type: 'error'
      })
      setTimeout(() => setNotification(null), 5000)
    }
  }

  return (
    <div>
      <Notification notification={notification} />

      {/* 下面再判断用户 */}
      {user === null
        ? (
          <LoginForm handleLogin={handleLogin}/>
        )
        : (
          <div>
            <h2>blogs</h2>
            <p>
              {user.username} logged in <button onClick={handleLogout}>logout</button>
            </p>
            {blogForm()}
            {[...blogs] //不拷贝会原地修改数组本身, 不安全
              .sort((a, b) => b.likes - a.likes)
              .map(blog =>
                <Blog key={blog.id} blog={blog} onLike={handleLike} remove={deleteBlog} />
              )}
          </div>
        )
      }
    </div>
  )

}

export default App