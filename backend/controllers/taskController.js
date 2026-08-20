const Task = require("../models/Task");
const { asyncHandler } = require("../middleware/errorHandler");

// @route GET /api/tasks
// Supports: ?status=Todo&priority=High&search=title&sortBy=dueDate&order=asc&page=1&limit=10
const getTasks = asyncHandler(async (req, res) => {
  const { status, priority, search, sortBy, order, page = 1, limit = 10 } = req.query;

  const query = { user: req.user._id };
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (search) query.title = { $regex: search, $options: "i" };

  const sortField = ["title", "dueDate", "priority", "status", "createdAt"].includes(sortBy)
    ? sortBy
    : "createdAt";
  const sortOrder = order === "asc" ? 1 : -1;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const [tasks, total] = await Promise.all([
    Task.find(query).sort({ [sortField]: sortOrder }).skip(skip).limit(limitNum),
    Task.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: tasks,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  });
});

// @route GET /api/tasks/:id
const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }
  res.json({ success: true, data: task });
});

// @route POST /api/tasks
const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate } = req.body;
  if (!title) {
    res.status(400);
    throw new Error("Title is required");
  }
  const task = await Task.create({
    user: req.user._id,
    title,
    description,
    status,
    priority,
    dueDate,
  });
  res.status(201).json({ success: true, data: task });
});

// @route PUT /api/tasks/:id
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }
  const fields = ["title", "description", "status", "priority", "dueDate"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) task[f] = req.body[f];
  });
  await task.save();
  res.json({ success: true, data: task });
});

// @route DELETE /api/tasks/:id
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }
  res.json({ success: true, data: { id: req.params.id } });
});

// @route PATCH /api/tasks/:id/complete
const markComplete = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { status: "Done" },
    { new: true }
  );
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }
  res.json({ success: true, data: task });
});

// @route GET /api/tasks/analytics/summary
const getAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [statusCounts, priorityCounts, total] = await Promise.all([
    Task.aggregate([
      { $match: { user: userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Task.aggregate([
      { $match: { user: userId } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]),
    Task.countDocuments({ user: userId }),
  ]);

  const byStatus = { Todo: 0, "In Progress": 0, Done: 0 };
  statusCounts.forEach((s) => { byStatus[s._id] = s.count; });

  const byPriority = { Low: 0, Medium: 0, High: 0 };
  priorityCounts.forEach((p) => { byPriority[p._id] = p.count; });

  const completed = byStatus.Done;
  const pending = total - completed;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  res.json({
    success: true,
    data: {
      total,
      completed,
      pending,
      completionPercentage,
      byStatus,
      byPriority,
    },
  });
});

// ---- Admin-only endpoints (require role "admin", enforced in routes) ----

// @route GET /api/tasks/admin/all
// Lists tasks across every user (not scoped to req.user), with the owner's
// name/email populated so an admin can see who each task belongs to.
const adminGetAllTasks = asyncHandler(async (req, res) => {
  const { status, priority, search, page = 1, limit = 15 } = req.query;

  const query = {};
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (search) query.title = { $regex: search, $options: "i" };

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 15, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Task.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: tasks,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  });
});

// @route DELETE /api/tasks/admin/:id
// Unlike the regular deleteTask, this is not scoped to req.user — an admin
// can delete any user's task.
const adminDeleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }
  res.json({ success: true, data: { id: req.params.id } });
});

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  markComplete,
  getAnalytics,
  adminGetAllTasks,
  adminDeleteTask,
};
