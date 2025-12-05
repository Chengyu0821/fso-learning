const { test, describe, expect, beforeEach } = require('@playwright/test')
const { loginWith, createNote } = require('./helper')

describe('Note app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset') //frontend already connect to backend in proxy
    await request.post('/api/users', {
      data: {
        name: 'Matti Luukkainen',
        username: 'mluukkai',
        password: 'salainen'
      }
    })

    await page.goto('/')
    // base url in config
  })

  test('front page can be opened', async ({ page }) => {
    const locator = page.getByText('Notes')
    await expect(locator).toBeVisible()
    await expect(
      page.getByText(
        'Note app, Department of Computer Science, University of Helsinki 2025'
      )
    ).toBeVisible()
  })

  test('user can log in', async ({ page }) => {
    await loginWith(page, 'mluukkai', 'salainen')

    await expect(page.getByText('mluukkai logged in')).toBeVisible()
  })

  test('login fails with wrong password', async({ page }) => {
    await loginWith(page, 'mluukkai', 'wrong')
    // await expect(page.getByText('wrong credentials')).toBeVisible()
    const errorDiv = page.locator('.error')
    await expect(errorDiv).toContainText('wrong credentials')
    await expect(errorDiv).toHaveCSS('border-style', 'solid')
    await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)')
    await expect(page.getByText('Matti Luukkainen logged in')).not.toBeVisible()
  })

  describe('when logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen')
    })

    test('a new note can be created', async ({ page }) => {
      await createNote(page, 'a note created by playwright')
      await expect(page.getByText('a note created by playwright')).toBeVisible()
    })

    describe('and a note exists', () => {
      beforeEach(async ({ page }) => {
        await createNote(page, 'another note by playwright')
      })

      test('importance can be changed', async ({ page }) => {
        await expect(page.getByText('make important')).not.toBeVisible()
        await page.getByRole('button', { name: 'make not important' }).click()
        await expect(page.getByText('make important')).toBeVisible()
        await expect(page.getByText('make not important')).not.toBeVisible()
      })
    })

    describe('and several notes exists', () => {
      beforeEach(async ({ page }) => {
        await createNote(page, 'first note')
        await createNote(page, 'second note')
        await createNote(page, 'third note')
      })

      test.only('one of those can be made nonimportant', async ({ page }) => {
        test.setTimeout(10_000)
      
        // 方法一：getByText + locator('..') —— 教程里的写法
        const secondNoteElement = page.getByText('second note').locator('..')

        // 找到文本为 'second note' 的元素（通常是一个 <span> 或 <p>）
        // 再从这个元素往上（父元素）导航
        // 定位到 'second note'的元素的整个note
        // 注意li style问题 (CSS已经修改)

        await secondNoteElement
          .getByRole('button', { name: 'make not important' })
          .click()
        
        await expect(
          secondNoteElement.getByText('make important')
        ).toBeVisible()
      
        // 方法二：推荐的结构式写法 —— locator + filter
        const thirdNoteElement = page
          .locator('li.note')                 // 所有同时满足：标签是 <li>，class 名是 note 的元素
          .filter({ hasText: 'third note' })
          //  filter narrow down to the li element that contains the text third note
      
        await thirdNoteElement
          .getByRole('button', { name: 'make not important' })
          .click()
        await expect(
          thirdNoteElement.getByText('make important')
        ).toBeVisible()
      })
    })
  })
})
