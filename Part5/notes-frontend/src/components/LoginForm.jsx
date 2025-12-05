import { useState } from 'react'

const LoginForm = ( { handleLogin } ) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleOnSubmit = (event) => {
    event.preventDefault()
    handleLogin({ username, password })
    // 如果你想提交后清空表单：
    setUsername('')
    setPassword('')
  }

  return (
    <div>
      <form onSubmit={handleOnSubmit}>
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
    </div>
  )
}

export default LoginForm