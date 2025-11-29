import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { User } from '../users.service';

const fibMemo = new Map<number, number>();

export const fibonnaci = (n: number): number => {
  if (fibMemo.has(n)) {
    return fibMemo.get(n)!;
  }

  const result = n === 0 || n === 1 ? 1 : fibonnaci(n - 1) + fibonnaci(n - 2);
  fibMemo.set(n, result);
  return result;
};

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent implements OnChanges {
  @Input() usersCluster: string = '';
  @Input() users: User[] = [];
  @Output() add = new EventEmitter<string>();

  userFullName: string = '';
  private fibCache = new Map<number, number>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['users'] && this.users) {
      this.users.forEach((user) => {
        if (!this.fibCache.has(user.age)) {
          this.fibCache.set(user.age, fibonnaci(user.age));
        }
      });
    }
  }

  addUser(): void {
    this.add.emit(this.userFullName);
    this.userFullName = '';
  }

  getFib(age: number): number {
    return this.fibCache.get(age)!;
  }
}
