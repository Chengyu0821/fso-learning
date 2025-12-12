import { useState, useEffect } from 'react'
import axios from 'axios'

export const useCountries = () => {
    const [countries, setCountries] = useState([])

    useEffect(() => {
        axios
          .get('https://studies.cs.helsinki.fi/restcountries/api/all')
          .then(response => {
            setCountries(response.data)
          })
        //   .catch(err => {
        //     setError('Failed to fetch countries')
        //     setLoading(false)
        //   })
      }, [])

    return countries
}

