const CountriesList = ({ countries, onClick }) => {
    return (
      <div>
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          {countries.map(country => (
            <div>
              <li key={country.cca3}>
                {country.name.common}
                <button onClick={()=>onClick(country)}>show</button>
              </li>
            </div>
          ))}
        </ul>
      </div>
    )
  }
  
  export default CountriesList