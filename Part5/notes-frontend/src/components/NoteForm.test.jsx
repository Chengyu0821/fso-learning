import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NoteFrom from './NoteForm';
import { expect } from 'vitest';


test('calls createNote when a new note is created', async () => {
    const createNote = vi.fn()

    render(<NoteFrom createNote={createNote} />)

    const user = userEvent.setup()

    // get input elelemnt, 默认输入框是textbox角色
    const input = screen.getByRole('textbox')

    // const input = screen.getByLabelText('content')

    const button = screen.getByText('save')

    await user.type(input, 'a new note created by test')
    await user.click(button)

    expect(createNote.mock.calls).toHaveLength(1)
    expect(createNote.mock.calls[0][0].content).toBe('a new note created by test')
    console.log(createNote.mock.calls)
   
})