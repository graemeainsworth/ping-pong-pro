import { useState, useEffect, useRef } from 'react';
import './App.css';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 10;
const INITIAL_BALL_SPEED = 5;

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);

  const paddle1Ref = useRef({ x: 20, y: CANVAS_HEIGHT / 2 - 50, dy: 0 });
  const paddle2Ref = useRef({ x: CANVAS_WIDTH - 30, y: CANVAS_HEIGHT / 2 - 50, dy: 0 });
  const ballRef = useRef({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    dx: INITIAL_BALL_SPEED,
    dy: INITIAL_BALL_SPEED,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      // Update paddle1 (AI)
      const targetY = ballRef.current.y;
      const paddle1Center = paddle1Ref.current.y + PADDLE_HEIGHT / 2;
      if (paddle1Center < targetY - 20) {
        paddle1Ref.current.dy = 4.5;
      } else if (paddle1Center > targetY + 20) {
        paddle1Ref.current.dy = -4.5;
      } else {
        paddle1Ref.current.dy = 0;
      }
      paddle1Ref.current.y = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, paddle1Ref.current.y + paddle1Ref.current.dy));

      // Update paddle2 (AI)
      const paddle2Center = paddle2Ref.current.y + PADDLE_HEIGHT / 2;
      if (paddle2Center < targetY - 20) {
        paddle2Ref.current.dy = 4.5;
      } else if (paddle2Center > targetY + 20) {
        paddle2Ref.current.dy = -4.5;
      } else {
        paddle2Ref.current.dy = 0;
      }
      paddle2Ref.current.y = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, paddle2Ref.current.y + paddle2Ref.current.dy));

      // Update ball
      ballRef.current.x += ballRef.current.dx;
      ballRef.current.y += ballRef.current.dy;

      // Wall collision
      if (ballRef.current.y <= 0 || ballRef.current.y >= CANVAS_HEIGHT) {
        ballRef.current.dy *= -1;
      }

      // Paddle collisions
      if (ballRef.current.x - BALL_SIZE <= paddle1Ref.current.x + PADDLE_WIDTH &&
          ballRef.current.y >= paddle1Ref.current.y &&
          ballRef.current.y <= paddle1Ref.current.y + PADDLE_HEIGHT) {
        ballRef.current.dx = Math.abs(ballRef.current.dx);
      }

      if (ballRef.current.x + BALL_SIZE >= paddle2Ref.current.x &&
          ballRef.current.y >= paddle2Ref.current.y &&
          ballRef.current.y <= paddle2Ref.current.y + PADDLE_HEIGHT) {
        ballRef.current.dx = -Math.abs(ballRef.current.dx);
      }

      // Score
      if (ballRef.current.x < 0) {
        setScore2(s => s + 1);
        resetBall();
      } else if (ballRef.current.x > CANVAS_WIDTH) {
        setScore1(s => s + 1);
        resetBall();
      }

      // Draw
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Center line
      ctx.setLineDash([10, 10]);
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH / 2, 0);
      ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);

      // Paddles
      ctx.fillStyle = '#fff';
      ctx.fillRect(paddle1Ref.current.x, paddle1Ref.current.y, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.fillRect(paddle2Ref.current.x, paddle2Ref.current.y, PADDLE_WIDTH, PADDLE_HEIGHT);

      // Ball
      ctx.beginPath();
      ctx.arc(ballRef.current.x, ballRef.current.y, BALL_SIZE, 0, Math.PI * 2);
      ctx.fill();

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const resetBall = () => {
    ballRef.current = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      dx: (Math.random() > 0.5 ? 1 : -1) * INITIAL_BALL_SPEED,
      dy: (Math.random() - 0.5) * INITIAL_BALL_SPEED,
    };
  };

  return (
    <div className="app">
      <h1 style={{ color: 'white', textAlign: 'center' }}>Ping Pong Pro - React + TypeScript</h1>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', color: 'white', fontSize: '24px', marginBottom: '20px' }}>
        <div><span>AI 1:</span> <span style={{ fontSize: '36px' }}>{score1}</span></div>
        <div><span>AI 2:</span> <span style={{ fontSize: '36px' }}>{score2}</span></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{ border: '4px solid white', borderRadius: '8px' }}
        />
      </div>
      <p style={{ color: 'white', textAlign: 'center', marginTop: '20px' }}>
        React + TypeScript MVP - Full features coming soon!
      </p>
    </div>
  );
}

export default App;
