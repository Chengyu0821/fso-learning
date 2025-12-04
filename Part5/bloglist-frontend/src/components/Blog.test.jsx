import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'
import { test } from 'vitest'

describe('Test the Blog Component', () => {
    beforeEach(() => {
        const testBlog = {
            title: "This is for test",
            author: "William Oxford",
            url: "http://localhost:5173/",
            likes: 20
        }
    
        render(<Blog blog={testBlog} />)
    })

    test(`blog's URL and number of likes are shown when the button view are clicked`, () => {
        const titleElement = screen.getByText("This is for test")
        expect(titleElement).toBeVisible()
        const authorElement = screen.getByText("William Oxford", {exact: false})
        expect(authorElement).toBeVisible()
    
        const UrlElement = screen.getByText("http://localhost:5173/")
        expect(UrlElement).not.toBeVisible()
        const likesElement = screen.getByText('likes: 20')
        expect(likesElement).not.toBeVisible()
    })
    
    test('The component does not render its URL or number of likes by default', async() => {
       
        const titleElement = screen.getByText("This is for test")
        expect(titleElement).toBeVisible()
        const authorElement = screen.getByText("William Oxford", {exact: false})
        expect(authorElement).toBeVisible()
        const UrlElement = screen.getByText("http://localhost:5173/")
        expect(UrlElement).not.toBeVisible()
        const likesElement = screen.getByText('likes: 20')
        expect(likesElement).not.toBeVisible()

        const user = userEvent.setup()
        const viewBtn = screen.getByText('view')
        await user.click(viewBtn)
        expect(titleElement).toBeVisible()
        expect(authorElement).toBeVisible()
        expect(UrlElement).toBeVisible()
        expect(likesElement).toBeVisible()

    })

    test('like button is clicked twice, the event handler the component received as props is called twice', async() => {
        const likeBlog = {
            title: "This is for test like",
            author: "Bugs",
            url: "www.chatGPT.com",
            likes: 23
        }
        //故意多增加一个难度，多加一个blog，总共两个Blog 

        // 不真实执行的虚拟函数，记录所有调用信息，数据
        const mockHandler = vi.fn()
        render(<Blog blog={likeBlog} onLike={mockHandler}/>)

        const user = userEvent.setup()
        const viewBtns = screen.getAllByText('view')

        await user.click(viewBtns[1])
        const UrlElement = screen.getByText("www.chatGPT.com")
        expect(UrlElement).toBeVisible()
        const likesElement = screen.getByText('likes: 23')
        expect(likesElement).toBeVisible()

        const likeBtns = screen.getAllByText('like')
        await user.click(likeBtns[1])
        await user.click(likeBtns[1])

        expect(mockHandler.mock.calls).toHaveLength(2)
        console.log(mockHandler.mock.calls)

    })
})
