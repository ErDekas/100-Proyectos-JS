class KanbanApp {
  constructor() {
    this.boards = JSON.parse(localStorage.getItem("kanban-boards")) || [];
    this.currentBoardIndex = 0;
    this.initializeApp();
  }

  initializeApp() {
    if (this.boards.length === 0) {
      this.createBoard("My First Board");
    }
    this.renderBoardsList();
    this.renderCurrentBoard();
  }

  createBoard(name) {
    const newBoard = {
      name: name,
      columns: [
        { title: "To Do", tasks: [] },
        { title: "In Progress", tasks: [] },
        { title: "Done", tasks: [] },
      ],
    };
    this.boards.push(newBoard);
    this.saveBoards();
    this.renderBoardsList();
    this.currentBoardIndex = this.boards.length - 1;
    this.renderCurrentBoard();
  }

  renderBoardsList() {
    const container = document.getElementById("boards-container");
    container.innerHTML = "";
    this.boards.forEach((board, index) => {
      const boardElement = document.createElement("div");
      boardElement.classList.add("board-selector");
      if (index === this.currentBoardIndex) {
        boardElement.classList.add("active");
      }
      boardElement.textContent = board.name;
      boardElement.onclick = () => this.switchBoard(index);
      container.appendChild(boardElement);
    });
  }

  switchBoard(index) {
    this.currentBoardIndex = index;
    this.renderCurrentBoard();
    this.renderBoardsList();
  }

  renderCurrentBoard() {
    const boardContainer = document.getElementById("current-board");
    boardContainer.innerHTML = "";
    const currentBoard = this.boards[this.currentBoardIndex];

    currentBoard.columns.forEach((column, columnIndex) => {
      const columnElement = document.createElement("div");
      columnElement.classList.add("column");
      columnElement.dataset.columnIndex = columnIndex;

      const columnHeader = document.createElement("div");
      columnHeader.classList.add("column-header");
      const columnTitle = document.createElement("div");
      columnTitle.classList.add("column-title");
      columnTitle.textContent = column.title;
      columnHeader.appendChild(columnTitle);

      const addTaskContainer = document.createElement("div");
      const taskInput = document.createElement("input");
      taskInput.type = "text";
      taskInput.id = `task-input-${columnIndex}`;
      taskInput.placeholder = "New Task";

      const addTaskButton = document.createElement("button");
      addTaskButton.textContent = "+";
      addTaskButton.onclick = () => this.addTask(columnIndex, taskInput);

      addTaskContainer.appendChild(taskInput);
      addTaskContainer.appendChild(addTaskButton);
      columnHeader.appendChild(addTaskContainer);

      columnElement.appendChild(columnHeader);

      column.tasks.forEach((task, taskIndex) => {
        const taskElement = document.createElement("div");
        taskElement.classList.add("task");
        taskElement.draggable = true;
        taskElement.dataset.columnIndex = columnIndex;
        taskElement.dataset.taskIndex = taskIndex;
        taskElement.textContent = task.title;

        taskElement.addEventListener("dragstart", this.dragStart.bind(this));
        taskElement.addEventListener("dragend", this.dragEnd.bind(this));
        taskElement.onclick = () => this.showTaskModal(columnIndex, taskIndex);

        const taskActions = document.createElement("div");
        taskActions.classList.add("task-actions");

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "🗑️";
        deleteButton.onclick = (e) => {
          e.stopPropagation();
          this.deleteTask(columnIndex, taskIndex);
        };
        const editButton = document.createElement("button");
        editButton.textContent = "✏️";
        editButton.onclick = (e) => {
          e.stopPropagation();
          this.editTask(columnIndex, taskIndex);
        };

        taskActions.appendChild(deleteButton);
        taskElement.appendChild(taskActions);
        columnElement.appendChild(taskElement);
      });

      columnElement.addEventListener("dragover", this.dragOver.bind(this));
      columnElement.addEventListener("drop", this.drop.bind(this));

      boardContainer.appendChild(columnElement);
    });
  }

  dragStart(e) {
    e.target.classList.add("dragging");
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        columnIndex: e.target.dataset.columnIndex,
        taskIndex: e.target.dataset.taskIndex,
      })
    );
  }

  dragEnd(e) {
    e.target.classList.remove("dragging");
  }

  dragOver(e) {
    e.preventDefault();
  }

  drop(e) {
    e.preventDefault();
    const targetColumn = e.currentTarget;
    const targetColumnIndex = parseInt(targetColumn.dataset.columnIndex);

    const dragData = JSON.parse(e.dataTransfer.getData("text/plain"));
    const sourceColumnIndex = parseInt(dragData.columnIndex);
    const sourceTaskIndex = parseInt(dragData.taskIndex);

    if (sourceColumnIndex === targetColumnIndex) return;

    const task = this.boards[this.currentBoardIndex].columns[
      sourceColumnIndex
    ].tasks.splice(sourceTaskIndex, 1)[0];
    this.boards[this.currentBoardIndex].columns[targetColumnIndex].tasks.push(
      task
    );

    this.saveBoards();
    this.renderCurrentBoard();
  }

  addTask(columnIndex, inputElement) {
    const taskTitle = inputElement.value.trim();
    if (taskTitle) {
      this.boards[this.currentBoardIndex].columns[columnIndex].tasks.push({
        title: taskTitle,
        description: "",
      });
      inputElement.value = "";
      this.saveBoards();
      this.renderCurrentBoard();
    }
  }

  deleteTask(columnIndex, taskIndex) {
    this.boards[this.currentBoardIndex].columns[columnIndex].tasks.splice(
      taskIndex,
      1
    );
    this.saveBoards();
    this.renderCurrentBoard();
  }

  showTaskModal(columnIndex, taskIndex) {
    const modal = document.getElementById("task-modal");
    const task =
      this.boards[this.currentBoardIndex].columns[columnIndex].tasks[taskIndex];
    const titleInput = document.getElementById("task-title");
    const descriptionArea = document.getElementById("task-description");

    titleInput.value = task.title || "";
    descriptionArea.value = task.description || "";

    modal.style.display = "flex";
    modal.dataset.columnIndex = columnIndex;
    modal.dataset.taskIndex = taskIndex;
  }

  saveTaskDetails() {
    const modal = document.getElementById("task-modal");
    const columnIndex = parseInt(modal.dataset.columnIndex);
    const taskIndex = parseInt(modal.dataset.taskIndex);
    const titleInput = document.getElementById("task-title");
    const descriptionArea = document.getElementById("task-description");

    const currentTask =
      this.boards[this.currentBoardIndex].columns[columnIndex].tasks[taskIndex];

    currentTask.title = titleInput.value.trim();
    currentTask.description = descriptionArea.value;

    this.saveBoards();
    this.renderCurrentBoard();
    this.closeTaskModal();
  }

  closeTaskModal() {
    const modal = document.getElementById("task-modal");
    modal.style.display = "none";
  }

  saveBoards() {
    localStorage.setItem("kanban-boards", JSON.stringify(this.boards));
  }
}

function createBoard() {
  const input = document.getElementById("new-board-input");
  const boardName = input.value.trim();
  if (boardName) {
    kanbanApp.createBoard(boardName);
    input.value = "";
  }
}

const kanbanApp = new KanbanApp();
