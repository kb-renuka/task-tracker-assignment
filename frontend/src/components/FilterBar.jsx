export default function FilterBar({ filters, onChange }) {
  const update = (key, value) => onChange({ ...filters, [key]: value, page: 1 });

  return (
    <div className="filter-bar">
      <input
        type="text"
        placeholder="Search by title..."
        value={filters.search}
        onChange={(e) => update("search", e.target.value)}
        className="input"
      />

      <select value={filters.status} onChange={(e) => update("status", e.target.value)} className="input">
        <option value="">All Statuses</option>
        <option value="Todo">Todo</option>
        <option value="In Progress">In Progress</option>
        <option value="Done">Done</option>
      </select>

      <select value={filters.priority} onChange={(e) => update("priority", e.target.value)} className="input">
        <option value="">All Priorities</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>

      <select value={filters.sortBy} onChange={(e) => update("sortBy", e.target.value)} className="input">
        <option value="createdAt">Sort: Newest</option>
        <option value="dueDate">Sort: Due Date</option>
        <option value="priority">Sort: Priority</option>
        <option value="title">Sort: Title</option>
      </select>

      <select value={filters.order} onChange={(e) => update("order", e.target.value)} className="input">
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>
    </div>
  );
}
