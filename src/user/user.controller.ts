
import { Controller, Get, Post, Query, Param } from '@nestjs/common';

@Controller('user')
export class UserController {
  private users = [
    {
      id: 1,
      name: 'John Doe',
    },
    {
      id: 2,
      name: 'Jane Smith',
    },
    {
      id: 3,
      name: 'John Smith',
    },
  ];

  // Get all users or filter by name
  @Get('all')
  getUsers(@Query('name') name?: string) {
    if (!name) {
      return this.users;
    }

    return this.users.filter((user) =>
      user.name.toLowerCase().includes(name.toLowerCase()),
    );
  }

  // Search users by name
  @Get('search')
  getUserByName(@Query('name') name: string) {
    return this.users.filter((user) =>
      user.name.toLowerCase().includes(name.toLowerCase()),
    );
  }

  // Get user by ID
  @Get(':id')
  getUserById(@Param('id') id: string) {
    const user = this.users.find((user) => user.id === Number(id));

    return user ?? { message: 'User not found' };
  }

  // Create user
  @Post('create')
  createUser() {
    return {
      message: 'User created successfully',
    };
  }
}
