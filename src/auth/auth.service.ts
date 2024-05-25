import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import JwtPayload from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { PostgresErrorCode } from '../database/postgres-errorcodes.enum';
import { UpdatePasswordDto } from './dto/UpdatePassword.dto';
import { ResetPasswordDto } from './dto/ResetPassword.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async createAccount(createUserDto: CreateUserDto) {
    try {
      createUserDto.password = await this.hashPassword(createUserDto.password);
      const newUser = await this.usersService.create(createUserDto);
      return newUser;
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new BadRequestException(
          error?.detail ?? 'User with that email/username already exists',
        );
      }

      throw error;
    }
  }

  public async validateUser(email: string, plainTextPassword: string) {
    try {
      const user = await this.usersService.fineOneByEmail(email);
      await this.verifyPassword(plainTextPassword, user.password);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async login(user: User) {
    const payload: JwtPayload = {
      username: user.email,
      user_id: user.id,
      email: user.email,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user,
    };
  }

  async changePassword(user: User, updatePasswordDto: UpdatePasswordDto) {
    try {
      // confirm that the old password is correct
      await this.verifyPassword(updatePasswordDto.old_password, user.password);
      user.password = await this.hashPassword(updatePasswordDto.new_password);
      await this.usersService.save(user);
      return {
        message: 'Password Successfully updated',
      };
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      // confirm that the old password is correct
      const user = await this.usersService.fineOneByEmail(resetPasswordDto.email);
      user.password = await this.hashPassword(resetPasswordDto.new_password);
      await this.usersService.save(user);
      return {
        message: 'Reset Password Successfull',
      };
    } catch (error) {
      throw error;
    }
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );
    if (!isPasswordMatching) {
      throw new BadRequestException('Wrong credentials provided');
    }
    return isPasswordMatching;
  }

  private async hashPassword(plainTextPassword) {
    return await bcrypt.hash(plainTextPassword, 10);
  }
}
