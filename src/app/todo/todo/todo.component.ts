import { Component, inject, signal } from '@angular/core';
import { Todo } from '../model/todo';
import { TodoService } from '../service/todo.service';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RainbowDirective } from 'src/app/directives/rainbow.directive';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RainbowDirective],
})
export class TodoComponent {
  private todoService = inject(TodoService);

  // inputs as signals
  name = signal('');
  content = signal('');
  status = signal<'waiting' | 'in progress' | 'done'>('waiting');

  // expose service computed signals for the template
  waiting = this.todoService.waiting;
  inProgress = this.todoService.inProgress;
  done = this.todoService.done;

  trackById(_: number, item: Todo) {
    return item.id;
  }

  addTodo() {
    const name = this.name().trim();
    const content = this.content().trim();
    if (!name || !content) return;
    this.todoService.addTodo({ name, content, status: this.status() });
    this.name.set('');
    this.content.set('');
    this.status.set('waiting');
  }

  deleteTodo(id: number) {
    this.todoService.deleteTodo(id);
  }

  updateStatus(id: number, status: Todo['status']) {
    this.todoService.updateStatus(id, status);
  }
}
