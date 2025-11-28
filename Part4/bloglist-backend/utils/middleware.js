const logger = require('./logger')
const jwt = require('jsonwebtoken')

const User = require('../models/user')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  // 现在 blog 还没用到 CastError / ValidationError，也可以先留着
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).json({ error: 'expected `username` to be unique' })
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({
      error: 'token expired'
    })
  }
  next(error)
}

const tokenExtractor = (request, response, next) => {
  // code that extracts the token
  const authorization = request.get('authorization')
  // console.log('AUTHORIZATION HEADER:', authorization)
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    // return authorization.replace('Bearer  ', '')
    request.token = authorization.substring(7)
  } else {
    request.token = null
  }

  next()
}

const userExtractor = async (request, response, next) => {
  const token = request.token
  console.log('Authorization header:', request.get('authorization'))
  console.log('request.token =', request.token)

  if (!token) {
    return response.status(401).json({ error: 'token missing' })
  }

  let decodedToken
  try {
    /*
    JWT（JSON Web Token）结构：
    header.payload.signature
    ① 解码 payload（payload 是可读的）
    ② 用 SECRET 验证“签名是否正确”（核心）
    ③ 检查 token 是否过期
    */
    decodedToken = jwt.verify(request.token, process.env.SECRET)

    /*这里的 decodedToken 就是你当初写进 token 的 payload 对象
    例如
    {
      username: 'lcy',
      id: '67890',
      iat: 1700625604,   // issued at
      exp: 1700629204    // expires
    }
  */

  } catch (error) {
    console.log('jwt.verify error:', error.name, error.message)
    return response.status(401).json({ error: 'token invalid' })
  }

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  request.user = await User.findById(decodedToken.id)


  next()
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor,
}