class TaskManager {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    this.currentFilter = "all";
    this.initializeElements();
    this.addEventListeners();
    this.renderTasks();
  }

  initializeElements() {
    this.taskForm = document.getElementById("taskForm");
    this.taskInput = document.getElementById("taskInput");
    this.prioritySelect = document.getElementById("prioritySelect");
    this.taskList = document.getElementById("taskList");
    this.filterButtons = document.querySelectorAll(".filter-button");
    this.priorityPopup = document.getElementById("priorityPopup");
  }

  addEventListeners() {
    this.taskForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.addTask();
    });

    this.filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.currentFilter = button.dataset.filter;
        this.updateFilterButtons();
        this.renderTasks();
      });
    });

    // Cerrar el popup cuando se hace clic fuera de él
    document.addEventListener("click", (e) => {
      if (
        !this.priorityPopup.contains(e.target) &&
        !e.target.classList.contains("priority-badge")
      ) {
        this.priorityPopup.style.display = "none";
      }
    });

    // Manejar el cambio de prioridad
    this.priorityPopup
      .querySelectorAll(".priority-option")
      .forEach((option) => {
        option.addEventListener("click", () => {
          if (this.currentEditingTaskId) {
            this.changePriority(
              this.currentEditingTaskId,
              option.dataset.priority
            );
            this.priorityPopup.style.display = "none";
          }
        });
      });
  }

  updateFilterButtons() {
    this.filterButtons.forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.filter === this.currentFilter
      );
    });
  }

  addTask() {
    const text = this.taskInput.value.trim();
    const priority = this.prioritySelect.value;
    if (text) {
      const task = {
        id: Date.now(),
        text,
        priority,
        completed: false,
      };
      this.tasks.push(task);
      this.saveTasks();
      this.renderTasks();
      this.taskInput.value = "";
    }
  }

  toggleTask(id) {
    const task = this.tasks.find((t) => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks();
      this.renderTasks();
    }
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.saveTasks();
    this.renderTasks();
  }

  showPriorityPopup(event, taskId) {
    event.stopPropagation();
    const badge = event.target;
    const rect = badge.getBoundingClientRect();

    this.currentEditingTaskId = taskId;
    this.priorityPopup.style.display = "block";
    this.priorityPopup.style.top = `${rect.bottom + window.scrollY + 5}px`;
    this.priorityPopup.style.left = `${rect.left + window.scrollX}px`;
  }

  changePriority(taskId, newPriority) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      task.priority = newPriority;
      this.saveTasks();
      this.renderTasks();
    }
  }

  filterTasks() {
    switch (this.currentFilter) {
      case "active":
        return this.tasks.filter((task) => !task.completed);
      case "completed":
        return this.tasks.filter((task) => task.completed);
      default:
        return this.tasks;
    }
  }

  getPriorityLabel(priority) {
    const labels = {
      high: "Alta",
      medium: "Media",
      low: "Baja",
    };
    return labels[priority] || priority;
  }

  renderTasks() {
    const filteredTasks = this.filterTasks();
    // Ordenar por prioridad: alta > media > baja
    filteredTasks.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    this.taskList.innerHTML = filteredTasks
      .map(
        (task) => `
            <li class="task-item">
                <input type="checkbox" class="task-checkbox" 
                    ${task.completed ? "checked" : ""} 
                    onchange="taskManager.toggleTask(${task.id})">
                <div class="task-content">
                    <span class="task-text ${
                      task.completed ? "completed" : ""
                    }">${task.text}</span>
                    <span class="priority-badge priority-${task.priority}" 
                          onclick="taskManager.showPriorityPopup(event, ${
                            task.id
                          })">
                        ${this.getPriorityLabel(task.priority)}
                    </span>
                </div>
                <button class="task-delete" onclick="taskManager.deleteTask(${
                  task.id
                })">
                    Eliminar
                </button>
            </li>
        `
      )
      .join("");
  }

  saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(this.tasks));
  }
}

const taskManager = new TaskManager();
