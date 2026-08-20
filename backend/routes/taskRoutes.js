const express = require("express");
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  markComplete,
  getAnalytics,
  adminGetAllTasks,
  adminDeleteTask,
} = require("../controllers/taskController");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

// IMPORTANT: these specific-path routes must be declared before "/:id" so
// Express doesn't try to parse "analytics"/"admin" as a Task ObjectId.
router.get("/analytics/summary", getAnalytics);

// Admin-only: cross-user visibility and moderation. Enforced by requireRole,
// not just hidden in the UI — a non-admin token gets a 403 even if they
// call these URLs directly.
router.get("/admin/all", requireRole("admin"), adminGetAllTasks);
router.delete("/admin/:id", requireRole("admin"), adminDeleteTask);

router.get("/", getTasks);
router.post("/", createTask);
router.get("/:id", getTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);
router.patch("/:id/complete", markComplete);

module.exports = router;
