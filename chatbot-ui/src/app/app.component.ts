import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'chatbot-ui';
  constructor(private themeService: ThemeService) { }

  toggleTheme() {
    this.themeService.toggleTheme();
    document.body.classList.toggle('dark', this.themeService.isDarkMode());
  }
}
