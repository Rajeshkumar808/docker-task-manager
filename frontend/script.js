const API_URL = "/api/tasks";

const form = document.getElementById("task-form");
const titleInput = document.getElementById("task-title");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const message = document.getElementById("message");
const refreshButton = document.getElementById("refresh-button");

function showMessage(text) {
  message.textContent = text;
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Request failed");
  return result;
}

function renderTasks(tasks) {
  taskList.innerHTML = "";
  taskCount.textContent = `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;

  if (!tasks.length) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "No tasks yet. Add your first task above.";
    taskList.appendChild(empty);
    return;
  }

  tasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = "task-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Mark ${task.title} as completed`);
    checkbox.addEventListener("change", async () => {
      try {
        await request(`${API_URL}/${task._id}`, {
          method: "PATCH",
          body: JSON.stringify({ completed: checkbox.checked })
        });
        loadTasks();
      } catch (error) {
        showMessage(error.message);
      }
    });

    const title = document.createElement("span");
    title.className = `task-title${task.completed ? " done" : ""}`;
    title.textContent = task.title;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", async () => {
      try {
        await request(`${API_URL}/${task._id}`, { method: "DELETE" });
        showMessage("Task deleted.");
        loadTasks();
      } catch (error) {
        showMessage(error.message);
      }
    });

    item.append(checkbox, title, deleteButton);
    taskList.appendChild(item);
  });
}

async function loadTasks() {
  try {
    const result = await request(API_URL);
    renderTasks(result.data);
  } catch (error) {
    taskCount.textContent = "Could not load tasks";
    showMessage(`${error.message}. Is Docker Compose running?`);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;

  try {
    await request(API_URL, { method: "POST", body: JSON.stringify({ title }) });
    titleInput.value = "";
    showMessage("Task added.");
    loadTasks();
  } catch (error) {
    showMessage(error.message);
  }
});

refreshButton.addEventListener("click", loadTasks);
loadTasks();