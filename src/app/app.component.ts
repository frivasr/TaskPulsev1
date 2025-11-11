import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  usuario = '';

  constructor(private navCtrl: NavController, private auth: AuthService) {}

  ngOnInit() {
    this.usuario = this.auth.getUserName();
    this.auth.userName$.subscribe(name => this.usuario = name);
  }

  logout() {
    this.auth.logout();
    this.navCtrl.navigateRoot('/login');
  }
}
