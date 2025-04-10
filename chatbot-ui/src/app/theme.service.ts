import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  constructor() { }
  private darkMode = new BehaviorSubject<boolean>(false);
  currentTheme = this.darkMode.asObservable();

  toggleTheme() {
    this.darkMode.next(!this.darkMode.value);
  }

  isDarkMode() {
    return this.darkMode.value;
  }
  
}
