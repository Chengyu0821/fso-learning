import { useState, useEffect } from 'react'
import jsonService from './services/notes'

import { Filter } from './Components/Filter'
import { PersonForm } from './Components/PersonForm'
import { Persons } from './Components/Persons'
import Notification from './Components/Notification'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [filter, setFilter] = useState('')
  const [message, setMessage] = useState({ message: '', isError: false })

  useEffect(() => {
    jsonService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
      .catch(error => {
        console.error('Failed to fetch persons:', error)
        setMessage({
          message: 'Failed to load phonebook from server',
          isError: true,
        })
        setTimeout(() => {
          setMessage({ message: '', isError: false })
        }, 5000)
      })
  }, [])

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handlePhoneChange = (event) => {
    setNewPhone(event.target.value)
  }

  const handleFilter = (event) => {
    setFilter(event.target.value)
  }

  const addPerson = (event) => {
    event.preventDefault()

    const trimmedName = newName.trim()
    const trimmedPhone = newPhone.trim()

    if (!trimmedName || !trimmedPhone) {
      window.alert('Name and phone cannot be empty')
      return
    }

    const existing = persons.find(p => p.name === trimmedName)

    if (existing) {
      changeNumber(existing, trimmedPhone)
      return
    }

    const newPersonObject = { name: trimmedName, number: trimmedPhone }

    jsonService
      .create(newPersonObject)
      .then(returnedPerson => {
        setPersons(prev => prev.concat(returnedPerson))
        setNewName('')
        setNewPhone('')
        setMessage({ message: `${trimmedName} is added`, isError: false })
      })
      .catch(error => {
        console.error('Failed to add person:', error)
        setMessage({
          message: `Failed to add ${trimmedName}`,
          isError: true,
        })
        setTimeout(() => {
          setMessage({ message: '', isError: false })
        }, 5000)
      })
  }

  const changeNumber = (person, newNumber) => {
    if (person.number === newNumber) {
      window.alert(`${person.name} already has this number`)
      return
    }

    const ok = window.confirm(
      `${person.name} is already added to phonebook, replace the old number with a new one?`
    )

    if (!ok) return

    const updatedPerson = { ...person, number: newNumber }

    jsonService
      .update(person.id, updatedPerson)
      .then(returnedPerson => {
        setPersons(prev =>
          prev.map(p => (p.id === person.id ? returnedPerson : p))
        )
        setMessage({
          message: `${person.name} changed the number to ${newNumber}`,
          isError: false,
        })
        setNewName('')
        setNewPhone('')
      })
      .catch(error => {
        console.error('Failed to update number:', error)
        setMessage({
          message: `'${person.name}' was already removed from server`,
          isError: true,
        })
        setTimeout(() => {
          setMessage({ message: '', isError: false })
        }, 5000)
        // 用 prev，避免用到旧的 persons
        setPersons(prev => prev.filter(p => p.id !== person.id))
      })
  }

  const deletePerson = (id, name) => {
    const ok = window.confirm(`Delete ${name}?`)
    if (!ok) return

    jsonService
      .remove(id)
      .then(() => {
        setPersons(prev => prev.filter(person => person.id !== id))
        setMessage({ message: `${name} is deleted`, isError: false })
      })
      .catch(error => {
        console.error('Failed to delete person:', error)
        setMessage({
          message: `Failed to delete ${name}`,
          isError: true,
        })
        setTimeout(() => {
          setMessage({ message: '', isError: false })
        }, 5000)
      })
  }

  const personsToShow = filter
    ? persons.filter(p =>
        p.name.toLowerCase().includes(filter.toLowerCase())
      )
    : persons

  return (
    <div>
      <h2>Phonebook</h2>
      {message.message === '' ? null : <Notification message={message} />}

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
      <Persons persons={personsToShow} deletePerson={deletePerson} />
    </div>
  )
}

export default App
