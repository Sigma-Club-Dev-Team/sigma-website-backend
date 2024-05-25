import { TestBed } from '@automock/jest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import {
  buildCreateUserDtoMock,
  buildUserMock,
} from '../test/factories/user.factory';
import { User } from '../users/entities/user.entity';
import {
  buildLoginDTOMock,
  buildUpdatePasswordDTOMock,
} from '../test/factories/auth.factory';
import { RequestWithUser } from './interfaces/request-with-user.interface';
import { ROLES_KEY } from './decorators/role.decorator';
import RolesGuard from './guards/role.guard';
import { Role } from '../constants/enums';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(AuthController).compile();

    authController = unit;
    authService = unitRef.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('registerAdmin', () => {
    it('should register a student and return the created user', async () => {
      const createUserDto = buildCreateUserDtoMock({
        password: 'password123',
        email: 'test@example.com',
      });

      const createdUser = buildUserMock({
        ...createUserDto,
      });

      jest
        .spyOn(authService, 'createAccount')
        .mockResolvedValueOnce(createdUser);

      const result = await authController.registerAdmin(createUserDto);

      expect(result).toEqual(new User(createdUser));
      expect(authService.createAccount).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('login', () => {
    it('should login a user and return a token', async () => {
      const loginDto = buildLoginDTOMock({
        email: 'testuser',
        password: 'password123',
      });

      const req = {
        user: buildUserMock({ id: '1', email: 'testuser' }),
      } as RequestWithUser;

      const token = 'jwt-token';
      const expectedResponse = { access_token: token, user: req.user };
      jest.spyOn(authService, 'login').mockResolvedValueOnce(expectedResponse);

      const result = await authController.login(req, loginDto);

      expect(result).toEqual(expectedResponse);
      expect(authService.login).toHaveBeenCalledWith(req.user);
    });
  });

  describe('changePassword', () => {
    it('should change the password successfully', async () => {
      const updatePasswordDto = buildUpdatePasswordDTOMock({
        old_password: 'oldPassword',
        new_password: 'newPassword',
      });
      const mockResponse = { message: 'Password Successfully updated' };

      jest.spyOn(authService, 'changePassword').mockResolvedValue(mockResponse);

      const req = {
        user: buildUserMock({ id: '1', email: 'testuser' }),
      } as RequestWithUser;

      const result = await authController.changePassword(
        req,
        updatePasswordDto,
      );

      expect(result).toEqual(mockResponse);
      expect(authService.changePassword).toHaveBeenCalledWith(
        req.user,
        updatePasswordDto,
      );
    });
  });

  describe('Guards', () => {
    describe('registerAdmin Guards', () => {
      it('should have JwtAuthGuard applied to registerAdmin endpoint', () => {
        const guards = Reflect.getMetadata(
          '__guards__',
          authController.registerAdmin,
        );
        expect(guards).toContain(JwtAuthGuard);
      });
    });

    it('should have LocalAuthGuard applied to login endpoint', () => {
      const guards = Reflect.getMetadata('__guards__', authController.login);
      expect(guards).toContain(LocalAuthGuard);
    });
  });
});
