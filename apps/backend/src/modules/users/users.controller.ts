import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MongoId } from '../../mongo-id';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('admin')
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Roles('admin')
  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Roles('admin')
  @Get(':id')
  async findOne(@MongoId() id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Roles('admin')
  @Delete(':id')
  async remove(@MongoId() id: string): Promise<User> {
    return this.usersService.remove(id);
  }
}
