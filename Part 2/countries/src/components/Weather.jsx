import { useEffect, useState } from 'react'
import axios from 'axios'


const Weather = ( {capital} ) => {
    const [weather, setWeather] = useState(null)

    useEffect(() => {
        if (!capital) {
            return
        }

        const api_key = import.meta.env.VITE_SOME_KEY

        axios
            .get(`https://api.openweathermap.org/data/2.5/weather?q=${capital}&units=metric&appid=${api_key}`)
            .then(res => setWeather(res.data))
            .catch(err => console.error("Failed to fetch weather", err))

    }, [capital])

    if (!weather) return <p>Loading weather...</p>

    return (
        <div>
        <h3>Weather in {capital}</h3>
        <p>Temperature: {weather.main.temp} °C</p>
        <p>Wind: {weather.wind.speed} m/s</p>
    </div>
  )
}

export default Weather