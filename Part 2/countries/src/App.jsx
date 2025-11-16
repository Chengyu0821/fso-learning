import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'
import CountriesList from './components/CountriesList'
import Country from './components/country'
import Filter from './components/Filter'

const App = () => {
  const [countries, setCountries] = useState([])
  const [filter, setFilter] = useState('')
  const [countryToSelect, setCountryToSelect] = useState(null)

  useEffect(() => {
    axios
      .get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then(response => {
        setCountries(response.data)
      })
      .catch(err => {
        setError('Failed to fetch countries')
        setLoading(false)
      })
  }, [])


  const handleFilter = (event) => {
    setFilter(event.target.value)
    setCountryToSelect(null)
  }

  const handleCountryToSelect = (country) => {
    setCountryToSelect(country)
  }

  const countriesToShow = countries.filter(country =>
    country.name.common.toLowerCase().includes(filter.toLowerCase())
  )

  useEffect(() => {
    if (!filter) {
      setCountryToSelect(null)
      return
    }
  
    if (countriesToShow.length === 1) {
      setCountryToSelect(countriesToShow[0])
    } else {
      setCountryToSelect(null)
    }
  }, [filter, countries])

  const mainToShow = () => {
    if (countryToSelect) {
      return (<Country country={countryToSelect}/>)
    } else if (countriesToShow.length > 10) {
      return <p>Too many matches, specify another filter</p>
    } else if (countriesToShow.length > 1) {
      return (
        <CountriesList countries={countriesToShow} onClick={handleCountryToSelect}/>
      )
    } else {
      return null
    }
  }

  return (
    <div>
      <Filter filter={filter} handleFilter={handleFilter}/>
      {mainToShow()}
    </div>
  )
}

export default App
