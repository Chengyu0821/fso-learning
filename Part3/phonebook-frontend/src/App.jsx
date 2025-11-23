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

  const showMessage = (text, isError = false) => {
    setMessage({ message: text, isError })
    setTimeout(() => {
      setMessage({ message: '', isError: false })
    }, 5000)
  }

  useEffect(() => {
    jsonService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
      .catch(error => {
        console.error('Failed to fetch persons:', error)
        const errorMessage =
          error.response?.data?.error || 'Failed to load phonebook from server'
        showMessage(errorMessage, true)
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
        showMessage(`${trimmedName} is added`, false)
      })
      .catch(error => {
        console.error('Failed to add person:', error)
        // 这里是 3.19* 关键：显示后端返回的 validation 错误
        const errorMessage =
          error.response?.data?.error || `Failed to add ${trimmedName}`
        showMessage(errorMessage, true)
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
        showMessage(
          `${person.name} changed the number to ${newNumber}`,
          false
        )
        setNewName('')
        setNewPhone('')
      })
      .catch(error => {
        console.error('Failed to update number:', error)
        // 如果是 404（后端已经删掉），我们按教程给那句提示
        const errorMessage =
          error.response?.data?.error ||
          `'${person.name}' was already removed from server`
        showMessage(errorMessage, true)
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
        showMessage(`${name} is deleted`, false)
      })
      .catch(error => {
        console.error('Failed to delete person:', error)
        const errorMessage =
          error.response?.data?.error || `Failed to delete ${name}`
        showMessage(errorMessage, true)
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
