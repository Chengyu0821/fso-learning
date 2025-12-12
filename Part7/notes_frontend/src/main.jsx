import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter as Router } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
    <Router>
        <App />
    </Router>
)

// 为什么用 useMatch() 就必须把 Router 提到外面？

// 因为 useMatch 是路由 hook，必须在 Router 上下文中执行。
// App 在执行 useMatch 时，还没进入 Router 环境，所以必须把 Router 提到 App 的外层