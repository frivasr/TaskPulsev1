import { Component, OnInit, AfterViewInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createAnimation, IonicModule } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { TasksService, Task } from '../../services/tasks.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class HomePage implements OnInit, AfterViewInit {
  usuario = '';
  email = '';
  total = 0;
  pendientes = 0;
  completadas = 0;
  recientes: Task[] = [];
  tasks: Task[] = [];
  now = Date.now();
  activePendingDisplay = '';
  avgCompletedDisplay = '';
  oldestPendingDisplay = '';
  private ticker: any;
  @ViewChildren('cardEl', { read: ElementRef }) cards!: QueryList<ElementRef>;

  constructor(private auth: AuthService, private tasksSvc: TasksService) {}

  ngOnInit() {
    this.usuario = this.auth.getUserName();
    this.auth.userName$.subscribe(name => this.usuario = name);

    // Cargar email del perfil si existe
    const stored = localStorage.getItem('profile');
    const profile = stored ? JSON.parse(stored) : null;
    this.email = profile?.email || '';

    // Suscribirse a tareas para mostrar estadísticas y recientes
    this.tasksSvc.tasks$.subscribe(tasks => {
      this.tasks = tasks;
      this.total = tasks.length;
      this.pendientes = tasks.filter(t => t.estado === 'pendiente').length;
      this.completadas = tasks.filter(t => t.estado === 'completada').length;
      this.recientes = tasks.slice(-3).reverse();
      this.recomputeTimers();
    });

    // Ticker para actualizar tiempos en pantalla cada segundo
    this.ticker = setInterval(() => {
      this.now = Date.now();
      this.recomputeTimers();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.ticker) clearInterval(this.ticker);
  }

  ngAfterViewInit() {
    // Animación de entrada: fade + slide para las tarjetas
    setTimeout(() => {
      let delay = 0;
      this.cards.forEach((card) => {
        const anim = createAnimation()
          .addElement(card.nativeElement)
          .duration(400)
          .delay(delay)
          .fromTo('opacity', '0', '1')
          .fromTo('transform', 'translateY(12px)', 'translateY(0)');
        anim.play();
        delay += 100;
      });
    }, 0);
  }

  private recomputeTimers() {
    // Total tiempo activo de pendientes (desde creación hasta ahora)
    const totalPendingMs = this.tasks
      .filter(t => t.estado === 'pendiente')
      .reduce((sum, t) => sum + (this.now - (t.createdAt || this.now)), 0);
    this.activePendingDisplay = this.formatDuration(totalPendingMs);

    // Promedio duración de completadas (completedAt - createdAt)
    const completed = this.tasks.filter(t => t.estado === 'completada' && typeof t.completedAt === 'number');
    const avgMs = completed.length
      ? completed.reduce((sum, t) => sum + Math.max(0, (t.completedAt! - (t.createdAt || t.completedAt!))), 0) / completed.length
      : 0;
    this.avgCompletedDisplay = this.formatDuration(avgMs);

    // Pendiente más antigua (mayor tiempo activo desde createdAt)
    const pendings = this.tasks.filter(t => t.estado === 'pendiente');
    const oldestMs = pendings.length
      ? Math.max(...pendings.map(t => Math.max(0, this.now - (t.createdAt || this.now))))
      : 0;
    this.oldestPendingDisplay = this.formatDuration(oldestMs);
  }

  getActiveMs(t: Task): number {
    if (t.estado === 'pendiente') return Math.max(0, this.now - (t.createdAt || this.now));
    const end = typeof t.completedAt === 'number' ? t.completedAt : (t.createdAt || this.now);
    return Math.max(0, end - (t.createdAt || end));
  }

  formatDuration(ms: number): string {
    const s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${sec}s`;
    return `${sec}s`;
  }
}
