import { Body, Controller, HttpCode, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RequestWithUser } from './interfaces/request-with-user.interface';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UpdatePasswordDto } from './dto/UpdatePassword.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Post('register/admin')
  async registerStudent(@Body() createUserDto: CreateUserDto) {
    return new User(await this.authService.createAccount(createUserDto));
  }

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: RequestWithUser, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Put('password/change')
  async changePassword(@Req() req: RequestWithUser, @Body() updatePasswordDto: UpdatePasswordDto) {
    return await this.authService.changePassword(req.user, updatePasswordDto);
  }
}
