import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Note from './Note'
import { test } from 'vitest'

test('renders content', () => {
    const note ={
        content: 'This is a test note',
        important: true
    }

    render(<Note note={note} />)

    const element = screen.getByText('This is a test note', { exact: false })
    expect(element).toBeDefined()
})

test('does not render this', () => {
    const note = {
      content: 'This is a reminder',
      important: true
    }
  
    render(<Note note={note} />)
  
    const element = screen.queryByText('do not want this thing to be rendered')
    expect(element).toBeNull()
  })

test('clicking the button calls event handler once', async () => {
    const note = {
        content: 'This is a clickable note',
        important: false
    }

    // 不真实执行的虚拟函数，记录所有调用信息，数据
    const mockHandler = vi.fn()
    
    render(<Note note={note} toggleImportance={mockHandler} />)

    const user = userEvent.setup()
    const button = screen.getByText('make important')

    await user.click(button)
    expect(mockHandler.mock.calls).toHaveLength(1)

})