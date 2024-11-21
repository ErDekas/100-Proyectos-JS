class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = Math.random() * 5 + 2;
    this.speedX = (Math.random() - 0.5) * 5;
    this.speedY = (Math.random() - 0.5) * 10;
    this.alpha = 1;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.alpha -= 0.05;
  }
}

class TetrisGame {
  constructor(canvas, nextPieceCanvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.nextPieceCanvas = nextPieceCanvas;
    this.nextPieceCtx = nextPieceCanvas.getContext("2d");
    this.width = canvas.width;
    this.height = canvas.height;
    this.blockSize = 30;
    this.rows = this.height / this.blockSize;
    this.cols = this.width / this.blockSize;

    // Tetromino shapes
    this.shapes = [
      [[1, 1, 1, 1]],
      [
        [1, 1],
        [1, 1],
      ],
      [
        [1, 1, 1],
        [0, 1, 0],
      ],
      [
        [1, 1, 1],
        [1, 0, 0],
      ],
      [
        [1, 1, 1],
        [0, 0, 1],
      ],
      [
        [1, 1, 0],
        [0, 1, 1],
      ],
      [
        [0, 1, 1],
        [1, 1, 0],
      ],
    ];

    this.colors = [
      "#FF0D72",
      "#0DC2FF",
      "#0DFF72",
      "#F538FF",
      "#FF8E0D",
      "#FFE138",
      "#3877FF",
    ];

    this.board = Array(this.rows)
      .fill()
      .map(() => Array(this.cols).fill(0));
    this.currentPiece = this.createPiece();
    this.nextPiece = this.createPiece();
    this.score = 0;
    this.level = 1;
    this.dropSpeed = 1000;
    this.lastDropTime = 0;
    this.highScore = localStorage.getItem("tetrisHighScore") || 0;
    this.particles = [];
    this.isPaused = false;

    document.getElementById("high-score").textContent = this.highScore;

    this.setupControls();
    this.setupMobileControls();
    this.drawNextPiece();
    this.gameLoop();
  }

  createPiece() {
    const randomIndex = Math.floor(Math.random() * this.shapes.length);
    return {
      shape: this.shapes[randomIndex],
      color: this.colors[randomIndex],
      x:
        Math.floor(this.cols / 2) -
        Math.ceil(this.shapes[randomIndex][0].length / 2),
      y: 0,
    };
  }

  createParticleExplosion(x, y, color) {
    for (let i = 0; i < 20; i++) {
      this.particles.push(new Particle(x, y, color));
    }
  }

  updateParticles() {
    this.particles = this.particles.filter((particle) => particle.alpha > 0);
    this.particles.forEach((particle) => {
      particle.update();
    });
  }

  drawParticles() {
    this.particles.forEach((particle) => {
      particle.draw(this.ctx);
    });
  }

  drawBoard() {
    this.ctx.fillStyle = "#0f3460";
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw ghost piece (preview fall location)
    this.drawGhostPiece();

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.board[y][x]) {
          this.ctx.fillStyle = this.board[y][x];
          this.ctx.fillRect(
            x * this.blockSize,
            y * this.blockSize,
            this.blockSize - 1,
            this.blockSize - 1
          );
        }
      }
    }

    this.drawPiece(this.currentPiece);
    this.updateParticles();
    this.drawParticles();
    this.drawLuminousLines();
  }

  drawLuminousLines() {
    for (let y = 0; y < this.rows; y++) {
      if (this.board[y].every((cell) => cell !== 0)) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = "rgba(255,255,255,0.5)";
        this.ctx.lineWidth = 5;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = "white";
        this.ctx.moveTo(0, y * this.blockSize);
        this.ctx.lineTo(this.width, y * this.blockSize);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
      }
    }
  }

  drawNextPiece() {
    this.nextPieceCtx.clearRect(
      0,
      0,
      this.nextPieceCanvas.width,
      this.nextPieceCanvas.height
    );

    const piece = this.nextPiece;
    const maxWidth = Math.max(...piece.shape.map((row) => row.length));
    const maxHeight = piece.shape.length;

    const blockSize = 30;
    const offsetX = ((4 - maxWidth) * blockSize) / 2;
    const offsetY = ((4 - maxHeight) * blockSize) / 2;

    this.nextPieceCtx.fillStyle = piece.color;
    piece.shape.forEach((row, dy) => {
      row.forEach((value, dx) => {
        if (value) {
          this.nextPieceCtx.fillRect(
            offsetX + dx * blockSize,
            offsetY + dy * blockSize,
            blockSize - 1,
            blockSize - 1
          );
        }
      });
    });
  }

  drawGhostPiece() {
    const ghostPiece = JSON.parse(JSON.stringify(this.currentPiece));

    // Move ghost piece down
    while (!this.collision(ghostPiece)) {
      ghostPiece.y++;
    }
    ghostPiece.y--;

    this.ctx.globalAlpha = 0.3;
    this.ctx.fillStyle = ghostPiece.color;

    ghostPiece.shape.forEach((row, dy) => {
      row.forEach((value, dx) => {
        if (value) {
          this.ctx.fillRect(
            (ghostPiece.x + dx) * this.blockSize,
            (ghostPiece.y + dy) * this.blockSize,
            this.blockSize - 1,
            this.blockSize - 1
          );
        }
      });
    });

    this.ctx.globalAlpha = 1;
  }

  drawPiece(piece) {
    this.ctx.fillStyle = piece.color;
    piece.shape.forEach((row, dy) => {
      row.forEach((value, dx) => {
        if (value) {
          this.ctx.fillRect(
            (piece.x + dx) * this.blockSize,
            (piece.y + dy) * this.blockSize,
            this.blockSize - 1,
            this.blockSize - 1
          );
        }
      });
    });
  }

  movePiece(dx, dy) {
    this.currentPiece.x += dx;
    this.currentPiece.y += dy;

    if (this.collision()) {
      this.currentPiece.x -= dx;
      this.currentPiece.y -= dy;

      if (dy > 0) {
        this.lockPiece();
        this.clearLines();
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.createPiece();
        this.drawNextPiece();

        if (this.collision()) {
          this.resetGame();
        }
      }
      return false;
    }
    return true;
  }

  hardDrop() {
    while (!this.collision()) {
      this.currentPiece.y++;
    }
    this.currentPiece.y--;
    this.lockPiece();
    this.clearLines();
    this.currentPiece = this.nextPiece;
    this.nextPiece = this.createPiece();
    this.drawNextPiece();

    if (this.collision()) {
      this.resetGame();
    }
  }

  collision(piece = this.currentPiece) {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (
          piece.shape[y][x] &&
          (piece.x + x < 0 ||
            piece.x + x >= this.cols ||
            piece.y + y >= this.rows ||
            (this.board[piece.y + y] && this.board[piece.y + y][piece.x + x]))
        ) {
          return true;
        }
      }
    }
    return false;
  }

  lockPiece() {
    this.currentPiece.shape.forEach((row, dy) => {
      row.forEach((value, dx) => {
        if (value) {
          this.board[this.currentPiece.y + dy][this.currentPiece.x + dx] =
            this.currentPiece.color;
        }
      });
    });
  }

  clearLines() {
    let linesCleared = 0;
    for (let y = this.rows - 1; y >= 0; y--) {
      if (this.board[y].every((cell) => cell !== 0)) {
        // Create particle explosion
        for (let x = 0; x < this.cols; x++) {
          this.createParticleExplosion(
            x * this.blockSize + this.blockSize / 2,
            y * this.blockSize + this.blockSize / 2,
            this.board[y][x]
          );
        }

        this.board.splice(y, 1);
        this.board.unshift(Array(this.cols).fill(0));
        linesCleared++;
        y++;
      }
    }

    if (linesCleared > 0) {
      this.updateScore(linesCleared);
    }
  }

  updateScore(linesCleared) {
    const points = [0, 40, 100, 300, 1200];
    this.score += points[linesCleared] * this.level;
    document.getElementById("score").textContent = this.score;

    // Update high score
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem("tetrisHighScore", this.highScore);
      document.getElementById("high-score").textContent = this.highScore;
    }

    // Level up every 10 lines
    if (Math.floor(this.score / 1000) + 1 > this.level) {
      this.level++;
      document.getElementById("level").textContent = this.level;
      this.dropSpeed = Math.max(100, this.dropSpeed - 100);
    }
  }

  rotatePiece() {
    const rotated = this.currentPiece.shape[0].map((val, index) =>
      this.currentPiece.shape.map((row) => row[index]).reverse()
    );

    const previousShape = this.currentPiece.shape;
    this.currentPiece.shape = rotated;

    if (this.collision()) {
      this.currentPiece.shape = previousShape;
    }
  }

  resetGame() {
    this.board = Array(this.rows)
      .fill()
      .map(() => Array(this.cols).fill(0));
    this.score = 0;
    this.level = 1;
    this.dropSpeed = 1000;
    document.getElementById("score").textContent = "0";
    document.getElementById("level").textContent = "1";
    this.currentPiece = this.createPiece();
    this.nextPiece = this.createPiece();
    this.drawNextPiece();
  }

  setupControls() {
    document.addEventListener("keydown", (event) => {
      if (this.isPaused) return;

      switch (event.key) {
        case "ArrowLeft":
          this.movePiece(-1, 0);
          break;
        case "ArrowRight":
          this.movePiece(1, 0);
          break;
        case "ArrowDown":
          this.movePiece(0, 1);
          break;
        case "ArrowUp":
          this.rotatePiece();
          break;
        case " ": // Space bar
          event.preventDefault();
          this.hardDrop();
          break;
        case "p":
        case "P":
          this.togglePause();
          break;
      }
    });
  }

  setupMobileControls() {
    // Touch controls with Hammer.js
    const board = document.getElementById("tetris-board");
    const hammertime = new Hammer(board);

    hammertime.get("pan").set({ direction: Hammer.DIRECTION_ALL });
    hammertime.get("swipe").set({ direction: Hammer.DIRECTION_ALL });
    hammertime.get("doubletap").set({ taps: 2 });

    let lastX = 0;
    hammertime.on("panstart", (e) => {
      lastX = this.currentPiece.x;
    });

    hammertime.on("pan", (e) => {
      const deltaX = Math.round(e.deltaX / 50);
      const newX = lastX + deltaX;

      // Move piece horizontally
      if (newX > this.currentPiece.x) {
        this.movePiece(1, 0);
      } else if (newX < this.currentPiece.x) {
        this.movePiece(-1, 0);
      }
    });

    hammertime.on("swipedown", () => this.hardDrop());
    hammertime.on("swipeup", () => this.rotatePiece());
    
    // Add down with tap
    hammertime.on("tap", () => this.movePiece(0, 1));

    // Mobile buttons
    document
      .getElementById("left-btn")
      .addEventListener("click", () => this.movePiece(-1, 0));
    document
      .getElementById("right-btn")
      .addEventListener("click", () => this.movePiece(1, 0));
    document
      .getElementById("rotate-btn")
      .addEventListener("click", () => this.rotatePiece());
    document
      .getElementById("drop-btn")
      .addEventListener("click", () => this.hardDrop());
  }
  togglePause() {
    this.isPaused = !this.isPaused;
    const pauseOverlay = document.getElementById("pause-overlay");
    if (this.isPaused) {
      pauseOverlay.style.display = "flex";
    } else {
      pauseOverlay.style.display = "none";
    }
  }

  drawBoard() {
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw ghost piece (preview fall location)
    this.drawGhostPiece();

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.board[y][x]) {
          this.ctx.fillStyle = this.board[y][x];
          this.ctx.fillRect(
            x * this.blockSize,
            y * this.blockSize,
            this.blockSize - 1,
            this.blockSize - 1
          );
        }
      }
    }

    this.drawPiece(this.currentPiece);

    this.updateParticles();
    this.drawParticles();
    this.drawLuminousLines();
  }

  gameLoop(timestamp = 0) {
    if (this.isPaused) {
      requestAnimationFrame(this.gameLoop.bind(this));
      return;
    }
    if (timestamp - this.lastDropTime > this.dropSpeed) {
      this.movePiece(0, 1);
      this.lastDropTime = timestamp;
    }
    this.drawBoard();
    requestAnimationFrame(this.gameLoop.bind(this));
  }
}

// Initialize the game
const canvas = document.getElementById("tetris-board");
const nextPieceCanvas = document.getElementById("next-piece-canvas");
new TetrisGame(canvas, nextPieceCanvas);
