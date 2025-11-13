export const Persons = ({ persons }) => (
    <div>
      {persons.map(p => (
        <p key={p.id}>
          {p.name}: {p.number}
        </p>
      ))}
    </div>
  )