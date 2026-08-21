import TaskItem from "./TaskItem";

export default function TaskList({ tasks, loading, error, onEdit, onDelete, onComplete }) {
  if (loading) {
    return (
      <div className="task-list">
        {[1, 2, 3].map((i) => <div key={i} className="task-card skeleton" style={{ height: 90 }} />)}
      </div>
    );
  }

  if (error) {
    return <div className="empty-state error-state">{error}</div>;
  }

  if (!tasks.length) {
    return <div className="empty-state">No tasks found. Create your first task to get started.</div>;
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskItem key={task._id} task={task} onEdit={onEdit} onDelete={onDelete} onComplete={onComplete} />
      ))}
    </div>
  );
}
