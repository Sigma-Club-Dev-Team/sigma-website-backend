import { Controller, Get, Param, ParseUUIDPipe, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/role.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import RolesGuard from '../auth/guards/role.guard';
import { Role } from '../constants/enums';
import { UsersService } from './users.service';
import { RequestWithUser } from 'src/auth/interfaces/request-with-user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Roles(Role.SuperAdmin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll() {
    return await this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async fetchMyProfile(@Req() req: RequestWithUser) {
    return req.user;
  }

  @Roles(Role.SuperAdmin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  async fetchUserById(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.userService.findOneById(id);
  }
}
