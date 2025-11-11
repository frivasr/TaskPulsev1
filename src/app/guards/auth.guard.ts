import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const usuario = localStorage.getItem('usuario');
    if (usuario && usuario.trim().length > 0) {
      return true;
    }
    return this.router.createUrlTree(['/login']);
  }
}
