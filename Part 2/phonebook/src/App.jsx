import { useState } from 'react'
import { Filter } from './Components/Filter'
import { PersonForm } from './Components/PersonForm'
import { Persons } from './Components/Persons'

const App = () => {
  const [persons, setPersons] = useState([
    { name: 'Arto Hellas', number: '040-123456', id: 1 },
    { name: 'Ada Lovelace', number: '39-44-5323523', id: 2 },
    { name: 'Dan Abramov', number: '12-43-234345', id: 3 },
    { name: 'Mary Poppendieck', number: '39-23-6423122', id: 4 }
  ])

  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [filter, setFilter] = useState('')

  const handleNameChange = (event) => {
    console.log(event.target.value)
    setNewName(event.target.value)
  }
  const handlePhoneChange = (event) => {
    console.log(event.target.value)
    setNewPhone(event.target.value)
  }
  
  const handleFilter = (event) => {
    console.log(event.target.value)
    setFilter(event.target.value)
  }

  const addPerson= (event) => {
    event.preventDefault()
    const newPersonObject = { name: newName, number: newPhone}

    persons.map(p => p.name).includes(newName)
    ? alert(newName + ' is already added to phonebook')
    : setPersons(persons.concat(newPersonObject))
  }

  const personsToShow = filter === ''
  ? persons
  : persons.filter(
    p => p.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div>
      <h2>Phonebook</h2>

      <Filter filter={filter} handleFilter={handleFilter} />

      <h3>add a new</h3>
      <PersonForm
        addPerson={addPerson}
        newName={newName}
        newPhone={newPhone}
        handleNameChange={handleNameChange}
        handlePhoneChange={handlePhoneChange}
      />

      <h3>Numbers</h3>
      <Persons persons={personsToShow} />
    </div>
  )
}

export default App
