import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userNameSubject = new BehaviorSubject<string>('frivas');
  userName$ = this.userNameSubject.asObservable();

  setUserName(name: string) {
    this.userNameSubject.next(name);
    localStorage.setItem('usuario', name);
  }

  getUserName(): string {
    const stored = localStorage.getItem('usuario');
    if (stored) {
      const normalized = stored === 'demo' ? 'frivas' : stored;
      if (normalized !== stored) {
        localStorage.setItem('usuario', normalized);
      }
      this.userNameSubject.next(normalized);
      return normalized;
    }
    return this.userNameSubject.value;
  }

  logout() {
    localStorage.removeItem('usuario');
    this.userNameSubject.next('');
  }
}
