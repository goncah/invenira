import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.userModel
      .findOne({ lmsStudentId: createUserDto.lmsStudentId })
      .then((user) => {
        if (!user) {
          return this.userModel.create(createUserDto);
        }
        return user;
      })
      .then((user) => user.toObject());
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().lean();
  }

  async findOne(id: string): Promise<User> {
    return this.userModel.findOne({ _id: id }).lean();
  }

  async remove(id: string): Promise<User> {
    return this.userModel.findByIdAndDelete({ _id: id }).lean();
  }
}
