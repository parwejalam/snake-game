import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SnakeGameComponent } from "./snake-game/snake-game.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SnakeGameComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'snake-game';
}
