import { useState } from 'react'

const Blog = ({ blog, onLike, remove }) => {
  const [visible, setVisible] = useState(false)

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  const showWhenVisible = { display: visible ? '' : 'none' }
  const label = visible ? 'hide' : 'view'


  return (
    <div className="blog">
      <div>
        <strong>{blog.title}</strong>
        <div>By {blog.author} <button onClick={toggleVisibility}>{label}</button></div>
      </div>

      <div style={showWhenVisible}>
        <div>{blog.url}</div>
        <div>
          likes: {blog.likes}
          <button onClick={() => onLike(blog, true)}>like</button>
          <button onClick={() => onLike(blog, false)}>Dislike</button>
        </div>
        <button className="removeBtn" onClick={() => remove(blog)}>Remove</button>
      </div>
    </div>
  )
}

export default Blog