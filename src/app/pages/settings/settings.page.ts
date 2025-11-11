import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, MatSlideToggleModule]
})
export class SettingsPage implements OnInit {
  dark = false;
  themeOption = 'system';

  constructor() { }

  ngOnInit() {
    const storedDark = localStorage.getItem('dark');
    this.dark = storedDark ? storedDark === 'true' : false;
    const storedTheme = localStorage.getItem('themeOption');
    this.themeOption = storedTheme || 'system';
    this.applyTheme();
  }

  toggleDark(event?: any) {
    // Si el toggle recibe evento de Angular Material, usa su estado; si no, invierte
    this.dark = event?.checked !== undefined ? event.checked : !this.dark;
    // Alinear la preferencia explícita con el toggle para efecto inmediato
    this.themeOption = this.dark ? 'dark' : 'light';
    localStorage.setItem('dark', String(this.dark));
    localStorage.setItem('themeOption', this.themeOption);
    this.applyTheme();
  }

  applyTheme() {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const useDark = this.themeOption === 'dark' || (this.themeOption === 'system' && prefersDark) || this.dark;
    document.body.classList.toggle('dark', useDark);
  }

  onThemeChange(value: 'system' | 'light' | 'dark') {
    this.themeOption = value;
    localStorage.setItem('themeOption', value);
    this.applyTheme();
  }

  // Escucha cambios del sistema cuando está en modo 'system'
  ngAfterViewInit() {
    if (window.matchMedia) {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => {
        if (this.themeOption === 'system') this.applyTheme();
      };
      try {
        media.addEventListener('change', handler);
      } catch {
        // Safari
        // @ts-ignore
        media.addListener(handler);
      }
    }
  }
}
