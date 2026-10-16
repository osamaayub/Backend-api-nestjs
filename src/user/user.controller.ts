
import { Controller, Get, Post, Put, Query, Param, Body } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto.js';
import { UpdateUserDto } from '../dto/update-user.dto.js';

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
    @Get()
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
    @Post()
    createUser(@Body() body: CreateUserDto, CreateUserDto: CreateUserDto) {
        // In a real application, you would typically save the user to a database here
        this.users.push({ id: this.users.length + 1, name: body.name });

        return {
            data: CreateUserDto,
            message: 'User created successfully',
        };
    }
    @Put(':id')
    updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
        const userIndex = this.users.findIndex((user) => user.id === Number(id));
        if (userIndex === -1) {
            return { message: 'User not found' };
        }
        this.users[userIndex] = { ...this.users[userIndex], ...body };
        return { message: 'User updated successfully' };
    }
}


