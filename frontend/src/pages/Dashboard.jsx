import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import AnalyticsCards from "../components/AnalyticsCards";
import FilterBar from "../components/FilterBar";
import TaskList from "../components/TaskList";
import TaskForm from "../components/TaskForm";
import Pagination from "../components/Pagination";
import AdminPanel from "../components/AdminPanel";

const defaultFilters = { status: "", priority: "", search: "", sortBy: "createdAt", order: "desc", page: 1, limit: 10 };

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(defaultFilters);

  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { ...filters };
      Object.keys(params).forEach((k) => { if (params[k] === "") delete params[k]; });
      const { data } = await api.get("/tasks", { params });
      setTasks(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const { data } = await api.get("/tasks/analytics/summary");
      setAnalytics(data.data);
    } catch {
      // Analytics failure shouldn't block the task list from rendering.
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const refreshAll = () => { fetchTasks(); fetchAnalytics(); };

  const handleCreate = () => { setEditingTask(null); setShowForm(true); };
  const handleEdit = (task) => { setEditingTask(task); setShowForm(true); };
  const handleCancelForm = () => { setShowForm(false); setEditingTask(null); };

  const handleSubmitForm = async (form) => {
    setSubmitting(true);
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, form);
      } else {
        await api.post("/tasks", form);
      }
      setShowForm(false);
      setEditingTask(null);
      refreshAll();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      refreshAll();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete task");
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.patch(`/tasks/${id}/complete`);
      refreshAll();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update task");
    }
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="dashboard">
        <section className="dashboard-section">
          <h2>Analytics</h2>
          <AnalyticsCards analytics={analytics} loading={analyticsLoading} />
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Your Tasks</h2>
            <button className="btn btn-primary" onClick={handleCreate}>+ New Task</button>
          </div>

          <FilterBar filters={filters} onChange={setFilters} />

          {showForm && (
            <TaskForm
              initialTask={editingTask}
              onSubmit={handleSubmitForm}
              onCancel={handleCancelForm}
              submitting={submitting}
            />
          )}

          <TaskList
            tasks={tasks}
            loading={loading}
            error={error}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onComplete={handleComplete}
          />

          <Pagination pagination={pagination} onPageChange={(page) => setFilters((f) => ({ ...f, page }))} />
        </section>

        {user?.role === "admin" && (
          <section className="dashboard-section">
            <h2>Admin</h2>
            <AdminPanel />
          </section>
        )}
      </main>
    </div>
  );
}
