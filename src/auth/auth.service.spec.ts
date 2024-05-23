import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { TestBed } from '@automock/jest';
import { UsersService } from '../users/users.service';
import { buildCreateUserDtoMock, buildUserMock } from '../test/factories/user.factory';
import { BadRequestException } from '@nestjs/common';
import { Role } from '../constants/enums';

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
});
