import { Injectable, computed, signal, inject } from '@angular/core';
import { Todo } from '../model/todo';
import { LoggerService } from '../../services/logger.service';

let _id = 1;

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private logger = inject(LoggerService);

  // internal writable signal holding the list
  private _todos = signal<Todo[]>([
    // seed with a couple of examples
    new Todo(_id++, 'Buy milk', '2 liters', 'waiting'),
    new Todo(_id++, 'Write report', 'Finish by Friday', 'in progress'),
    new Todo(_id++, 'Book flight', 'Vacation planning', 'done'),
  ]);

  // readonly view
  readonly todos = this._todos.asReadonly();

  // computed signals for each status
  readonly waiting = computed(() => this._todos().filter((t: Todo) => t.status === 'waiting'));
  readonly inProgress = computed(() => this._todos().filter((t: Todo) => t.status === 'in progress'));
  readonly done = computed(() => this._todos().filter((t: Todo) => t.status === 'done'));

  getTodosSnapshot(): Todo[] {
    return this._todos();
  }

  addTodo(todo: Pick<Todo, 'name' | 'content' | 'status'>) {
    const t = new Todo(_id++, todo.name, todo.content, todo.status ?? 'waiting');
  this._todos.update((list: Todo[]) => [...list, t]);
    this.logger.logger(['addTodo', t]);
    return t;
  }

  deleteTodo(id: number) {
  this._todos.update((list: Todo[]) => list.filter((t: Todo) => t.id !== id));
    this.logger.logger(['deleteTodo', id]);
  }

  updateStatus(id: number, status: Todo['status']) {
  this._todos.update((list: Todo[]) => list.map((t: Todo) => (t.id === id ? { ...t, status } : t)));
    this.logger.logger(['updateStatus', id, status]);
  }

  logTodos() {
    this.logger.logger(this._todos());
  }
}
