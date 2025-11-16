const Filter = ({ filter, handleFilter }) => {
  return (
    <div>
        find countries{' '}
      <input
        placeholder="eg. China"
        value={filter}
        onChange={handleFilter}
      />
    </div>
  )
}

export default Filter

