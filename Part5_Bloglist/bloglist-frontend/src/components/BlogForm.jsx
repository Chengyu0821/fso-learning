import { useState } from 'react'

const BlogForm = ({ createBlog }) => {
  const [newTitle, setNewTitle] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [newUrl, setNewUrl] = useState('')

  const addBlog = (event) => {
    event.preventDefault()
    createBlog({
      title: newTitle,
      author: newAuthor,
      url: newUrl
    })

    setNewTitle('')
    setNewAuthor('')
    setNewUrl('')
  }

  return(
    <form onSubmit={addBlog} className="blogForm">
      <div>
        <label htmlFor="title">title:</label>
        <input
          id = "title"
          value={newTitle}
          onChange={event => setNewTitle(event.target.value)}
        />
      </div>
      <div>
        <label htmlFor="author">author:</label>
        <input
          id = "author" 
          value={newAuthor}
          onChange={event => setNewAuthor(event.target.value)}
        />
      </div>
      <div>
        <label htmlFor="url">url:</label>
        <input
          id = "url" 
          value={newUrl}
          onChange={event => setNewUrl(event.target.value)}
        />
      </div>

      <button type="submit">create</button>
    </form>
  )

}

export default BlogForm