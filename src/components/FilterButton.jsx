const filterOptions = [
  { value: 'all', label: 'All Tasks' },
  { value: 'done', label: 'Completed' },
  { value: 'active', label: 'Active' },
  { value: 'incomplete', label: 'Incomplete' },
]

function FilterButton({ activeFilter, counts, onFilterChange }) {
  return (
    <div className="task-filters" role="group" aria-label="Filter tasks">
      {filterOptions.map((option) => {
        const isActive = activeFilter === option.value

        return (
          <button
            key={option.value}
            type="button"
            className={`task-filters__button${isActive ? ' task-filters__button--active' : ''}`}
            onClick={() => onFilterChange(option.value)}
            aria-pressed={isActive}
          >
            <span>{option.label}</span>
            <span className="task-filters__count">{counts[option.value]}</span>
          </button>
        )
      })}
    </div>
  )
}

export default FilterButton
