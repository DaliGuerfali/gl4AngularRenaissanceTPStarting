export class Todo {
  constructor(
    public id: number = 0,
    public name = '',
    public content = '',
    public status: 'waiting' | 'in progress' | 'done' = 'waiting'
  ) {}
}
