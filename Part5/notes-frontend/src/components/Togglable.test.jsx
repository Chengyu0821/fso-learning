import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Togglable from './Togglable'
import { beforeEach, test } from 'vitest'

describe('Togglable component', () => {
    beforeEach(() => {
        render(
            <Togglable buttonLabel="show...">
                <div className="testDiv">togglable content</div>
            </Togglable>
        )
    })

    test('renders its children', () => {
        screen.getByText('togglable content')
    })

    test('at start the children are not displayed', () => {
        // 组件一开始 确实渲染了这个元素 (在 DOM 里),元素存在
        const element = screen.getByText('togglable content')

        // 但它被 style 隐藏了（比如 display: none, 用户看不到
        expect(element).not.toBeVisible()
    })

    test('after clicking the button, children are displayed', async () => {
        const user = userEvent.setup()
        const button = screen.getByText('show...')
        await user.click(button)

        const element = screen.getByText('togglable content')
        expect(element).toBeVisible()
    })

    test('hide content after clicking the cancel button', async () => {
        const user = userEvent.setup()
        const showButton = screen.getByText('show...')
        await user.click(showButton)

        const hideButton = screen.getByText('cancel')
        await user.click(hideButton)

        const element = screen.getByText('togglable content')
        expect(element).not.toBeVisible()
        
    })

})


