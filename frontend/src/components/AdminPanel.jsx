import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import Pagination from "./Pagination";

const statusClass = { Todo: "status-todo", "In Progress": "status-progress", Done: "status-done" };
const priorityClass = { Low: "priority-low", Medium: "priority-medium", High: "priority-high" };

export default function AdminPanel() {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/tasks/admin/all", { params: { page, limit: 15 } });
      setTasks(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin task list");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task? This action is permanent and applies to any user's task.")) return;
    try {
      await api.delete(`/tasks/admin/${id}`);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete task");
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-badge">Admin view — all users' tasks</div>

      {loading && <div className="empty-state">Loading...</div>}
      {error && <div className="empty-state error-state">{error}</div>}
      {!loading && !error && tasks.length === 0 && (
        <div className="empty-state">No tasks exist yet across any account.</div>
      )}

      {!loading && !error && tasks.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t._id}>
                  <td>{t.title}</td>
                  <td>{t.user?.name || "Unknown"} <span className="text-muted">({t.user?.email})</span></td>
                  <td><span className={`badge ${statusClass[t.status]}`}>{t.status}</span></td>
                  <td><span className={`badge ${priorityClass[t.priority]}`}>{t.priority}</span></td>
                  <td>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}</td>
                  <td><button className="btn btn-sm btn-danger" onClick={() => handleDelete(t._id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
}
