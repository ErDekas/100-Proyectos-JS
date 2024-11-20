// Game configuration
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Bird properties
const bird = {
    x: 50,
    y: canvas.height / 2,
    width: 40,
    height: 30,
    velocity: 0,
    gravity: 0.5,
    jumpStrength: -10,
    wingAngle: 0,
    wingDirection: 1
};

// Pipe properties
const pipes = [];
const pipeWidth = 70;
const pipeGap = 200;
const pipeSpeed = 3;

// Game state
let gameOver = false;
let score = 0;
let highScore = localStorage.getItem('flappyHighScore') || 0;
let frameCount = 0;

// Background gradient
const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
gradient.addColorStop(0, '#87CEEB');    // Sky blue
gradient.addColorStop(0.7, '#87CEFA');  // Light sky blue
gradient.addColorStop(1, '#B0E0E6');    // Powder blue

// Spawn pipes
function spawnPipe() {
    const pipeHeight = Math.random() * (canvas.height - pipeGap);
    pipes.push({
        x: canvas.width,
        topHeight: pipeHeight,
        bottomHeight: canvas.height - pipeHeight - pipeGap
    });
}

// Draw bird
function drawBird() {
    // Update wing animation
    frameCount++;
    if (frameCount % 10 === 0) {
        bird.wingAngle += 0.3 * bird.wingDirection;
        if (Math.abs(bird.wingAngle) > 0.5) {
            bird.wingDirection *= -1;
        }
    }

    // Save canvas state
    ctx.save();
    
    // Translate to bird's position
    ctx.translate(bird.x, bird.y);
    
    // Rotate based on velocity for more dynamic movement
    ctx.rotate(bird.velocity * 0.1);

    // Body
    ctx.fillStyle = '#FFD700';  // Gold color
    ctx.beginPath();
    ctx.ellipse(0, 0, bird.width/2, bird.height/2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(bird.width/4, -bird.height/4, 3, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#FF6347';  // Tomato red
    ctx.beginPath();
    ctx.moveTo(bird.width/2, 0);
    ctx.lineTo(bird.width/2 + 10, 0);
    ctx.lineTo(bird.width/2 + 5, 5 * Math.sin(bird.wingAngle));
    ctx.closePath();
    ctx.fill();

    // Wings
    ctx.fillStyle = '#FFA500';  // Orange
    ctx.save();
    ctx.rotate(bird.wingAngle);
    ctx.beginPath();
    ctx.moveTo(-bird.width/3, 0);
    ctx.lineTo(-bird.width, bird.height/2);
    ctx.lineTo(-bird.width/3, bird.height/3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Restore canvas state
    ctx.restore();
}

// Draw pipes
function drawPipes() {
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillStyle = '#2E8B57';  // Sea Green
        ctx.beginPath();
        ctx.rect(pipe.x, 0, pipeWidth, pipe.topHeight);
        ctx.fill();

        // Top pipe cap
        ctx.fillStyle = '#228B22';  // Forest Green
        ctx.beginPath();
        ctx.moveTo(pipe.x, pipe.topHeight);
        ctx.lineTo(pipe.x + pipeWidth, pipe.topHeight);
        ctx.lineTo(pipe.x + pipeWidth/2, pipe.topHeight + 20);
        ctx.closePath();
        ctx.fill();

        // Bottom pipe
        ctx.fillStyle = '#2E8B57';  // Sea Green
        ctx.beginPath();
        ctx.rect(pipe.x, canvas.height - pipe.bottomHeight, pipeWidth, pipe.bottomHeight);
        ctx.fill();

        // Bottom pipe cap
        ctx.fillStyle = '#228B22';  // Forest Green
        ctx.beginPath();
        ctx.moveTo(pipe.x, canvas.height - pipe.bottomHeight);
        ctx.lineTo(pipe.x + pipeWidth, canvas.height - pipe.bottomHeight);
        ctx.lineTo(pipe.x + pipeWidth/2, canvas.height - pipe.bottomHeight - 20);
        ctx.closePath();
        ctx.fill();
    });
}

// Draw score
function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`High Score: ${highScore}`, 10, 60);
}

// Check collision (same as previous implementation)
function checkCollision() {
    // Floor and ceiling collision
    if (bird.y - bird.height/2 <= 0 || bird.y + bird.height/2 >= canvas.height) {
        return true;
    }

    // Pipe collision
    for (let pipe of pipes) {
        if (
            bird.x + bird.width/2 > pipe.x && 
            bird.x - bird.width/2 < pipe.x + pipeWidth
        ) {
            if (
                bird.y - bird.height/2 < pipe.topHeight || 
                bird.y + bird.height/2 > canvas.height - pipe.bottomHeight
            ) {
                return true;
            }
        }
    }
    return false;
}

// Game loop (similar to previous implementation with minor adjustments)
function gameLoop() {
    // Background
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Game over state
    if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, canvas.height/2 - 100, canvas.width, 200);
        
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.fillText('Game Over', canvas.width/2 - 80, canvas.height/2);
        ctx.fillText(`Score: ${score}`, canvas.width/2 - 60, canvas.height/2 + 40);
        
        return;
    }

    // Bird physics
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Pipe management
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
        spawnPipe();
    }

    // Move pipes
    pipes.forEach((pipe, index) => {
        pipe.x -= pipeSpeed;

        // Remove off-screen pipes
        if (pipe.x + pipeWidth < 0) {
            pipes.splice(index, 1);
            score++;
        }
    });

    // Draw game elements
    drawPipes();
    drawBird();
    drawScore();

    // Check for collisions
    if (checkCollision()) {
        // Update high score
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('flappyHighScore', highScore);
        }
        gameOver = true;
    }

    // Continue game loop
    requestAnimationFrame(gameLoop);
}

// Jump on spacebar (same as previous implementation)
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (gameOver) {
            // Restart game
            bird.y = canvas.height / 2;
            bird.velocity = 0;
            pipes.length = 0;
            score = 0;
            gameOver = false;
            gameLoop();
        } else {
            bird.velocity = bird.jumpStrength;
        }
        e.preventDefault();
    }
});

// Start game
gameLoop();