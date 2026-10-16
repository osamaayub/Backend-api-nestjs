import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto.js';
import { UpdateUserDto } from '../dto/update-user.dto.js';
import { UserService } from './user.service.js';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUsers(@Query('name') name?: string) {
    return this.userService.getUsers(name);
  }

  @Get('search')
  searchUsers(@Query('name') name: string) {
    return this.userService.getUsers(name);
  }

  @Get(':id')
  getUserById(@Param('id') id: string) {
    return this.userService.getUserById(Number(id));
  }

  @Post()
  createUser(@Body() body: CreateUserDto) {
    return this.userService.createUser(body);
  }

  @Put(':id')
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.userService.updateUser(Number(id), body);
  }
}
