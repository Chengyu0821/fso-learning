const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]


const url = `mongodb+srv://420600821lcy_db_user:${password}@cluster0.3a2phip.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)


mongoose.connect(url, { family: 4 })


const phonebookSchema = new mongoose.Schema({
  name: String,
  number: String,
})


const Person = mongoose.model('Person', phonebookSchema)

if (process.argv.length === 3) {
  Person
    .find({})
    .then(persons => {
      persons.forEach(person => {
        console.log(person)
      })
      mongoose.connection.close()
    })

} else if (process.argv.length === 5) {
  const name = process.argv[3]
  const number = process.argv[4]

  const person = new Person({
    name: name,
    number: number,
  })

  person.save().then(() => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
} else {
  console.log('usage:')
  console.log('  node mongo.js <password>           # list all')
  console.log('  node mongo.js <password> <name> <number>  # add one')
  mongoose.connection.close()
}



