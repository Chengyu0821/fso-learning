export const Persons = ({ persons, deletePerson }) => (
    <div>
      {persons.map(p => (
        <p key={p.id}>
          {p.name}: {p.number} 
          <button onClick={() => deletePerson(p.id, p.name)}>delete</button>
        </p>
      ))}
    </div>
  )