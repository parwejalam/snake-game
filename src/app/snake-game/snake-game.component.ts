// snake-game.component.ts
import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Food {
  x: number;
  y: number;
  type: string;
  color: string;
  points: number;
}

@Component({
  selector: 'app-snake-game',
  imports: [FormsModule],
  standalone: true,
  templateUrl: './snake-game.component.html',
  styleUrls: ['./snake-game.component.scss']
})
export class SnakeGameComponent implements OnInit, OnDestroy {
  @ViewChild('gameBoard', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  
  gridSize = 10; // Smaller grid size for pixel look
  tileCount = 30; // More tiles for better movement

   // Pixel snake colors
   snakeColors = {
    head: '#ff0000',
    body: '#00ff00',
    outline: '#000000'
  };
   // Food types
   foods = [
    { type: 'apple', color: '#ff0000', points: 10 },
    { type: 'banana', color: '#ffff00', points: 20 },
    { type: 'grape', color: '#800080', points: 30 },
    { type: 'orange', color: '#ffa500', points: 15 }
  ];

  
  score = 0;
  selectedSpeed = 200;
  
  snake = [{ x: 10, y: 10 }];
  dx = 0;
  dy = 0;
  food = this.generateFood();
  
  gameLoop: any;
  isGameOver = false;
  isGameStarted = false;

  ngOnInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.canvas.nativeElement.width = this.gridSize * this.tileCount;
    this.canvas.nativeElement.height = this.gridSize * this.tileCount;
  }

  ngOnDestroy() {
    clearInterval(this.gameLoop);
  }

  startGame() {
    this.isGameOver = false;
    this.isGameStarted = true;
    this.score = 0;
    this.snake = [{ x: 10, y: 10 }];
    this.dx = 1; // Changed from 0 to 1 (initial direction: right)
    this.dy = 0; // Keep dy as 0
    this.food = this.generateFood();
    
    if (this.gameLoop) clearInterval(this.gameLoop);
    this.gameLoop = setInterval(() => this.update(), this.selectedSpeed);
  }

  update() {
    if (!this.isGameStarted) return;

    const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
    this.snake.unshift(head);

    if (this.checkCollision()) {
      this.gameOver();
      return;
    }

    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += this.food.points; // Use food points instead of fixed 10
      this.food = this.generateFood();
    } else {
      this.snake.pop();
    }

    this.draw();
  }

  draw() {
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);

    // Draw snake with pixel art style
    this.snake.forEach((segment, index) => {
      // Snake body pixel effect
      this.ctx.fillStyle = this.snakeColors.outline;
      this.ctx.fillRect(
        segment.x * this.gridSize,
        segment.y * this.gridSize,
        this.gridSize,
        this.gridSize
      );
      
      this.ctx.fillStyle = index === 0 ? this.snakeColors.head : this.snakeColors.body;
      this.ctx.fillRect(
        segment.x * this.gridSize + 1,
        segment.y * this.gridSize + 1,
        this.gridSize - 2,
        this.gridSize - 2
      );
    });

    // Draw food with different types
    this.ctx.fillStyle = this.food.color;
    this.ctx.beginPath();
    this.ctx.arc(
      this.food.x * this.gridSize + this.gridSize/2,
      this.food.y * this.gridSize + this.gridSize/2,
      this.gridSize/2 - 1,
      0,
      Math.PI * 2
    );
    this.ctx.fill();
    
    // Food inner highlight
    this.ctx.fillStyle = '#ffffff50';
    this.ctx.beginPath();
    this.ctx.arc(
      this.food.x * this.gridSize + this.gridSize/2 - 2,
      this.food.y * this.gridSize + this.gridSize/2 - 2,
      this.gridSize/4,
      0,
      Math.PI * 2
    );
    this.ctx.fill();
  }

  changeDirection(dx: number, dy: number) {
    if (this.dx === -dx && dx !== 0) return;
    if (this.dy === -dy && dy !== 0) return;
    this.dx = dx;
    this.dy = dy;
    if (!this.isGameStarted) this.startGame();
  }

  private checkCollision() {
    const head = this.snake[0];
    return (
      head.x < 0 || head.x >= this.tileCount ||
      head.y < 0 || head.y >= this.tileCount ||
      this.snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)
    );
  }

  private gameOver() {
    this.isGameOver = true;
    this.isGameStarted = false;
    clearInterval(this.gameLoop);
  }

  private generateFood(): Food {
    let newFood: Food;
    do {
      newFood = {
        x: Math.floor(Math.random() * this.tileCount),
        y: Math.floor(Math.random() * this.tileCount),
        ...this.foods[Math.floor(Math.random() * this.foods.length)]
      };
    } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch(event.key) {
      case 'ArrowLeft':
        this.changeDirection(-1, 0);
        break;
      case 'ArrowUp':
        this.changeDirection(0, -1);
        break;
      case 'ArrowRight':
        this.changeDirection(1, 0);
        break;
      case 'ArrowDown':
        this.changeDirection(0, 1);
        break;
      case ' ':
        if (this.isGameOver) this.startGame();
        break;
    }
  }

  @HostListener('window:resize')
onResize() {
  this.canvas.nativeElement.width = this.gridSize * this.tileCount;
  this.canvas.nativeElement.height = this.gridSize * this.tileCount;
  this.draw();
}

  // onSpeedChange(event: Event) {
  //   const target = event.target as HTMLInputElement;
  //   const newValue = parseInt(target.value, 10);
  //   if (!isNaN(newValue)) {
  //     this.selectedSpeed = newValue;
  //     if (this.gameLoop) {
  //       clearInterval(this.gameLoop);
  //       this.gameLoop = setInterval(() => this.update(), this.selectedSpeed);
  //     }
  //   }
  // }
}