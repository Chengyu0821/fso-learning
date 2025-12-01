import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const [blogs, setBlogs] = useState([])

  const [newTitle, setNewTitle] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [newUrl, setNewUrl] = useState('')

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs )
    )  
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleTitleChange = event => {
    setNewTitle(event.target.value)
  }

  const handleUrlChange = event => {
    setNewUrl(event.target.value)
  }
  const handleAuthorChange = event => {
    setNewAuthor(event.target.value)
  }

  const handleLogin = async event => {
    event.preventDefault()

    try {
      const user = await loginService.login({ username, password })
      window.localStorage.setItem(
        'loggedNoteappUser', JSON.stringify(user)
      ) 

      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
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

  const addBlog = async (event) => {
    event.preventDefault()
    const blogObject = {
      title: newTitle,
      author: newAuthor,
      url: newUrl
    }

    try {
      const returnBlog = await blogService.create(blogObject)
      setBlogs(blogs.concat(returnBlog))

      setNotification({
        message: `a new blog ${returnBlog.title} by ${returnBlog.author} added`,
        type: 'success'
      })
      setTimeout(() => setNotification(null), 5000)

      setNewTitle('')
      setNewAuthor('')
      setNewUrl('')
    } catch (error) {
      setNotification({
        message: error.response?.data?.error || 'failed to create blog',
        type: 'error'
      })
      setTimeout(() => setNotification(null), 5000)
    }
    
  }

  const loginForm = () => {
    return (
    <>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>
            username
            <input
              type="text"
              value={username}
              onChange={({ target }) => setUsername(target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            password
            <input
              type="password"
              value={password}
              onChange={({ target }) => setPassword(target.value)}
            />
          </label>
        </div>
        <button type="submit">login</button>
      </form>
    </>
    )
  }

  const blogForm = () => (
    <form onSubmit={addBlog} className="blogForm">
      <div>
        <label>title:</label>
        <input value={newTitle} onChange={handleTitleChange} />
      </div>
      <div>
        <label>author:</label>
        <input value={newAuthor} onChange={handleAuthorChange} />
      </div>
      <div>
        <label>url:</label>
        <input value={newUrl} onChange={handleUrlChange} />
      </div>

      <button type="submit">create</button>
    </form>
  )


  return (
    <div>
      {/* Notification 全局放在最上面 */}
      <Notification notification={notification} />
  
      {/* 下面再判断用户 */}
      {user === null
        ? loginForm()
        : (
          <div>
            <h2>blogs</h2>
            <p>
              {user.username} logged in <button onClick={handleLogout}>logout</button>
            </p>
            {blogForm()}
            {blogs.map(blog =>
              <Blog key={blog.id} blog={blog} />
            )}
          </div>
        )
      }
    </div>
  )

}

export default App