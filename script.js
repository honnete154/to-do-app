let tasks = [];
let currentFilter = "all";
let currentSearch = "";
let editingId = null;

document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("taskInput");
  const taskForm = document.getElementById("taskForm");
  const taskList = document.getElementById("taskList");
  const searchInput = document.getElementById("searchInput");
  const emptyState = document.getElementById("emptyState");
  const noResult = document.getElementById("noResult");
  const totalEl = document.getElementById("total");
  const pendingEl = document.getElementById("pending");
  const completedEl = document.getElementById("completed");
  const errorMsg = document.getElementById("errorMsg");
  const toast = document.getElementById("toast");
  const editModal = document.getElementById("editModal");
  const editInput = document.getElementById("editInput");

  function loadTasks() {
    const s = localStorage.getItem("tasks");
    try {
      tasks = s
        ? JSON.parse(s)
        : [
            {
              id: 1,
              title: "Revoir les cours",
              completed: false,
              createdAt: "2026-09-24",
            },
            {
              id: 2,
              title: "Cuisiner",
              completed: false,
              createdAt: "2026-09-24",
            },
            {
              id: 3,
              title: "Manger",
              completed: false,
              createdAt: "2026-09-24",
            },
          ];
    } catch (e) {
      localStorage.removeItem("tasks");
      tasks = [
        {
          id: 1,
          title: "Revoir les cours",
          completed: false,
          createdAt: "2026-09-24",
        },
        { id: 2, title: "Cuisiner", completed: false, createdAt: "2026-09-24" },
        { id: 3, title: "Manger", completed: false, createdAt: "2026-09-24" },
      ];
    }
  }

  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
  
  function showToast(t) {
    toast.textContent = t;
    toast.className = "show";
    setTimeout(() => (toast.className = ""), 2500);
  }

  function addTask() {
    const v = taskInput.value.trim();
    if (!v) {
      errorMsg.textContent = "Veuillez saisir une tâche.";
      errorMsg.classList.remove("hidden");
      return;
    }
    errorMsg.classList.add("hidden");
    const task = {
      id: Date.now(),
      title: v,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    tasks.unshift(task);
    saveTasks();
    renderTasks();
    updateStatistics();
    showToast("Tâche ajoutée ✓");
    taskInput.value = "";
  }

  function deleteTask(id) {
    if (!confirm("Supprimer cette tâche ?")) return;
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
    renderTasks();
    updateStatistics();
    showToast("Supprimée");
  }

  function editTask(id, newTitle) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const v = newTitle.trim();
    if (!v) {
      showToast("Titre vide interdit");
      return;
    }
    task.title = v;
    saveTasks();
    renderTasks();
    showToast("Modifiée");
  }

  function toggleTask(id) {
    const t = tasks.find((x) => x.id === id);
    if (t) {
      t.completed = !t.completed;
      saveTasks();
      renderTasks();
      updateStatistics();
    }
  }

  function searchTasks(q) {
    currentSearch = q.trim().toLowerCase();
    renderTasks();
  }
  function filterTasks(f) {
    currentFilter = f;
    document
      .querySelectorAll(".filters button")
      .forEach((b) => b.classList.toggle("active", b.dataset.filter === f));
    renderTasks();
  }

  function updateStatistics() {
    totalEl.textContent = tasks.length;
    completedEl.textContent = tasks.filter((t) => t.completed).length;
    pendingEl.textContent = tasks.filter((t) => !t.completed).length;
  }

  function renderTasks() {
    let filtered = tasks;
    if (currentFilter === "completed")
      filtered = filtered.filter((t) => t.completed);
    if (currentFilter === "pending")
      filtered = filtered.filter((t) => !t.completed);
    if (currentSearch)
      filtered = filtered.filter((t) =>
        t.title.toLowerCase().includes(currentSearch),
      );

    taskList.innerHTML = "";

    if (tasks.length === 0) {
      emptyState.classList.remove("hidden");
      noResult.classList.add("hidden");
      return;
    }
    emptyState.classList.add("hidden");

    if (filtered.length === 0) {
      noResult.classList.remove("hidden");
      return;
    }
    noResult.classList.add("hidden");

    filtered.forEach((task) => {
      const li = document.createElement("li");
      li.className = `item ${task.completed ? "done" : ""}`;
      const check = document.createElement("div");
      check.className = "check";
      check.textContent = task.completed ? "✓" : "";
      check.addEventListener("click", () => toggleTask(task.id));
      const span = document.createElement("span");
      span.className = "title";
      span.textContent = task.title;
      span.addEventListener("click", () => toggleTask(task.id));
      const edit = document.createElement("button");
      edit.className = "icon-btn";
      edit.textContent = "✎";
      edit.addEventListener("click", () => {
        editingId = task.id;
        editInput.value = task.title;
        editModal.classList.remove("hidden");
      });
      const del = document.createElement("button");
      del.className = "icon-btn";
      del.textContent = "✕";
      del.addEventListener("click", () => deleteTask(task.id));
      li.append(check, span, edit, del);
      taskList.appendChild(li);
    });
  }

  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    addTask();
  });
  searchInput.addEventListener("input", (e) => searchTasks(e.target.value));
  document
    .querySelectorAll(".filters button")
    .forEach((b) =>
      b.addEventListener("click", () => filterTasks(b.dataset.filter)),
    );
  document.getElementById("saveEdit").addEventListener("click", () => {
    if (editingId !== null) {
      editTask(editingId, editInput.value);
      editModal.classList.add("hidden");
    }
  });
  document
    .getElementById("cancelEdit")
    .addEventListener("click", () => editModal.classList.add("hidden"));

  // Lancement
  loadTasks();
  renderTasks();
  updateStatistics();
  console.log("Tâches chargées:", tasks);
});
