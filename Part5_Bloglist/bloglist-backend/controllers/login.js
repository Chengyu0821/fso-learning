const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  const user = await User.findOne({ username })
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  // Token生成过程
  // 1️⃣ userForToken 是一个普通的 JS 对象
  const userForToken = {
    username: user.username,
    id: user._id,
    //数据库内部永远是 _id, id是给前端永德
  }

  // 2️⃣ jwt.sign() 会把这个对象“加密+签名”成一串字符串
  // 3️⃣ SECRET 是签名密钥
  const token = jwt.sign(
    userForToken,
    process.env.SECRET,
    // 4️⃣ token expires in 60*60 seconds, that is, in one hour)
    { expiresIn: 60*60 }
  )

  // 5️⃣ 后续请求前端带上 token

  response
    .status(200)
    .send({
      token,
      username: user.username,
      name: user.name
    })

})

module.exports = loginRouter

