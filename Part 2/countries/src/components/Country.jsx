import Weather from "./Weather"

const Country = ({ country }) => {
    return (
        <div>
            <h1>{country.name.common}</h1>
            <p>capital {country.capital?.[0]}</p>
            <p>area {country.area}</p>

            <h2>Languages</h2>
            <ul>
                {country.languages &&
                Object.values(country.languages).map(lang => (
                    <li key={lang}>{lang}</li>
                ))}
            </ul>

            <img
                src={country.flags.png}
                alt={country.flags.alt ?? `Flag of ${country.name.common}`}
            />
        
            <Weather capital={country.capital[0]}/>
        </div>
    )
}

export default Country