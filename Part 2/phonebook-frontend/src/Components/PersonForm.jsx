export const PersonForm = ({
    addPerson,
    newName,
    newPhone,
    handleNameChange,
    handlePhoneChange,
  }) => (
    <form onSubmit={addPerson}>
      <div>
        name: <input value={newName} onChange={handleNameChange} />
        <br />
        phone: <input value={newPhone} onChange={handlePhoneChange} />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )