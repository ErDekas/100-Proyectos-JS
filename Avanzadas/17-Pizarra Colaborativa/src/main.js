// Firebase config
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { authService } from "./auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";

const db = getFirestore(authService.app);

const state = {
  currentUser: null,
  currentTool: "select",
  isDrawing: false,
  drawings: [],
  currentColor: "#000000",
  lineWidth: 2,
  undoStack: [],
  redoStack: [],
};

// Canvas setup
class CanvasManager {
  constructor() {
    this.canvasArea = document.querySelector(".canvas-area");
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.setupCanvas();
    this.bindEvents();
  }

  setupCanvas() {
    this.canvas.width = this.canvasArea.clientWidth;
    this.canvas.height = this.canvasArea.clientHeight;
    this.canvas.style.display = "block";
    this.canvasArea.appendChild(this.canvas);

    // Set initial styles
    this.ctx.strokeStyle = state.currentColor;
    this.ctx.lineWidth = state.lineWidth;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
  }

  // Save canvas state for undo/redo
  saveState() {
    state.undoStack.push(
      this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    );
    state.redoStack = []; // Clear redo stack when new action is performed
  }

  undo() {
    if (state.undoStack.length > 0) {
      state.redoStack.push(
        this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
      );
      const imageData = state.undoStack.pop();
      this.ctx.putImageData(imageData, 0, 0);
    }
  }

  redo() {
    if (state.redoStack.length > 0) {
      state.undoStack.push(
        this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
      );
      const imageData = state.redoStack.pop();
      this.ctx.putImageData(imageData, 0, 0);
    }
  }

  bindEvents() {
    // Mouse events
    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));

    // Touch events for mobile support
    this.canvas.addEventListener(
      "touchstart",
      this.handleTouchStart.bind(this)
    );
    this.canvas.addEventListener("touchmove", this.handleTouchMove.bind(this));
    this.canvas.addEventListener("touchend", this.handleTouchEnd.bind(this));

    // Window resize
    window.addEventListener("resize", this.handleResize.bind(this));
  }

  // Event handlers
  handleMouseDown(e) {
    state.isDrawing = true;
    state.startX = e.offsetX;
    state.startY = e.offsetY;
    this.saveState();

    if (state.currentTool === "text") {
      const text = prompt("Enter text:");
      if (text) {
        this.ctx.font = "16px Arial";
        this.ctx.fillStyle = state.currentColor;
        this.ctx.fillText(text, state.startX, state.startY);
      }
    } else if (state.currentTool === "pen") {
      this.ctx.beginPath();
      this.ctx.moveTo(state.startX, state.startY);
    }
  }

  handleMouseMove(e) {
    if (!state.isDrawing || state.currentTool === "select") return;

    const currentX = e.offsetX;
    const currentY = e.offsetY;

    if (["square", "circle", "arrow"].includes(state.currentTool)) {
      // Create temporary canvas for preview
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = this.canvas.width;
      tempCanvas.height = this.canvas.height;
      const tempCtx = tempCanvas.getContext("2d");

      // Copy current canvas state
      tempCtx.putImageData(state.undoStack[state.undoStack.length - 1], 0, 0);

      // Draw new shape
      this.drawShape(
        tempCtx,
        state.currentTool,
        state.startX,
        state.startY,
        currentX,
        currentY
      );

      // Clear main canvas and draw temporary canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(tempCanvas, 0, 0);
    } else if (state.currentTool === "pen") {
      this.ctx.lineTo(currentX, currentY);
      this.ctx.stroke();
    }
  }

  handleMouseUp(e) {
    if (!state.isDrawing) return;

    state.isDrawing = false;
    if (state.currentTool !== "pen" && state.currentTool !== "text") {
      const endX = e.offsetX;
      const endY = e.offsetY;
      this.drawShape(
        this.ctx,
        state.currentTool,
        state.startX,
        state.startY,
        endX,
        endY
      );
    }
    this.ctx.beginPath();
  }

  // Touch event handlers
  handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    this.handleMouseDown({ offsetX: x, offsetY: y });
  }

  handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    this.handleMouseMove({ offsetX: x, offsetY: y });
  }

  handleTouchEnd(e) {
    e.preventDefault();
    this.handleMouseUp(e);
  }

  handleResize() {
    const imageData = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    this.canvas.width = this.canvasArea.clientWidth;
    this.canvas.height = this.canvasArea.clientHeight;
    this.ctx.putImageData(imageData, 0, 0);
  }

  drawShape(context, tool, x1, y1, x2, y2) {
    context.beginPath();
    context.strokeStyle = state.currentColor;
    context.lineWidth = state.lineWidth;

    switch (tool) {
      case "square":
        const width = x2 - x1;
        const height = y2 - y1;
        context.strokeRect(x1, y1, width, height);
        break;
      case "circle":
        const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        context.arc(x1, y1, radius, 0, 2 * Math.PI);
        context.stroke();
        break;
      case "arrow":
        // Draw line
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);

        // Calculate arrow head
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLength = 15;

        context.lineTo(
          x2 - headLength * Math.cos(angle - Math.PI / 6),
          y2 - headLength * Math.sin(angle - Math.PI / 6)
        );
        context.moveTo(x2, y2);
        context.lineTo(
          x2 - headLength * Math.cos(angle + Math.PI / 6),
          y2 - headLength * Math.sin(angle + Math.PI / 6)
        );
        context.stroke();
        break;
    }
  }
}

// UI Manager
class UIManager {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.setupToolbar();
    this.setupColorPicker();
    this.setupLineWidth();
    this.setupAuthUI();
    this.setupFileOperations();
  }

  setupToolbar() {
    const tools = document.querySelectorAll(".tool-button");
    tools.forEach((tool, index) => {
      tool.addEventListener("click", () => {
        tools.forEach((t) => t.classList.remove("selected"));
        tool.classList.add("selected");

        const icons = [
          "pointer",
          "square",
          "circle",
          "arrow",
          "pen",
          "text",
          "image",
        ];
        state.currentTool = icons[index];
      });
    });

    // Undo/Redo buttons
    document.querySelector("#undo-button").addEventListener("click", () => {
      this.canvasManager.undo();
    });

    document.querySelector("#redo-button").addEventListener("click", () => {
      this.canvasManager.redo();
    });
  }

  setupColorPicker() {
    const colorPicker = document.querySelector("#color-picker");
    colorPicker.addEventListener("change", (e) => {
      state.currentColor = e.target.value;
      this.canvasManager.ctx.strokeStyle = state.currentColor;
    });
  }

  setupLineWidth() {
    const lineWidth = document.querySelector("#line-width");
    lineWidth.addEventListener("change", (e) => {
      state.lineWidth = parseInt(e.target.value);
      this.canvasManager.ctx.lineWidth = state.lineWidth;
    });
  }

  setupAuthUI() {
    const loginButton = document.querySelector('#login-button');
    const logoutButton = document.querySelector('#logout-button');
    const userInfo = document.querySelector('#user-info');

    authService.setAuthStateChangeCallback((isAuthenticated, user) => {
      if (isAuthenticated) {
        userInfo.textContent = `Logged in as ${user.email}`;
        loginButton.style.display = 'none';
        logoutButton.style.display = 'block';
        this.loadUserDrawings();
      } else {
        userInfo.textContent = 'Not logged in';
        loginButton.style.display = 'block';
        logoutButton.style.display = 'none';
      }
    });

    loginButton.addEventListener('click', () => {
      authService.loginWithGoogle();
    });

    logoutButton.addEventListener('click', () => {
      authService.logout();
    });
  }

  setupFileOperations() {
    // Save drawing
    document
      .querySelector("#save-button")
      .addEventListener("click", async () => {
        if (!state.currentUser) {
          alert("Please log in to save drawings");
          return;
        }

        const name = prompt("Enter drawing name:");
        if (!name) return;

        try {
          const drawing = {
            name,
            userId: state.currentUser.uid,
            data: this.canvasManager.canvas.toDataURL(),
            createdAt: new Date(),
          };

          await addDoc(collection(db, "drawings"), drawing);
          alert("Drawing saved successfully!");
        } catch (error) {
          console.error("Error saving drawing:", error);
          alert("Error saving drawing");
        }
      });

    // Load drawings
    document
      .querySelector("#load-button")
      .addEventListener("click", async () => {
        if (!state.currentUser) {
          alert("Please log in to load drawings");
          return;
        }

        await this.loadUserDrawings();
      });
  }

  async loadUserDrawings() {
    if (!state.currentUser) return;

    try {
      const q = query(
        collection(db, 'drawings'),
        where('userId', '==', state.currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      state.drawings = [];
      querySnapshot.forEach((doc) => {
        state.drawings.push({ id: doc.id, ...doc.data() });
      });

      this.displayDrawingsList();
    } catch (error) {
      console.error('Error loading drawings:', error);
      alert('Error loading drawings');
    }
  }

  displayDrawingsList() {
    const list = document.querySelector('#drawings-list');
    list.innerHTML = '';

    state.drawings.forEach(drawing => {
      const item = document.createElement('div');
      item.className = 'drawing-item';
      item.textContent = `${drawing.name} (${new Date(drawing.createdAt.toDate()).toLocaleDateString()})`;

      item.addEventListener('click', () => {
        const img = new Image();
        img.onload = () => {
          this.canvasManager.ctx.clearRect(0, 0, this.canvasManager.canvas.width, this.canvasManager.canvas.height);
          this.canvasManager.ctx.drawImage(img, 0, 0);
        };
        img.src = drawing.data;
      });

      list.appendChild(item);
    });
  }
}

// Initialize application
document.addEventListener("DOMContentLoaded", () => {
  const canvasManager = new CanvasManager();
  const uiManager = new UIManager(canvasManager);
});
