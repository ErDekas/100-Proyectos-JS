// Constants and Configuration
const CONFIG = {
    GRAVITY: 9.81,
    DRAG_VELOCITY_MULTIPLIER: 0.5,
    FRICTION: 0.99,
    MOVEMENT_THRESHOLD: 0.1,
    SELECTION_COLOR: '#0066ff',
    OBSTACLE_COLOR: '#666666'
  };
  
  // Utility Classes
  class Vector2D {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
  
    add(v) { return new Vector2D(this.x + v.x, this.y + v.y); }
    subtract(v) { return new Vector2D(this.x - v.x, this.y - v.y); }
    multiply(scalar) { return new Vector2D(this.x * scalar, this.y * scalar); }
    dot(v) { return this.x * v.x + this.y * v.y; }
    
    normalize() {
      const length = Math.sqrt(this.x * this.x + this.y * this.y);
      return length > 0 ? new Vector2D(this.x / length, this.y / length) : new Vector2D(0, 0);
    }
  
    static fromEvent(e, rect) {
      return new Vector2D(
        e.clientX - rect.left,
        e.clientY - rect.top
      );
    }
  }
  
  // Base class for all objects in the simulation
  class SimulationObject {
    constructor(x, y, width, height, color) {
      this.pos = new Vector2D(x, y);
      this.width = width;
      this.height = height;
      this.color = color;
      this.lastMousePos = null;
      this.isSelected = false;
    }
  
    containsPoint(point) {
      return point.x >= this.pos.x &&
             point.x <= this.pos.x + this.width &&
             point.y >= this.pos.y &&
             point.y <= this.pos.y + this.height;
    }
  
    constrain(canvasWidth, canvasHeight) {
      this.pos.x = Math.max(0, Math.min(canvasWidth - this.width, this.pos.x));
      this.pos.y = Math.max(0, Math.min(canvasHeight - this.height, this.pos.y));
    }
  
    drawSelectionBox(ctx) {
      if (this.isSelected) {
        ctx.strokeStyle = CONFIG.SELECTION_COLOR;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.pos.x, this.pos.y, this.width, this.height);
      }
    }
  }
  
  class PhysicsObject extends SimulationObject {
    constructor(x, y, type) {
      const width = parseInt(document.getElementById("objectWidth").value) || 50;
      const height = parseInt(document.getElementById("objectHeight").value) || 50;
      const color = document.getElementById("objectColor").value || '#ff0000';
      super(x, y, width, height, color);
  
      this.type = type;
      this.vel = new Vector2D(0, 0);
      this.elasticity = (parseInt(document.getElementById("elasticity").value) || 50) / 100;
      this.vertices = [];
      this.updateVertices();
      this.isDragging = false;
    }
  
    updateVertices() {
      if (this.type !== 'custom') return;
      
      this.vertices = [];
      const numVertices = parseInt(document.getElementById("vertices").value);
      const radius = Math.min(this.width, this.height) / 2;
      const center = new Vector2D(this.pos.x + radius, this.pos.y + radius);
  
      for (let i = 0; i < numVertices; i++) {
        const angle = (i / numVertices) * Math.PI * 2;
        this.vertices.push(new Vector2D(
          center.x + Math.cos(angle) * radius,
          center.y + Math.sin(angle) * radius
        ));
      }
    }
  
    draw(ctx) {
      ctx.save();
      ctx.fillStyle = this.color;
  
      switch (this.type) {
        case "ball":
          ctx.beginPath();
          ctx.arc(
            this.pos.x + this.width / 2,
            this.pos.y + this.height / 2,
            Math.min(this.width, this.height) / 2,
            0,
            Math.PI * 2
          );
          ctx.fill();
          break;
        case "square":
        case "stick":
          ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
          break;
        case "custom":
          if (this.vertices.length > 0) {
            ctx.beginPath();
            ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
            for (let i = 1; i < this.vertices.length; i++) {
              ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
            }
            ctx.closePath();
            ctx.fill();
          }
          break;
      }
  
      this.drawSelectionBox(ctx);
      ctx.restore();
    }
  
    update(canvas, obstacles) {
        if (!this.isDragging) {
          // Apply physics only when not being dragged
          this.vel.y += CONFIG.GRAVITY * 0.02;
          this.pos = this.pos.add(this.vel);
          this.vel = this.vel.multiply(CONFIG.FRICTION);
    
          // Handle all types of collisions
          this.handleBoundaryCollisions(canvas);
          obstacles.forEach(obstacle => this.handleObstacleCollision(obstacle));
          
          // Get all other physics objects from the simulator
          const otherObjects = simulator.objects.filter(obj => obj !== this);
          otherObjects.forEach(obj => this.handleObjectCollision(obj));
        }
    
        if (this.type === "custom") {
          this.updateVertices();
        }
      }
  
    handleBoundaryCollisions(canvas) {
      if (this.pos.y + this.height > canvas.height) {
        this.pos.y = canvas.height - this.height;
        this.vel.y *= -this.elasticity;
      }
      if (this.pos.x + this.width > canvas.width) {
        this.pos.x = canvas.width - this.width;
        this.vel.x *= -this.elasticity;
      }
      if (this.pos.x < 0) {
        this.pos.x = 0;
        this.vel.x *= -this.elasticity;
      }
    }
  
    handleObstacleCollision(obstacle) {
      if (!this.checkCollision(obstacle)) return;
  
      const overlapX = Math.min(
        Math.abs(this.pos.x + this.width - obstacle.pos.x),
        Math.abs(this.pos.x - (obstacle.pos.x + obstacle.width))
      );
      const overlapY = Math.min(
        Math.abs(this.pos.y + this.height - obstacle.pos.y),
        Math.abs(this.pos.y - (obstacle.pos.y + obstacle.height))
      );
  
      if (overlapX < overlapY) {
        // Horizontal collision
        this.pos.x = this.pos.x < obstacle.pos.x ? 
          obstacle.pos.x - this.width : 
          obstacle.pos.x + obstacle.width;
        this.vel.x *= -this.elasticity;
      } else {
        // Vertical collision
        this.pos.y = this.pos.y < obstacle.pos.y ? 
          obstacle.pos.y - this.height : 
          obstacle.pos.y + obstacle.height;
        this.vel.y *= -this.elasticity;
      }
    }
  
    checkCollision(obstacle) {
      return !(
        this.pos.x + this.width < obstacle.pos.x ||
        this.pos.x > obstacle.pos.x + obstacle.width ||
        this.pos.y + this.height < obstacle.pos.y ||
        this.pos.y > obstacle.pos.y + obstacle.height
      );
    }
    handleObjectCollision(other) {
        if (!this.checkObjectCollision(other)) return;
    
        // Calculate collision normal
        const thisCenter = new Vector2D(
          this.pos.x + this.width / 2,
          this.pos.y + this.height / 2
        );
        const otherCenter = new Vector2D(
          other.pos.x + other.width / 2,
          other.pos.y + other.height / 2
        );
        
        const collisionNormal = thisCenter.subtract(otherCenter).normalize();
    
        // Calculate relative velocity
        const relativeVel = this.vel.subtract(other.vel);
    
        // Calculate impulse
        const combinedElasticity = (this.elasticity + other.elasticity) / 2;
        const impulseStrength = -(1 + combinedElasticity) * relativeVel.dot(collisionNormal) / 2;
    
        // Apply impulse to both objects
        if (!this.isDragging) {
          this.vel = this.vel.add(collisionNormal.multiply(impulseStrength));
        }
        if (!other.isDragging) {
          other.vel = other.vel.subtract(collisionNormal.multiply(impulseStrength));
        }
    
        // Separate objects to prevent sticking
        const overlap = this.width / 2 + other.width / 2 - thisCenter.subtract(otherCenter).dot(collisionNormal);
        if (overlap > 0) {
          const separationVector = collisionNormal.multiply(overlap / 2);
          if (!this.isDragging) {
            this.pos = this.pos.add(separationVector);
          }
          if (!other.isDragging) {
            other.pos = other.pos.subtract(separationVector);
          }
        }
      }
    
      checkObjectCollision(other) {
        if (this.type === "ball" && other.type === "ball") {
          // Circle collision detection
          const thisCenter = new Vector2D(
            this.pos.x + this.width / 2,
            this.pos.y + this.height / 2
          );
          const otherCenter = new Vector2D(
            other.pos.x + other.width / 2,
            other.pos.y + other.height / 2
          );
          
          const distance = Math.sqrt(
            Math.pow(thisCenter.x - otherCenter.x, 2) +
            Math.pow(thisCenter.y - otherCenter.y, 2)
          );
          
          return distance < (this.width / 2 + other.width / 2);
        } else {
          // Rectangle collision detection (AABB)
          return !(
            this.pos.x + this.width < other.pos.x ||
            this.pos.x > other.pos.x + other.width ||
            this.pos.y + this.height < other.pos.y ||
            this.pos.y > other.pos.y + other.height
          );
        }
      }
    }
  
  class Obstacle extends SimulationObject {
    constructor(x, y) {
      const width = parseInt(document.getElementById("objectWidth").value);
      const height = parseInt(document.getElementById("objectHeight").value);
      super(x, y, width, height, CONFIG.OBSTACLE_COLOR);
    }
  
    draw(ctx) {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
      this.drawSelectionBox(ctx);
    }
  }
  
  // Simulation Manager
  class PhysicsSimulator {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext("2d");
      this.objects = [];
      this.obstacles = [];
      this.selectedObject = null;
      this.dragOffset = null;
      this.lastMousePos = null;
      this.setupEventListeners();
      
      // Ajustar el tamaño del canvas al tamaño de la ventana
      this.resizeCanvas();
      window.addEventListener('resize', this.resizeCanvas.bind(this));
    }
  
    resizeCanvas() {
      const container = this.canvas.parentElement;
      this.canvas.width = container.clientWidth;
      this.canvas.height = container.clientHeight;
    }
  
    setupEventListeners() {
      // Mouse events
      this.canvas.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.handlePointerStart(e);
      });
      
      this.canvas.addEventListener('mousemove', (e) => {
        e.preventDefault();
        this.handlePointerMove(e);
      });
      
      this.canvas.addEventListener('mouseup', (e) => {
        e.preventDefault();
        this.handlePointerEnd(e);
      });
      
      this.canvas.addEventListener('mouseleave', (e) => {
        e.preventDefault();
        this.handlePointerEnd(e);
      });
  
      // Touch events
      this.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        this.handlePointerStart(this.convertTouchToMouseEvent(touch));
      });
  
      this.canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        this.handlePointerMove(this.convertTouchToMouseEvent(touch));
      });
  
      this.canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.handlePointerEnd(e);
      });
    }
  
    convertTouchToMouseEvent(touch) {
      return {
        clientX: touch.clientX,
        clientY: touch.clientY,
        preventDefault: () => {}
      };
    }
  
    handlePointerStart(e) {
      const rect = this.canvas.getBoundingClientRect();
      const point = Vector2D.fromEvent(e, rect);
      
      // Check objects in reverse order (top to bottom)
      const allObjects = [...this.objects, ...this.obstacles].reverse();
      this.selectedObject = allObjects.find(obj => obj.containsPoint(point));
  
      if (this.selectedObject) {
        this.selectedObject.isSelected = true;
        this.selectedObject.isDragging = true;
        this.dragOffset = new Vector2D(
          point.x - this.selectedObject.pos.x,
          point.y - this.selectedObject.pos.y
        );
        this.lastMousePos = point;
      }
    }
  
    handlePointerMove(e) {
      if (!this.selectedObject || !this.dragOffset) return;
  
      const rect = this.canvas.getBoundingClientRect();
      const point = Vector2D.fromEvent(e, rect);
      
      if (isNaN(point.x) || isNaN(point.y)) return;
  
      const newPos = new Vector2D(
        point.x - this.dragOffset.x,
        point.y - this.dragOffset.y
      );
  
      // Update velocity based on movement
      if (this.selectedObject instanceof PhysicsObject && this.lastMousePos) {
        const delta = point.subtract(this.lastMousePos);
        this.selectedObject.vel = delta.multiply(CONFIG.DRAG_VELOCITY_MULTIPLIER);
      }
  
      // Update position
      this.selectedObject.pos = newPos;
      this.selectedObject.constrain(this.canvas.width, this.canvas.height);
      this.lastMousePos = point;
    }
  
    handlePointerEnd(e) {
      if (this.selectedObject) {
        this.selectedObject.isSelected = false;
        this.selectedObject.isDragging = false;
        this.selectedObject = null;
        this.dragOffset = null;
        this.lastMousePos = null;
      }
    }
  
    addObject() {
      const object = new PhysicsObject(
        Math.random() * (this.canvas.width - 30),
        50,
        document.getElementById("objectType").value
      );
      this.objects.push(object);
    }
  
    addObstacle() {
      const obstacle = new Obstacle(
        Math.random() * (this.canvas.width - 50),
        Math.random() * (this.canvas.height - 20)
      );
      this.obstacles.push(obstacle);
    }
  
    clearAll() {
      this.objects = [];
      this.obstacles = [];
    }
  
    update() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.objects.forEach(obj => {
        obj.update(this.canvas, this.obstacles);
        obj.draw(this.ctx);
      });
      
      this.obstacles.forEach(obstacle => obstacle.draw(this.ctx));
      
      requestAnimationFrame(this.update.bind(this));
    }
  }
  
// Initialize simulation
const simulator = new PhysicsSimulator("simulator");
simulator.update();

// UI Setup
document.getElementById("objectType")?.addEventListener("change", function(e) {
  const customControls = document.getElementById("customShapeControls");
  if (customControls) {
    customControls.style.display = e.target.value === "custom" ? "block" : "none";
  }
});

document.getElementById("vertices")?.addEventListener("input", function(e) {
  const verticesValue = document.getElementById("verticesValue");
  if (verticesValue) {
    verticesValue.textContent = e.target.value + " vértices";
  }
});

// Export functions for HTML buttons
window.addObject = () => simulator.addObject();
window.addObstacle = () => simulator.addObstacle();
window.clearAll = () => simulator.clearAll();