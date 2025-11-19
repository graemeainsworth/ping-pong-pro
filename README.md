# Pong Game - 1 or 2 Players

A classic Pong game implementation with single-player AI and two-player modes, featuring sound effects and modern UI.

## How to Play

1. Open `index.html` in a web browser
2. Choose your game mode:
   - **1 PLAYER** - Play against the computer AI
   - **2 PLAYERS** - Play with a friend locally
3. The mode selection will disappear and the game begins

## Controls

### Single Player Mode
- **Player (Left Paddle)**:
  - `W` key - Move up
  - `S` key - Move down
- **Computer (Right Paddle)**: Controlled by AI

### Two Player Mode
- **Player 1 (Left Paddle)**:
  - `W` key - Move up
  - `S` key - Move down

- **Player 2 (Right Paddle)**:
  - `↑` Arrow Up - Move up
  - `↓` Arrow Down - Move down

## Game Rules

- First player to score 11 points wins
- Ball speed increases with each paddle hit
- Ball angle changes based on where it hits the paddle
- Sound effects play when:
  - Ball hits a paddle
  - Ball hits top/bottom walls
  - A player scores

## Highscore System

- Click **"VIEW HIGHSCORES"** button to open the highscore modal
- **Single Player Mode**:
  - Only wins against the computer are tracked
  - Top 10 scores are saved (sorted by your score, then by computer's lowest score)
  - Shows your final score vs the computer
- **Two Player Mode**:
  - Last 10 games are recorded
  - Shows winner and final scores for each game
- Highscores are saved in your browser's localStorage
- Click **"Reset Highscores"** to clear all saved scores

## Features

- 🎮 Two game modes: Single-player vs AI or local multiplayer
- 🤖 Intelligent AI opponent with adjustable difficulty
- 🏆 Highscore tracking with localStorage persistence
- 📊 Separate highscore charts for single-player and two-player modes
- ✨ Modern, colorful UI with gradient backgrounds
- 🎮 Smooth 60 FPS gameplay
- 🔊 Web Audio API sound effects
- 📊 Real-time score tracking
- 🎯 Dynamic ball physics
- 🏓 Responsive paddle controls

## Technical Details

- Pure vanilla JavaScript (no dependencies)
- HTML5 Canvas for rendering
- Web Audio API for sound generation
- CSS3 for modern styling

## Browser Compatibility

Works in all modern browsers that support:
- HTML5 Canvas
- Web Audio API
- ES6 JavaScript

Enjoy the game!
