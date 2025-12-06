const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog } = require('./helper')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    // empty db
    await request.post('/api/testing/reset')

    // create a user for backend 
    await request.post('/api/users', {
      data: {
        name: 'Jonathan Anderson',
        username: 'testerA',
        password: 'passwordA'
      } 
    })

    await page.goto('/')
  })

  test('Login form is shown', async ({ page }) => {
    const title = page.getByRole('heading', {name: 'Login'})
    const username = page.getByLabel('username')
    const password = page.getByLabel('password')
    const loginBtn = page.getByRole('button', {name: 'Login'})

    await expect(title).toBeVisible()
    await expect(username).toBeVisible()
    await expect(password).toBeVisible()
    await expect(loginBtn).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'testerA', 'passwordA')
      await expect(page.getByText('testerA logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'testerA', 'wrong')
      await expect(page.getByText('wrong credentials')).toBeVisible()
      await expect(page.getByText('testerA logged in')).not.toBeVisible()

      const errorDiv = page.locator('.error')
      await expect(errorDiv).toContainText('wrong credentials')
      await expect(errorDiv).toHaveCSS('border-style', 'solid')
      await expect(errorDiv).toHaveCSS('color', 'rgb(210, 72, 72)')
      await expect(page.getByText('mluukkai logged in')).not.toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'testerA', 'passwordA')
    })
  
    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, 'E2E Test', 'JWA', 'www.github.com')
      const blogItem = page
        .locator('.blog')
        .filter({ hasText: 'E2E Test' })
    
      // 标题可见
      await expect(blogItem.getByText('E2E Test')).toBeVisible()
      // 作者显示
      await expect(blogItem.getByText('By JWA')).toBeVisible()
      // URL 初始时隐藏
      await expect(blogItem.getByText('www.github.com')).not.toBeVisible()   
      // 展开
      await blogItem.getByRole('button', { name: 'view' }).click()
      // URL 显示
      await expect(blogItem.getByText('www.github.com')).toBeVisible()
      await expect(blogItem.getByText('likes: 0')).toBeVisible()
    })

    describe('and a blog exists', () => {
      beforeEach(async ({ page }) => {
        await createBlog(page, 'E2E Test', 'JWA', 'www.github.com')
      })

      test('the blog can be liked.', async ({ page }) => {
        const blogItem = page
          .locator('.blog')
          .filter({hasText: 'E2E Test'})

        await blogItem.getByRole('button', { name: 'view' }).click()
        await expect(blogItem.getByText('likes: 0')).toBeVisible()
        await blogItem.getByRole('button', { name: 'like', exact: true }).click()
        await expect(blogItem.getByText('likes: 1')).toBeVisible()
        await blogItem.getByRole('button', { name: 'like', exact: true }).click()
        await expect(blogItem.getByText('likes: 2')).toBeVisible()
        await blogItem.getByRole('button', { name: 'Dislike', exact: true }).click()
        await expect(blogItem.getByText('likes: 1')).toBeVisible()
      })

      test('the blog can be deleted.', async ({ page }) => {
        const blogItem = page
          .locator('.blog')
          .filter({hasText: 'E2E Test'})

        await blogItem.getByRole('button', { name: 'view' }).click()

        // 监听浏览器弹出的 confirm 对话框，并点击 “OK”
        page.on('dialog', async(dialog) => {
          // 可选：检查弹窗内容是不是你预期的
          await expect(dialog.message()).toContain('remove the blog E2E Test')
          await dialog.accept()
        })

        //不阻塞
        await blogItem.getByRole('button', { name: 'remove' }).click()

        await expect(blogItem).not.toBeVisible()
      })

      test('the blog can not be be deleted by other user', async ({ page, request }) => {
        await page.getByRole('button', { name: 'logout' }).click()

        // an another user sign and login
        await request.post('/api/users', {
          data: {
            name: 'Matthieu Blazy',
            username: 'testerB',
            password: 'passwordB'
          } 
        })
        await loginWith(page, 'testerB', 'passwordB')
        
        const blogItem = page
          .locator('.blog')
          .filter({hasText: 'E2E Test'})

        await blogItem.getByRole('button', { name: 'view' }).click()

        page.on('dialog', async(dialog) => {
          await expect(dialog.message()).toContain('remove the blog E2E Test')
          await dialog.accept()
        })
        await blogItem.getByRole('button', { name: 'remove' }).click()

        await expect(
          page.getByText(/not authorized to delete this blog/i)
        ).toBeVisible()

        await expect(blogItem).toBeVisible()
      })

    })
  })

  test("blogs are arranged in the ascending order according to the likes", async ({ page, request }) => {

    // login to get token
    const loginRes = await request.post('/api/login', {
      data: { username: 'testerA', password: 'passwordA' }
    })
    const body = await loginRes.json()
    const token = body.token

    /// 用 token 创建 4 篇博客
    const authHeader = { Authorization: `Bearer ${token}` }

    await request.post('/api/blogs', {
      headers: authHeader,
      data: { title: 'Second Like', author: 'Tester', url: 'x', likes: 20 }
    })

    await request.post('/api/blogs', {
      headers: authHeader,
      data: { title: 'Least Like', author: 'Tester', url: 'x', likes: 0 }
    })

    await request.post('/api/blogs', {
      headers: authHeader,
      data: { title: 'Third Like', author: 'Tester', url: 'x', likes: 10 }
    })

    await request.post('/api/blogs', {
      headers: authHeader,
      data: { title: 'Most Like', author: 'Tester', url: 'x', likes: 21 }
    })

    await page.goto('/')
    await loginWith(page, 'testerA', 'passwordA')

    const blogItems = page.locator('.blog')
    await expect(blogItems).toHaveCount(4)


    for (let i = 0; i < 4; i++) {
      const blogItem = blogItems.nth(i)
      await blogItem.getByRole('button', { name: 'view' }).click()
    }

    const likes = []
    for (let i = 0; i < 4; i++) {
      const blogItem = blogItems.nth(i)
      const likeText = await blogItem.getByText(/likes: \d+/).innerText()
      const likeCount = parseInt(likeText.replace('likes: ', ''))
      likes.push(likeCount)
    }

    const sortedLikes = [...likes].sort((a, b) => b - a)
    expect(likes).toEqual(sortedLikes)
  })
})
