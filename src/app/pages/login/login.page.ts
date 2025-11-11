import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule]
})
export class LoginPage implements OnInit {
  form!: FormGroup;
  showPassword = false;
  remember = true;

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      usuario: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  login() {
    if (this.form.valid) {
      const usuario = this.form.value.usuario;
      this.auth.setUserName(usuario);
      // Aplicar Recordarme inmediatamente
      if (!this.remember) {
        localStorage.removeItem('usuario');
      }
      this.navCtrl.navigateRoot('/home');
    }
  }

  get usuario() { return this.form.get('usuario'); }
  get password() { return this.form.get('password'); }
}
