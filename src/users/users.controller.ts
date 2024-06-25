import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Put, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/role.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import RolesGuard from '../auth/guards/role.guard';
import { Role } from '../constants/enums';
import { UsersService } from './users.service';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';

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

  @UseGuards(JwtAuthGuard)
  @Put('/me')
  async updateMyProfile(
    @Req() req: RequestWithUser,
    @Body() updateUserDto: UpdateMyProfileDto,
  ) {
    return await this.userService.update(req.user.id, updateUserDto);
  }

  @Roles(Role.SuperAdmin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  async updateUserById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.update(id, updateUserDto);
  }

  @Roles(Role.SuperAdmin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.userService.remove(id);
    return {
      message: 'Successful',
    };
  }
}
