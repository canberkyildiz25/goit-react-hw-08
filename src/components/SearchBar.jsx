function SearchBar({ value, onChange }) {
  return (
    <label className="search-bar">
      Search
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by name, phone, or email"
      />
    </label>
  )
}

export default SearchBar
