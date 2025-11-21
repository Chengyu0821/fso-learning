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

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
      response.json(persons)
    })
  })

// app.get('/api/info', (request, response) => {
//     response.send(`
//       <p>Phonebook has info for ${persons.length} people</p>
//       <p>${new Date()}</p>
//     `)
// })

// --- 定义自定义 token ---
morgan.token('body', (req) => {
    return req.method === 'POST' ? JSON.stringify(req.body) : ' '
  })
  
  // --- 使用 tiny 模板 + 添加 body ---
app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms :body')
)

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })
})

// app.delete('/api/persons/:id', (request, response) => {
//     const id = request.params.id
//     persons = persons.filter(p => p.id !== id)
//     response.status(204).end()
// })


app.post('/api/persons', (req, res) => {
    const body = req.body

    if (!body.name || !body.number) {
        return res.status(400).json({
          error: 'name or number is missing',
        })
    }

    // if (persons.find(p => p.name === body.name)) {
    //     return res.status(400).json({
    //         error: 'name must be unique',
    //     })
    // }
    

    const person = new Person({
        name: body.name, 
        number: body.number,
    })

    person.save().then(savedPerson => {
      res.json(savedPerson)
    })

})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})