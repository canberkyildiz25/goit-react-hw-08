function FilterBar({ value, onChange }) {
  return (
    <label className="filter-bar">
      Filter
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="all">All contacts</option>
        <option value="hasEmail">Has email</option>
        <option value="hasPhone">Has phone</option>
      </select>
    </label>
  )
}

export default FilterBar
