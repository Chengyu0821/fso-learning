const loginWith = async (page, username, password) => {
    await page.getByRole('button', {name: 'login'}).click()
    await page.getByLabel('username').fill(username)
    await page.getByLabel('password').fill(password)
    await page.getByRole('button', { name: 'login' }).click()
}

const createBlog = async (page, titel, author, url) => {
    await page.getByRole('button', { name: 'Create New Blog' }).click()

    await page.getByLabel('title:').fill(titel)
    await page.getByLabel('author:').fill(author)
    await page.getByLabel('url:').fill(url)

    await page.getByRole('button', { name: 'create' }).click()
  }

export {loginWith, createBlog}