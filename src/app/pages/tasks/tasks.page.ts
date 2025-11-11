import { Component, OnInit, AfterViewInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { createAnimation, IonicModule, AlertController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TasksService, Task } from '../../services/tasks.service';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.page.html',
  styleUrls: ['./tasks.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule]
})
export class TasksPage implements OnInit, AfterViewInit {
  form!: FormGroup;
  editId: number | null = null;
  tasks: Task[] = [];
  filtered: Task[] = [];
  filter: 'todas' | 'pendientes' | 'completadas' = 'todas';
  @ViewChildren('taskItem', { read: ElementRef }) taskItems!: QueryList<ElementRef>;

  constructor(private fb: FormBuilder, private tasksSvc: TasksService, private alertCtrl: AlertController) { }

  ngOnInit() {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: ['', [Validators.required, Validators.minLength(2)]],
    });
    this.tasksSvc.tasks$.subscribe(t => {
      this.tasks = t;
      this.applyFilter();
    });
  }

  ngAfterViewInit() {}

  submit() {
    if (this.form.invalid) return;
    const { nombre, descripcion } = this.form.value;
    if (this.editId) {
      this.tasksSvc.update(this.editId, { nombre, descripcion });
      // Animación de confirmación en el ítem editado
      const id = this.editId;
      this.editId = null;
      setTimeout(() => {
        const el = this.findTaskElement(id!);
        if (el) {
          const anim = createAnimation()
            .addElement(el)
            .duration(300)
            .keyframes([
              { offset: 0, transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(34,197,94,0)' },
              { offset: 0.5, transform: 'scale(1.015)', boxShadow: '0 0 0 4px rgba(34,197,94,0.35)' },
              { offset: 1, transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(34,197,94,0)' }
            ]);
          anim.play();
        }
      }, 0);
    } else {
      const added = this.tasksSvc.add(nombre, descripcion);
      // Animación para el último item agregado
      setTimeout(() => {
        const items = this.taskItems.toArray();
        const last = items.find(el => el.nativeElement?.dataset?.id == String(added.id)) || items[items.length - 1];
        if (last) {
          createAnimation()
            .addElement(last.nativeElement)
            .duration(300)
            .fromTo('transform', 'translateY(-8px)', 'translateY(0)')
            .fromTo('opacity', '0', '1')
            .play();
        }
      }, 0);
    }
    this.form.reset();
  }

  edit(task: Task) {
    this.editId = task.id;
    this.form.setValue({ nombre: task.nombre, descripcion: task.descripcion });
    // Animación de énfasis al editar
    const el = this.findTaskElement(task.id);
    if (el) {
      createAnimation()
        .addElement(el)
        .duration(250)
        .keyframes([
          { offset: 0, transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(99,102,241,0)' },
          { offset: 0.5, transform: 'scale(1.02)', boxShadow: '0 0 0 4px rgba(99,102,241,0.35)' },
          { offset: 1, transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(99,102,241,0)' }
        ])
        .play();
    }
  }

  async remove(task: Task) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar tarea',
      message: `¿Seguro que deseas eliminar "${task.nombre}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => {
          // Animación de salida antes de eliminar
          const el = this.findTaskElement(task.id);
          if (el) {
            const anim = createAnimation()
              .addElement(el)
              .duration(250)
              .fromTo('opacity', '1', '0')
              .fromTo('transform', 'translateX(0)', 'translateX(12px)');
            anim.onFinish(() => {
              this.tasksSvc.remove(task.id);
              if (this.editId === task.id) {
                this.editId = null;
                this.form.reset();
              }
              this.applyFilter();
            });
            anim.play();
          } else {
            this.tasksSvc.remove(task.id);
            if (this.editId === task.id) {
              this.editId = null;
              this.form.reset();
            }
            this.applyFilter();
          }
        }}
      ]
    });
    await alert.present();
  }

  toggle(task: Task) {
    this.tasksSvc.toggle(task.id);
    this.applyFilter();
  }

  applyFilter() {
    switch (this.filter) {
      case 'pendientes':
        this.filtered = this.tasks.filter(t => t.estado === 'pendiente');
        break;
      case 'completadas':
        this.filtered = this.tasks.filter(t => t.estado === 'completada');
        break;
      default:
        this.filtered = this.tasks.slice();
    }
  }

  setFilter(f: 'todas' | 'pendientes' | 'completadas') {
    this.filter = f;
    this.applyFilter();
  }

  onSegmentChange(ev: CustomEvent) {
    const val = (ev.detail && (ev.detail as any).value) as string | undefined;
    if (val === 'pendientes' || val === 'completadas' || val === 'todas') {
      this.setFilter(val);
    }
  }

  get total() { return this.tasks.length; }
  get completadas() { return this.tasks.filter(t => t.estado === 'completada').length; }
  get pendientes() { return this.tasks.filter(t => t.estado === 'pendiente').length; }

  get nombre() { return this.form.get('nombre'); }
  get descripcion() { return this.form.get('descripcion'); }

  private findTaskElement(id: number): any {
    const items = this.taskItems?.toArray() || [];
    const match = items.find(el => el.nativeElement?.dataset?.id == String(id));
    return match?.nativeElement;
  }
}
