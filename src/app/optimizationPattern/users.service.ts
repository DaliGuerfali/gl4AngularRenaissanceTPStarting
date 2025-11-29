import { Injectable } from '@angular/core';
import { faker } from '@faker-js/faker';

export interface User {
  name: string;
  age: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly users: User[] = [];

  constructor() {
    for (let i = 0; i < 50; i++) {
      this.users.push({
        name: faker.name.fullName(),
        age: faker.datatype.number({ min: 18, max: 30 })
      });
    }
  }

  getOddOrEven(isOdd = false): User[] {
    return this.users.filter((user) => !!(user.age % 2) === isOdd);
  }

  createRandomUser(name: string): User {
    return {
      name,
      age: faker.datatype.number({ min: 18, max: 30 })
    };
  }
}
