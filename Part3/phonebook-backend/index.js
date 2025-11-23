require('dotenv').config()

const express = require('express')
const app = express()
const Person = require('./models/persons')
const morgan = require('morgan')

app.use(express.static('dist'))
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello backend!')
})

app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
  Person.countDocuments({})
    .then(count => {
      response.send(`
        <p>Phonebook has info for ${count} people</p>
        <p>${new Date()}</p>
      `)
    })
    .catch(error => next(error))
})

// --- 定义自定义 token ---
morgan.token('body', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : ' '
})

// --- 使用 tiny 模板 + 添加 body ---
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
)

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findByIdAndDelete(id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))

})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'name or number is missing',
    })
  }

  Person.find({ name: body.name })
    .then(existingPersons => {
      if (existingPersons.length > 0) {
        return res.status(400).json({
          error: 'name must be unique',
        })
      }

      const person = new Person({
        name: body.name,
        number: body.number,
      })

      person.save()
        .then(savedPerson => {
          res.json(savedPerson)
        })
        .catch(error => next(error))
    })
    .catch(error => next(error))

})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(request.params.id)
    .then(updatedPerson => {
      if (!updatedPerson) {
        return response.status(404).end()
      }

      updatedPerson.name = name
      updatedPerson.number = number

      updatedPerson.save()
        .then(savedPerson => {
          response.json(savedPerson)
        })
        .catch(error => next(error))
    })
    .catch(error => next(error))
})


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})