import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { TestBed } from '@automock/jest';
import { UsersService } from '../users/users.service';
import { buildCreateUserDtoMock, buildUserMock } from '../test/factories/user.factory';
import { BadRequestException } from '@nestjs/common';
import { Role } from '../constants/enums';
import { buildResetPasswordDTOMock, buildUpdatePasswordDTOMock } from '../test/factories/auth.factory';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(AuthService).compile();

    service = unit;
    usersService = unitRef.get(UsersService);
    jwtService = unitRef.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    it('should call studentService.create and return created student', async () => {
      const userDto = buildCreateUserDtoMock();
      const createdUser = buildUserMock();
      jest.spyOn(usersService, 'create').mockResolvedValue(createdUser);

      const result = await service.createAccount(userDto);

      expect(usersService.create).toHaveBeenCalledWith(userDto);
      expect(result).toBe(createdUser);
    });

    it('should throw BadRequestException if student with provided email/username already exists', async () => {
      const userDto = buildCreateUserDtoMock();
      jest
        .spyOn(usersService, 'create')
        .mockRejectedValue({ code: '23505' });

      await expect(service.createAccount(userDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error/exception if an unexpected error occurs', async () => {
      const userDto = buildCreateUserDtoMock();
      jest.spyOn(usersService, 'create').mockRejectedValue(new Error());

      await expect(service.createAccount(userDto)).rejects.toThrow();
    });
  });

  describe('validateUser', () => {
    it('should call usersService.fineOneByEmail and verifyPassword', async () => {
      const email = 'test-email';
      const plainTextPassword = '';
      const user = buildUserMock({ email });
      jest.spyOn(usersService, 'fineOneByEmail').mockResolvedValue(user);
      const verifyPasswordSpy = jest
        .spyOn(service as any, 'verifyPassword')
        .mockResolvedValue(undefined);

      await service.validateUser(email, plainTextPassword);

      expect(usersService.fineOneByEmail).toHaveBeenCalledWith(email);
      expect(verifyPasswordSpy).toHaveBeenCalledWith(
        plainTextPassword,
        user.password,
      );
    });

    it('should throw BadRequestException if wrong credentials provided', async () => {
      const email = 'test-email';
      const wrongPassword = 'wrong-password';
      const user = buildUserMock({ email });
      jest.spyOn(usersService, 'fineOneByEmail').mockResolvedValue(user);

      await expect(
        service.validateUser(email, wrongPassword),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should call jwtService.signAsync', async () => {
      const user = buildUserMock({ roles: [Role.SuperAdmin] });
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('');

      await service.login(user);
      expect(jwtService.signAsync).toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('should successfully change the password', async () => {
      const user = buildUserMock({
        id: '1',
        password: 'oldHashedPassword',
      });
      const updatePasswordDto = buildUpdatePasswordDTOMock({
        old_password: 'oldPassword',
        new_password: 'newPassword',
      });

      jest.spyOn(service as any, 'verifyPassword').mockResolvedValue(true);

      jest
        .spyOn(service as any, 'hashPassword')
        .mockResolvedValue('newHashedPassword');

        jest
          .spyOn(usersService, 'save')
          .mockResolvedValue(user);

      const result = await service.changePassword(user, updatePasswordDto);

      expect((service as any).verifyPassword).toHaveBeenCalledWith(
        'oldPassword',
        'oldHashedPassword',
      );
      expect((service as any).hashPassword).toHaveBeenCalledWith('newPassword');
      expect(usersService.save).toHaveBeenCalledWith({
        ...user,
        password: 'newHashedPassword',
      });
      expect(result).toEqual({ message: 'Password Successfully updated' });
    });

    it('should throw an error if the old password is incorrect', async () => {
      const user = buildUserMock({
        id: '1',
        password: 'oldHashedPassword',
      });
      const updatePasswordDto = buildUpdatePasswordDTOMock({
        old_password: 'incorrectOldPassword',
        new_password: 'newPassword',
      });

      jest
        .spyOn(service as any, 'verifyPassword')
        .mockRejectedValue(new BadRequestException('Incorrect password'));

      await expect(
        service.changePassword(user, updatePasswordDto),
      ).rejects.toThrow('Incorrect password');

      expect((service as any).verifyPassword).toHaveBeenCalledWith(
        'incorrectOldPassword',
        'oldHashedPassword',
      );
      expect(usersService.save).not.toHaveBeenCalled();
    });

    it('should throw an error if hashing the new password fails', async () => {
      const user = buildUserMock({
        id: '1',
        password: 'oldHashedPassword',
      });
      const updatePasswordDto = buildUpdatePasswordDTOMock({
        old_password: 'oldPassword',
        new_password: 'newPassword',
      });

      jest.spyOn(service as any, 'verifyPassword').mockResolvedValue(true);
      jest
        .spyOn(service as any, 'hashPassword')
        .mockRejectedValue(new BadRequestException('Hashing failed'));

      await expect(
        service.changePassword(user, updatePasswordDto),
      ).rejects.toThrow(BadRequestException);
      expect((service as any).verifyPassword).toHaveBeenCalledWith(
        'oldPassword',
        'oldHashedPassword',
      );
      expect((service as any).hashPassword).toHaveBeenCalledWith('newPassword');
      expect(usersService.save).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset the password successfully', async () => {
      const resetPasswordDto = buildResetPasswordDTOMock({
        email: 'test@example.com',
        new_password: 'newPassword',
      });

      const user = buildUserMock({
        email: resetPasswordDto.email,
        password: 'oldPasswordHash'
      });

      jest.spyOn(usersService, 'fineOneByEmail').mockResolvedValue(user);
      jest
        .spyOn(service as any, 'hashPassword')
        .mockResolvedValue('newHashedPassword');
      jest.spyOn(usersService, 'save').mockResolvedValue({
        ...user,
        password: 'newHashedPassword',
      });
      
      const result = await service.resetPassword(resetPasswordDto);

      expect(result).toEqual({ message: 'Reset Password Successfull' });
      expect(usersService.fineOneByEmail).toHaveBeenCalledWith(
        resetPasswordDto.email,
      );
      expect(usersService.save).toHaveBeenCalledWith({
        ...user,
        password: 'newHashedPassword',
      });
    });

    it('should throw an error if user is not found', async () => {
      const resetPasswordDto = buildResetPasswordDTOMock({
        email: 'test@example.com',
        new_password: 'newPassword',
      });

      jest.spyOn(usersService, 'fineOneByEmail').mockRejectedValue(
        new Error('User not found'),
      );      

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        'User not found',
      );
      expect(usersService.fineOneByEmail).toHaveBeenCalledWith(
        resetPasswordDto.email,
      );
      expect(usersService.save).not.toHaveBeenCalled();
    });

    it('should throw an error if saving the user fails', async () => {
      const resetPasswordDto = buildResetPasswordDTOMock({
        email: 'test@example.com',
        new_password: 'newPassword',
      });

      const user = buildUserMock({
        email: resetPasswordDto.email,
        password: 'oldPasswordHash'
      });

      jest.spyOn(usersService, 'fineOneByEmail').mockResolvedValue(user);
      jest
        .spyOn(service as any, 'hashPassword')
        .mockResolvedValue('newHashedPassword');
      jest.spyOn(usersService, 'save').mockRejectedValue(new Error('Save failed'));

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        'Save failed',
      );
      expect(usersService.fineOneByEmail).toHaveBeenCalledWith(
        resetPasswordDto.email,
      );
      expect(usersService.save).toHaveBeenCalledWith({
        ...user,
        password: 'newHashedPassword',
      });
    });
  });
});
