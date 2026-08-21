import { useEffect, useState } from "react";

const emptyTask = { title: "", description: "", status: "Todo", priority: "Medium", dueDate: "" };

export default function TaskForm({ initialTask, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(emptyTask);

  useEffect(() => {
    if (initialTask) {
      setForm({
        title: initialTask.title || "",
        description: initialTask.description || "",
        status: initialTask.status || "Todo",
        priority: initialTask.priority || "Medium",
        dueDate: initialTask.dueDate ? initialTask.dueDate.slice(0, 10) : "",
      });
    } else {
      setForm(emptyTask);
    }
  }, [initialTask]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit(form);
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h3>{initialTask ? "Edit Task" : "New Task"}</h3>

      <label>
        Title *
        <input name="title" value={form.title} onChange={handleChange} className="input" required maxLength={150} />
      </label>

      <label>
        Description
        <textarea name="description" value={form.description} onChange={handleChange} className="input" rows={3} maxLength={2000} />
      </label>

      <div className="form-row">
        <label>
          Status
          <select name="status" value={form.status} onChange={handleChange} className="input">
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </label>

        <label>
          Priority
          <select name="priority" value={form.priority} onChange={handleChange} className="input">
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </label>

        <label>
          Due Date
          <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className="input" />
        </label>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : initialTask ? "Update Task" : "Create Task"}
        </button>
      </div>
    </form>
  );
}
