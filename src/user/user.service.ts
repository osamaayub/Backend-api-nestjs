
import { Injectable } from '@nestjs/common';

interface User {
  id: string;
  name: string;
  password: string;
}

@Injectable()
export class UserService {
  private users: User[] = [];

  // Get all users
  public getAllUsers(): User[] {
    return this.users;
  }

  // Create a user
  public createUser(user: User): User {
    this.users.push(user);
    return user;
  }

  // Get user by ID
  public getUserById(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  // Update user by ID
  public updateUser(
    id: string,
    updatedUser: Partial<User>,
  ): User | undefined {
    const user = this.users.find((user) => user.id === id);

    if (!user) {
      return undefined;
    }

    Object.assign(user, updatedUser);

    return user;
  }

  // Delete user by ID
  public deleteUser(id: string): boolean {
    const index = this.users.findIndex((user) => user.id === id);

    if (index === -1) {
      return false;
    }

    this.users.splice(index, 1);
    return true;
  }
}
