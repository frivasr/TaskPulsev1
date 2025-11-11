import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class ProfilePage implements OnInit {
  form!: FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthService, private toastCtrl: ToastController) { }

  ngOnInit() {
    const stored = localStorage.getItem('profile');
    const profile = stored ? JSON.parse(stored) : { nombre: '', email: '', edad: null };
    this.form = this.fb.group({
      nombre: [profile.nombre, [Validators.required, Validators.minLength(2)]],
      email: [profile.email, [Validators.required, Validators.email]],
      edad: [profile.edad, [Validators.required, Validators.min(0)]],
    });
  }

  async guardar() {
    if (this.form.valid) {
      const value = this.form.value;
      localStorage.setItem('profile', JSON.stringify(value));
      if (value.nombre && typeof value.nombre === 'string') {
        this.auth.setUserName(value.nombre);
      }
      const toast = await this.toastCtrl.create({
        message: 'Perfil guardado',
        duration: 1500,
        position: 'bottom'
      });
      await toast.present();
    }
  }

  get nombre() { return this.form.get('nombre'); }
  get email() { return this.form.get('email'); }
  get edad() { return this.form.get('edad'); }
}
