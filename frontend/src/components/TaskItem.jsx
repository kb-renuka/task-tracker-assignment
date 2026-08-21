const priorityClass = { Low: "priority-low", Medium: "priority-medium", High: "priority-high" };
const statusClass = { Todo: "status-todo", "In Progress": "status-progress", Done: "status-done" };

export default function TaskItem({ task, onEdit, onDelete, onComplete }) {
  return (
    <div className="task-card">
      <div className="task-card-main">
        <div className="task-card-header">
          <h4>{task.title}</h4>
          <span className={`badge ${priorityClass[task.priority]}`}>{task.priority}</span>
        </div>
        {task.description && <p className="task-description">{task.description}</p>}
        <div className="task-meta">
          <span className={`badge ${statusClass[task.status]}`}>{task.status}</span>
          {task.dueDate && (
            <span className="task-due">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
          )}
        </div>
      </div>
      <div className="task-card-actions">
        {task.status !== "Done" && (
          <button className="btn btn-sm btn-success" onClick={() => onComplete(task._id)}>Mark Done</button>
        )}
        <button className="btn btn-sm btn-outline" onClick={() => onEdit(task)}>Edit</button>
        <button className="btn btn-sm btn-danger" onClick={() => onDelete(task._id)}>Delete</button>
      </div>
    </div>
  );
}
