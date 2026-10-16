import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto.js';
import { UpdateUserDto } from '../dto/update-user.dto.js';
import { LoggerService } from './user.logger.js';

export interface User {
  id: number;
  name: string;
}

@Injectable()
export class UserService {
  private users: User[] = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'John Smith' },
  ];

  constructor(private readonly loggerService: LoggerService) {
    this.loggerService.log('UserService initialized');
  }

  public getUsers(name?: string): User[] {
    if (!name) {
      return this.users;
    }

    return this.users.filter((user) =>
      user.name.toLowerCase().includes(name.toLowerCase()),
    );
  }

  public getUserById(id: number): User {
    const user = this.users.find((item) => item.id === id);

    if (!user) {
      throw new NotFoundException(`User with id ${Number(id)} not found`);
    }

    return user;
  }

  public createUser(user: CreateUserDto) {
    const newUser: User = {
      id: this.users.length + 1,
      name: user.name,
    };

    this.users.push(newUser);

    return {
      data: newUser,
      message: 'User created successfully',
    };
  }

  public updateUser(id: number, updatedUser: UpdateUserDto) {
    const user = this.users.find((item) => item.id === id);

    if (!user) {
      throw new NotFoundException(`User  not found`);
    }

    Object.assign(user, updatedUser);

    return {
      data: user,
      message: 'User updated successfully',
    };
  }

  public deleteUser(id: number): boolean {
    const index = this.users.findIndex((user) => user.id === id);

    if (index === -1) {
      return false;
    }

    this.users.splice(index, 1);
    return true;
  }
}
