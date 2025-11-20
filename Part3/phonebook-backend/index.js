const express = require('express')
const app = express()
const morgan = require('morgan')

app.use(express.static('dist'))
app.use(express.json())

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (req, res) => {
    res.send('Hello backend!')
  })

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/info', (request, response) => {
    response.send(`
      <p>Phonebook has info for ${persons.length} people</p>
      <p>${new Date()}</p>
    `)
})

// --- 定义自定义 token ---
morgan.token('body', (req) => {
    return req.method === 'POST' ? JSON.stringify(req.body) : ' '
  })
  
  // --- 使用 tiny 模板 + 添加 body ---
app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms :body')
)

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(p => p.id === id)
  
    if (person) {
      res.json(person)
    } else {
      res.status(404).end()
    }
  })

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(p => p.id !== id)
    response.status(204).end()
})

const generateId = () => {
    const maxId =
      persons.length > 0 ? Math.max(...persons.map((p) => Number(p.id))) : 0
    return String(maxId + 1)
}

app.post('/api/persons', (req, res) => {
    const body = req.body

    if (!body.name || !body.number) {
        return res.status(400).json({
          error: 'name or number is missing',
        })
    }

    if (persons.find(p => p.name === body.name)) {
        return res.status(400).json({
            error: 'name must be unique',
        })
    }
    

    const person = {
        id: generateId(),
        name: body.name, 
        number: body.number,
    }

    persons = persons.concat(person)

    res.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})