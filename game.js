// Canvas setup
const canvas = document.getElementById('pong-canvas');
const ctx = canvas.getContext('2d');
const modeSelection = document.getElementById('mode-selection');
const zeroPlayerButton = document.getElementById('zero-player-button');
const onePlayerButton = document.getElementById('one-player-button');
const twoPlayerButton = document.getElementById('two-player-button');
const difficultySelection = document.getElementById('difficulty-selection');
const difficultyButtons = document.querySelectorAll('.difficulty-button');
const score1Display = document.getElementById('score1');
const score2Display = document.getElementById('score2');
const player2Label = document.getElementById('player2-label');
const player2Controls = document.getElementById('player2-controls');

// Highscore elements
const highscoreToggleBtn = document.getElementById('highscore-toggle-btn');
const highscoreModal = document.getElementById('highscore-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const tabBtns = document.querySelectorAll('.tab-btn');
const singleScoresList = document.getElementById('single-scores-list');
const multiScoresList = document.getElementById('multi-scores-list');
const resetHighscoresBtn = document.getElementById('reset-highscores-btn');

// Message modal elements
const messageModal = document.getElementById('message-modal');
const messageModalTitle = document.getElementById('message-modal-title');
const messageModalText = document.getElementById('message-modal-text');
const messageModalConfirm = document.getElementById('message-modal-confirm');
const messageModalCancel = document.getElementById('message-modal-cancel');

// Points system elements
const totalPointsDisplay = document.getElementById('total-points');
const sessionPointsDisplay = document.getElementById('session-points');
const comboDisplay = document.getElementById('combo-display');
const comboCountDisplay = document.getElementById('combo-count');
const shopToggleBtn = document.getElementById('shop-toggle-btn');
const shopModal = document.getElementById('shop-modal');
const closeShopBtn = document.getElementById('close-shop-btn');
const shopBalanceDisplay = document.getElementById('shop-balance');
const resetPointsBtn = document.getElementById('reset-points-btn');
const resetPurchasesBtn = document.getElementById('reset-purchases-btn');

// Game constants
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 10;
const PADDLE_SPEED = 6;
const INITIAL_BALL_SPEED = 5;
const WINNING_SCORE = 5;

// Difficulty settings
const DIFFICULTY_SETTINGS = {
    easy: {
        AI_SPEED: 3,
        BALL_SPEED_INCREMENT: 0.3,
        AI_DEAD_ZONE: 40,
        MAX_BALL_SPEED: 10,
        POINTS_MULTIPLIER: 1.0
    },
    normal: {
        AI_SPEED: 4.5,
        BALL_SPEED_INCREMENT: 0.5,
        AI_DEAD_ZONE: 20,
        MAX_BALL_SPEED: 12,
        POINTS_MULTIPLIER: 1.5
    },
    hard: {
        AI_SPEED: 6,
        BALL_SPEED_INCREMENT: 0.7,
        AI_DEAD_ZONE: 5,
        MAX_BALL_SPEED: 15,
        POINTS_MULTIPLIER: 2.0
    }
};

// Points system constants
const POINTS_VALUES = {
    BALL_HIT: 10,           // Points for hitting the ball
    WIN_RALLY: 50,          // Points for scoring a point
    WIN_MATCH: 500,         // Points for winning the game
    SPEED_BONUS_THRESHOLD: 10, // Ball speed threshold for bonus
    SPEED_BONUS: 25,        // Extra points for high-speed hits
    MAX_COMBO_MULTIPLIER: 5 // Maximum combo multiplier
};

// Game state
let gameRunning = false;
let gameMode = null; // 'zero', 'single' or 'multi'
let gameDifficulty = 'normal'; // 'easy', 'normal', or 'hard'
let player1Score = 0;
let player2Score = 0;

// Points system state
let totalPoints = 0;        // Total points accumulated (persistent)
let sessionPoints = 0;      // Points earned this session
let comboCount = 0;         // Current hit combo
let lastHitByPlayer = false; // Track if player was last to hit

// Paddle objects
const paddle1 = {
    x: 20,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0
};

const paddle2 = {
    x: canvas.width - 20 - PADDLE_WIDTH,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0
};

// Ball object
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: BALL_SIZE,
    dx: INITIAL_BALL_SPEED,
    dy: INITIAL_BALL_SPEED,
    speed: INITIAL_BALL_SPEED
};

// Keyboard state
const keys = {};

// Create sound effects using Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playHitSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 400;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function playWallSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 300;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function playScoreSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 200;
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// ===== MESSAGE MODAL FUNCTIONS =====

// Show alert modal (replacement for alert())
function showAlert(message, title = 'Message') {
    return new Promise((resolve) => {
        messageModalTitle.textContent = title;
        messageModalText.textContent = message;
        messageModalConfirm.textContent = 'OK';
        messageModalConfirm.style.display = 'block';
        messageModalCancel.style.display = 'none';
        messageModal.classList.remove('hidden');

        const handleConfirm = () => {
            messageModal.classList.add('hidden');
            messageModalConfirm.removeEventListener('click', handleConfirm);
            resolve();
        };

        messageModalConfirm.addEventListener('click', handleConfirm);
    });
}

// Show confirm modal (replacement for confirm())
function showConfirm(message, title = 'Confirm') {
    return new Promise((resolve) => {
        messageModalTitle.textContent = title;
        messageModalText.textContent = message;
        messageModalConfirm.textContent = 'Yes';
        messageModalCancel.textContent = 'Cancel';
        messageModalConfirm.style.display = 'block';
        messageModalCancel.style.display = 'block';
        messageModal.classList.remove('hidden');

        const handleConfirm = () => {
            messageModal.classList.add('hidden');
            cleanup();
            resolve(true);
        };

        const handleCancel = () => {
            messageModal.classList.add('hidden');
            cleanup();
            resolve(false);
        };

        const cleanup = () => {
            messageModalConfirm.removeEventListener('click', handleConfirm);
            messageModalCancel.removeEventListener('click', handleCancel);
        };

        messageModalConfirm.addEventListener('click', handleConfirm);
        messageModalCancel.addEventListener('click', handleCancel);
    });
}

// ===== POINTS SYSTEM =====

// Load points from localStorage
function loadPoints() {
    const saved = localStorage.getItem('pong-total-points');
    totalPoints = saved ? parseInt(saved) : 0;
    updatePointsDisplay();
}

// Save points to localStorage
function savePoints() {
    localStorage.setItem('pong-total-points', totalPoints.toString());
}

// Award points to player
function awardPoints(amount, reason) {
    const settings = DIFFICULTY_SETTINGS[gameDifficulty];
    const multiplier = settings.POINTS_MULTIPLIER;
    const finalAmount = Math.floor(amount * multiplier);

    totalPoints += finalAmount;
    sessionPoints += finalAmount;

    savePoints();
    updatePointsDisplay();

    // Optional: Show floating text animation (future enhancement)
    console.log(`+${finalAmount} pts (${reason})`);
}

// Update combo counter
function updateCombo(hit) {
    if (hit && lastHitByPlayer) {
        comboCount++;
        if (comboCount >= 3) {
            comboDisplay.style.display = 'flex';
            comboCountDisplay.textContent = `${Math.min(comboCount, POINTS_VALUES.MAX_COMBO_MULTIPLIER)}x`;
        }
    } else if (!hit) {
        resetCombo();
    }
}

// Reset combo
function resetCombo() {
    comboCount = 0;
    comboDisplay.style.display = 'none';
}

// Calculate combo multiplier
function getComboMultiplier() {
    return Math.min(comboCount, POINTS_VALUES.MAX_COMBO_MULTIPLIER);
}

// Update points display
function updatePointsDisplay() {
    totalPointsDisplay.textContent = totalPoints.toLocaleString();
    sessionPointsDisplay.textContent = sessionPoints.toLocaleString();
}

// Event listeners
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

zeroPlayerButton.addEventListener('click', () => {
    gameMode = 'zero';
    document.querySelector('.player-label').textContent = 'AI 1';
    player2Label.textContent = 'AI 2';
    player2Controls.style.display = 'none';
    // Show difficulty selection for zero player
    difficultySelection.classList.remove('hidden');
});

onePlayerButton.addEventListener('click', () => {
    gameMode = 'single';
    document.querySelector('.player-label').textContent = 'Player 1';
    player2Label.textContent = 'Computer';
    player2Controls.style.display = 'none';
    // Show difficulty selection for single player
    difficultySelection.classList.remove('hidden');
});

twoPlayerButton.addEventListener('click', () => {
    gameMode = 'multi';
    document.querySelector('.player-label').textContent = 'Player 1';
    player2Label.textContent = 'Player 2';
    player2Controls.style.display = 'flex';
    // Two player mode doesn't need difficulty
    startGame();
});

// Difficulty button event listeners
difficultyButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Update active state
        difficultyButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Set difficulty and start game
        gameDifficulty = button.dataset.difficulty;
        startGame();
    });
});

function startGame() {
    modeSelection.classList.add('hidden');
    difficultySelection.classList.add('hidden');
    gameRunning = true;
    resetBall();
    gameLoop();
}

// Drawing functions
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
}

function drawCenterLine() {
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    drawRect(0, 0, canvas.width, canvas.height, '#000');

    // Draw center line
    drawCenterLine();

    // Draw paddles with purchased color
    const paddleColor = getPaddleColor();
    drawRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height, paddleColor);
    drawRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height, paddleColor);

    // Draw ball with purchased color
    const ballColor = getBallColor();
    drawCircle(ball.x, ball.y, ball.size, ballColor);
}

// Update functions
function updatePaddles() {
    // Player 1 controls - either human or AI
    if (gameMode === 'zero') {
        // AI controls for paddle 1 in zero player mode
        updateAI1();
    } else if (gameMode === 'single' || gameMode === 'multi') {
        // Player 1 controls (W/S)
        if (keys['w'] || keys['W']) {
            paddle1.dy = -PADDLE_SPEED;
        } else if (keys['s'] || keys['S']) {
            paddle1.dy = PADDLE_SPEED;
        } else {
            paddle1.dy = 0;
        }
    }

    // Player 2 controls - either human or AI
    if (gameMode === 'single' || gameMode === 'zero') {
        // AI controls
        updateAI();
    } else {
        // Player 2 controls (Arrow Up/Down)
        if (keys['ArrowUp']) {
            paddle2.dy = -PADDLE_SPEED;
        } else if (keys['ArrowDown']) {
            paddle2.dy = PADDLE_SPEED;
        } else {
            paddle2.dy = 0;
        }
    }

    // Update paddle positions
    paddle1.y += paddle1.dy;
    paddle2.y += paddle2.dy;

    // Boundary checking
    paddle1.y = Math.max(0, Math.min(canvas.height - paddle1.height, paddle1.y));
    paddle2.y = Math.max(0, Math.min(canvas.height - paddle2.height, paddle2.y));
}

// AI logic for single-player mode (right paddle / paddle 2)
function updateAI() {
    const paddleCenter = paddle2.y + paddle2.height / 2;
    const ballY = ball.y;

    // Add some prediction - track where ball will be
    const targetY = ballY;

    // Get difficulty settings
    const settings = DIFFICULTY_SETTINGS[gameDifficulty];
    const deadZone = settings.AI_DEAD_ZONE;
    const aiSpeed = settings.AI_SPEED;

    if (paddleCenter < targetY - deadZone) {
        paddle2.dy = aiSpeed;
    } else if (paddleCenter > targetY + deadZone) {
        paddle2.dy = -aiSpeed;
    } else {
        paddle2.dy = 0;
    }
}

// AI logic for left paddle (paddle 1) in zero player mode
function updateAI1() {
    const paddleCenter = paddle1.y + paddle1.height / 2;
    const ballY = ball.y;

    // Add some prediction - track where ball will be
    const targetY = ballY;

    // Get difficulty settings
    const settings = DIFFICULTY_SETTINGS[gameDifficulty];
    const deadZone = settings.AI_DEAD_ZONE;
    const aiSpeed = settings.AI_SPEED;

    if (paddleCenter < targetY - deadZone) {
        paddle1.dy = aiSpeed;
    } else if (paddleCenter > targetY + deadZone) {
        paddle1.dy = -aiSpeed;
    } else {
        paddle1.dy = 0;
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = INITIAL_BALL_SPEED;

    // Random direction
    const angle = (Math.random() * Math.PI / 2) - Math.PI / 4; // -45 to 45 degrees
    const direction = Math.random() < 0.5 ? 1 : -1;

    ball.dx = Math.cos(angle) * ball.speed * direction;
    ball.dy = Math.sin(angle) * ball.speed;
}

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision (top and bottom)
    if (ball.y - ball.size <= 0 || ball.y + ball.size >= canvas.height) {
        ball.dy *= -1;
        playWallSound();
    }

    // Get difficulty settings
    const settings = DIFFICULTY_SETTINGS[gameDifficulty];

    // Paddle collision detection
    // Left paddle (Player 1)
    if (ball.x - ball.size <= paddle1.x + paddle1.width &&
        ball.x + ball.size >= paddle1.x &&
        ball.y >= paddle1.y &&
        ball.y <= paddle1.y + paddle1.height) {

        playHitSound();

        // Calculate hit position on paddle (-1 to 1)
        const hitPos = ((ball.y - paddle1.y) / paddle1.height) - 0.5;

        // Adjust angle based on where ball hit the paddle
        const angle = hitPos * Math.PI / 3; // Max 60 degrees

        ball.speed = Math.min(ball.speed + settings.BALL_SPEED_INCREMENT, settings.MAX_BALL_SPEED);
        ball.dx = Math.abs(Math.cos(angle) * ball.speed);
        ball.dy = Math.sin(angle) * ball.speed;

        // Prevent ball from getting stuck
        ball.x = paddle1.x + paddle1.width + ball.size;

        // Award points for hitting ball (only in single player mode, not zero player)
        if (gameMode === 'single') {
            lastHitByPlayer = true;
            updateCombo(true);

            let points = POINTS_VALUES.BALL_HIT;

            // Combo multiplier
            const comboMult = getComboMultiplier();
            if (comboMult > 1) {
                points *= comboMult;
            }

            // Speed bonus
            if (ball.speed >= POINTS_VALUES.SPEED_BONUS_THRESHOLD) {
                points += POINTS_VALUES.SPEED_BONUS;
            }

            awardPoints(points, `Ball Hit (${comboMult}x combo)`);
        }
    }

    // Right paddle (Player 2)
    if (ball.x + ball.size >= paddle2.x &&
        ball.x - ball.size <= paddle2.x + paddle2.width &&
        ball.y >= paddle2.y &&
        ball.y <= paddle2.y + paddle2.height) {

        playHitSound();

        const hitPos = ((ball.y - paddle2.y) / paddle2.height) - 0.5;
        const angle = hitPos * Math.PI / 3;

        ball.speed = Math.min(ball.speed + settings.BALL_SPEED_INCREMENT, settings.MAX_BALL_SPEED);
        ball.dx = -Math.abs(Math.cos(angle) * ball.speed);
        ball.dy = Math.sin(angle) * ball.speed;

        ball.x = paddle2.x - ball.size;
    }

    // Score detection
    if (ball.x + ball.size < 0) {
        player2Score++;
        score2Display.textContent = player2Score;
        playScoreSound();

        // Player missed - reset combo
        if (gameMode === 'single') {
            resetCombo();
            lastHitByPlayer = false;
        }

        resetBall();
        checkWinner();
    } else if (ball.x - ball.size > canvas.width) {
        player1Score++;
        score1Display.textContent = player1Score;
        playScoreSound();

        // Player scored - award points
        if (gameMode === 'single') {
            awardPoints(POINTS_VALUES.WIN_RALLY, 'Won Rally');
        }

        resetBall();
        checkWinner();
    }
}

async function checkWinner() {
    if (player1Score >= WINNING_SCORE || player2Score >= WINNING_SCORE) {
        gameRunning = false;
        let winner;
        if (gameMode === 'single') {
            winner = player1Score >= WINNING_SCORE ? 'You' : 'Computer';

            // Award win bonus if player won
            if (player1Score >= WINNING_SCORE) {
                awardPoints(POINTS_VALUES.WIN_MATCH, 'Won Match!');
            }
        } else if (gameMode === 'zero') {
            winner = player1Score >= WINNING_SCORE ? 'AI 1' : 'AI 2';
        } else {
            winner = player1Score >= WINNING_SCORE ? 'Player 1' : 'Player 2';
        }

        // Save highscore (don't save for zero player mode)
        if (gameMode !== 'zero') {
            addHighscore(gameMode, winner, player1Score, player2Score);
        }

        setTimeout(async () => {
            await showAlert(`${winner} wins! Final score: ${player1Score} - ${player2Score}`, 'Game Over');
            player1Score = 0;
            player2Score = 0;
            score1Display.textContent = '0';
            score2Display.textContent = '0';
            player2Controls.style.display = 'flex';
            difficultySelection.classList.add('hidden');
            modeSelection.classList.remove('hidden');
            // Reset difficulty to normal
            gameDifficulty = 'normal';
            difficultyButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.difficulty === 'normal');
            });
            // Reset combo
            resetCombo();
        }, 100);
    }
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;

    updatePaddles();
    updateBall();
    draw();

    requestAnimationFrame(gameLoop);
}

// ===== HIGHSCORE SYSTEM =====

// Load highscores from localStorage
function loadHighscores() {
    const single = localStorage.getItem('pong-highscores-single');
    const multi = localStorage.getItem('pong-highscores-multi');

    return {
        single: single ? JSON.parse(single) : [],
        multi: multi ? JSON.parse(multi) : []
    };
}

// Save highscores to localStorage
function saveHighscores(singleScores, multiScores) {
    localStorage.setItem('pong-highscores-single', JSON.stringify(singleScores));
    localStorage.setItem('pong-highscores-multi', JSON.stringify(multiScores));
}

// Add a new highscore
function addHighscore(mode, winner, score1, score2) {
    const scores = loadHighscores();
    const date = new Date().toLocaleDateString();

    if (mode === 'single') {
        // Only save if player won
        if (score1 >= WINNING_SCORE) {
            scores.single.push({
                score: `${score1}-${score2}`,
                date: date,
                timestamp: Date.now()
            });

            // Sort by score (higher player score is better)
            scores.single.sort((a, b) => {
                const aPlayerScore = parseInt(a.score.split('-')[0]);
                const bPlayerScore = parseInt(b.score.split('-')[0]);
                const aCompScore = parseInt(a.score.split('-')[1]);
                const bCompScore = parseInt(b.score.split('-')[1]);

                // First compare player scores (higher is better)
                if (bPlayerScore !== aPlayerScore) {
                    return bPlayerScore - aPlayerScore;
                }
                // If tied, lower computer score is better
                return aCompScore - bCompScore;
            });

            // Keep only top 10
            scores.single = scores.single.slice(0, 10);
        }
    } else {
        scores.multi.push({
            winner: winner,
            score: `${score1}-${score2}`,
            date: date,
            timestamp: Date.now()
        });

        // Keep only last 10 games
        scores.multi = scores.multi.slice(-10).reverse();
    }

    saveHighscores(scores.single, scores.multi);
    displayHighscores();
}

// Display highscores in the modal
function displayHighscores() {
    const scores = loadHighscores();

    // Display single-player scores
    if (scores.single.length === 0) {
        singleScoresList.innerHTML = '<div class="empty-message">No highscores yet. Beat the computer to set a record!</div>';
    } else {
        singleScoresList.innerHTML = scores.single.map((score, index) => `
            <div class="highscore-item ${index === 0 ? 'top-score' : ''}">
                <span>${index + 1}</span>
                <span>${score.score}</span>
                <span>${score.date}</span>
            </div>
        `).join('');
    }

    // Display multi-player scores
    if (scores.multi.length === 0) {
        multiScoresList.innerHTML = '<div class="empty-message">No games played yet. Play a 2-player game to see results!</div>';
    } else {
        multiScoresList.innerHTML = scores.multi.map((score, index) => `
            <div class="highscore-item">
                <span>${index + 1}</span>
                <span>${score.winner}</span>
                <span>${score.score}</span>
                <span>${score.date}</span>
            </div>
        `).join('');
    }
}

// Reset all highscores
async function resetHighscores() {
    const confirmed = await showConfirm('Are you sure you want to reset all highscores? This cannot be undone.', 'Reset Highscores');
    if (confirmed) {
        saveHighscores([], []);
        displayHighscores();
    }
}

// Event listeners for highscore modal
highscoreToggleBtn.addEventListener('click', () => {
    highscoreModal.classList.remove('hidden');
    displayHighscores();
});

closeModalBtn.addEventListener('click', () => {
    highscoreModal.classList.add('hidden');
});

// Close modal when clicking outside
highscoreModal.addEventListener('click', (e) => {
    if (e.target === highscoreModal) {
        highscoreModal.classList.add('hidden');
    }
});

// Tab switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;

        // Update active tab
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update active list
        document.getElementById('single-highscores').classList.remove('active');
        document.getElementById('multi-highscores').classList.remove('active');

        if (mode === 'single') {
            document.getElementById('single-highscores').classList.add('active');
        } else {
            document.getElementById('multi-highscores').classList.add('active');
        }
    });
});

// Reset button
resetHighscoresBtn.addEventListener('click', resetHighscores);

// ===== SHOP SYSTEM =====

// Purchase data structure
let purchases = {
    ballColor: '#fff',
    paddleColor: '#fff',
    powerups: []
};

// Load purchases from localStorage
function loadPurchases() {
    const saved = localStorage.getItem('pong-purchases');
    if (saved) {
        purchases = JSON.parse(saved);
    }
    applyPurchases();
}

// Save purchases to localStorage
function savePurchases() {
    localStorage.setItem('pong-purchases', JSON.stringify(purchases));
}

// Apply purchases to game
function applyPurchases() {
    // Apply colors (will be used in draw functions)
    // Power-ups are applied at game start
}

// Get current ball color
function getBallColor() {
    return purchases.ballColor || '#fff';
}

// Get current paddle color
function getPaddleColor() {
    return purchases.paddleColor || '#fff';
}

// Check if item is owned
function isOwned(itemId) {
    const item = document.querySelector(`[data-item="${itemId}"]`);
    if (!item) return false;

    const type = item.dataset.type;
    const value = item.dataset.value;

    if (type === 'ballColor') {
        return purchases.ballColor === value;
    } else if (type === 'paddleColor') {
        return purchases.paddleColor === value;
    }

    return false;
}

// Update shop display
function updateShopDisplay() {
    shopBalanceDisplay.textContent = `${totalPoints.toLocaleString()} Points`;

    // Update all shop items
    document.querySelectorAll('.shop-item').forEach(item => {
        const cost = parseInt(item.dataset.cost);
        const buyBtn = item.querySelector('.buy-btn');
        const itemId = item.dataset.item;

        if (isOwned(itemId)) {
            item.classList.add('owned');
            buyBtn.textContent = 'OWNED';
            buyBtn.classList.add('owned');
            buyBtn.disabled = true;
        } else {
            item.classList.remove('owned');
            buyBtn.classList.remove('owned');
            buyBtn.textContent = `${cost} pts`;

            if (totalPoints < cost) {
                buyBtn.disabled = true;
            } else {
                buyBtn.disabled = false;
            }
        }
    });
}

// Purchase item
async function purchaseItem(itemElement) {
    const cost = parseInt(itemElement.dataset.cost);
    const type = itemElement.dataset.type;
    const value = itemElement.dataset.value;
    const name = itemElement.querySelector('.item-name').textContent;

    if (totalPoints < cost) {
        await showAlert('Not enough points!', 'Purchase Failed');
        return;
    }

    if (isOwned(itemElement.dataset.item)) {
        await showAlert('You already own this item!', 'Already Owned');
        return;
    }

    // Deduct points
    totalPoints -= cost;
    savePoints();

    // Apply purchase
    if (type === 'ballColor') {
        purchases.ballColor = value;
    } else if (type === 'paddleColor') {
        purchases.paddleColor = value;
    } else if (type === 'powerup') {
        purchases.powerups.push(value);
    }

    savePurchases();
    applyPurchases();
    updateShopDisplay();
    updatePointsDisplay();

    await showAlert(`Purchased: ${name}!`, 'Success');
}

// Shop modal event listeners
shopToggleBtn.addEventListener('click', () => {
    shopModal.classList.remove('hidden');
    updateShopDisplay();
});

closeShopBtn.addEventListener('click', () => {
    shopModal.classList.add('hidden');
});

shopModal.addEventListener('click', (e) => {
    if (e.target === shopModal) {
        shopModal.classList.add('hidden');
    }
});

// Buy button listeners
document.querySelectorAll('.buy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const shopItem = e.target.closest('.shop-item');
        purchaseItem(shopItem);
    });
});

// Reset points button
resetPointsBtn.addEventListener('click', async () => {
    const confirmed = await showConfirm('Are you sure you want to reset all points? This cannot be undone.', 'Reset Points');
    if (confirmed) {
        totalPoints = 0;
        sessionPoints = 0;
        savePoints();
        updatePointsDisplay();
        updateShopDisplay();
    }
});

// Reset purchases button
resetPurchasesBtn.addEventListener('click', async () => {
    const confirmed = await showConfirm('Are you sure you want to reset all purchases? You will NOT get refunded.', 'Reset Purchases');
    if (confirmed) {
        purchases = {
            ballColor: '#fff',
            paddleColor: '#fff',
            powerups: []
        };
        savePurchases();
        applyPurchases();
        updateShopDisplay();
        await showAlert('All purchases have been reset!', 'Reset Complete');
    }
});

// Initialize points and shop on page load
loadPoints();
loadPurchases();

// Initial draw
draw();
