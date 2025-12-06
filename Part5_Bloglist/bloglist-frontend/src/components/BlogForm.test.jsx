import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogFrom from './BlogForm'
import { test, vi, expect } from 'vitest'

test('calls createBlog when a new blog is created', async () => {

  // 不真实执行的虚拟函数，记录所有调用信息，数据
  const createBlog = vi.fn()

  render(<BlogFrom createBlog={createBlog} />)
  const user = userEvent.setup()

  //htmlFor绑定
  const titleInput = screen.getByLabelText('title:')
  const authorInput = screen.getByLabelText('author:')
  const urlInput = screen.getByLabelText('url:')

  await user.type(titleInput, 'a new Blog created by test')
  await user.type(authorInput, 'tester')
  await user.type(urlInput, 'www.google.com')

  const createbtn = screen.getByText('create')
  await user.click(createbtn)

  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog.mock.calls[0][0].title).toBe('a new Blog created by test')
  expect(createBlog.mock.calls[0][0].author).toBe('tester')
  expect(createBlog.mock.calls[0][0].url).toBe('www.google.com')
})