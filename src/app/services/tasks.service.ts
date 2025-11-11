import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type TaskStatus = 'pendiente' | 'completada';

export interface Task {
  id: number;
  nombre: string;
  descripcion: string;
  estado: TaskStatus;
  createdAt: number;
  completedAt?: number;
}

@Injectable({ providedIn: 'root' })
export class TasksService {
  private tasksSubject = new BehaviorSubject<Task[]>(this.load());
  tasks$ = this.tasksSubject.asObservable();

  private load(): Task[] {
    const data = localStorage.getItem('tasks');
    const parsed = data ? (JSON.parse(data) as any[]) : [];
    // Garantiza compatibilidad: añade timestamps y estado por defecto si faltan
    return parsed.map(t => ({
      id: t.id,
      nombre: t.nombre,
      descripcion: t.descripcion,
      estado: (t.estado as TaskStatus) || 'pendiente',
      createdAt: typeof t.createdAt === 'number' ? t.createdAt : Date.now(),
      completedAt: typeof t.completedAt === 'number' ? t.completedAt : undefined
    }));
  }

  private persist(tasks: Task[]) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    this.tasksSubject.next(tasks);
  }

  add(nombre: string, descripcion: string) {
    const tasks = this.tasksSubject.value;
    const id = tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
    const task: Task = { id, nombre, descripcion, estado: 'pendiente', createdAt: Date.now() };
    this.persist([...tasks, task]);
    return task;
  }

  update(id: number, changes: Partial<Task>) {
    const tasks = this.tasksSubject.value.map(t => t.id === id ? { ...t, ...changes } : t);
    this.persist(tasks);
  }

  remove(id: number) {
    const tasks = this.tasksSubject.value.filter(t => t.id !== id);
    this.persist(tasks);
  }

  toggle(id: number) {
    const tasks: Task[] = this.tasksSubject.value.map(t => {
      if (t.id === id) {
        const next: TaskStatus = t.estado === 'pendiente' ? 'completada' : 'pendiente';
        return {
          ...t,
          estado: next,
          completedAt: next === 'completada' ? Date.now() : undefined
        };
      }
      return t;
    });
    this.persist(tasks);
  }
}
