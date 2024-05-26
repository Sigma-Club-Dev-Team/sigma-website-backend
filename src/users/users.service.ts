import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = this.userRepository.create(createUserDto);
    return await this.userRepository.save(newUser);
  }

  async findAll(
    whereClause?: FindOptionsWhere<User> | FindOptionsWhere<User>[],
  ): Promise<User[]> {
    return await this.userRepository.find({ where: whereClause });
  }

  async findOneById(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User with this id does not exist');
    }
    return user;
  }

  async fineOneByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy([{ email: email }]);

    if (!user) {
      throw new NotFoundException('User does not exist');
    }
    return user;
  }

  async save(user: User) {
    return await this.userRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOneById(id);

    const userUpdate = {
      ...user,
      ...updateUserDto,
    };

    await this.userRepository.save(userUpdate);

    return await this.findOneById(user.id);
  }
}
