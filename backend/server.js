require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/taskmanager";

app.use(cors());
app.use(express.json());

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    completed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Task Manager API is running" });
});

app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not fetch tasks" });
  }
});

app.post("/api/tasks", async (req, res) => {
  try {
    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    if (!title) {
      return res.status(400).json({ success: false, message: "Task title is required" });
    }
    const task = await Task.create({ title });
    res.status(201).json({ success: true, message: "Task created", data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not create task" });
  }
});

app.patch("/api/tasks/:id", async (req, res) => {
  try {
    const updates = {};
    if (typeof req.body.title === "string") {
      const title = req.body.title.trim();
      if (!title) return res.status(400).json({ success: false, message: "Title cannot be empty" });
      updates.title = title;
    }
    if (typeof req.body.completed === "boolean") updates.completed = req.body.completed;
    if (!Object.keys(updates).length) {
      return res.status(400).json({ success: false, message: "Provide title or completed to update" });
    }

    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    res.json({ success: true, message: "Task updated", data: task });
  } catch (error) {
    const status = error.name === "CastError" ? 400 : 500;
    res.status(status).json({ success: false, message: status === 400 ? "Invalid task ID" : "Could not update task" });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    res.json({ success: true, message: "Task deleted", data: task });
  } catch (error) {
    const status = error.name === "CastError" ? 400 : 500;
    res.status(status).json({ success: false, message: status === 400 ? "Invalid task ID" : "Could not delete task" });
  }
});

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Task Manager API listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

start();