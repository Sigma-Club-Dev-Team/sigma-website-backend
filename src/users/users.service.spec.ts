import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { TestBed } from '@automock/jest';
import { buildCreateUserDtoMock, buildUserMock } from '../test/factories/user.factory';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  let mockUser = buildUserMock();

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(UsersService).compile();

    service = unit;
    userRepository = unitRef.get(getRepositoryToken(User) as string);;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new user', async () => {
      const createUserDto = buildCreateUserDtoMock({
        password: 'password123',
        email: 'test@example.com',
      });

      const newUser = buildUserMock({
        id: '1',
        ...createUserDto,
      });

      jest.spyOn(userRepository, 'create').mockReturnValue(newUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(newUser);

      const result = await service.create(createUserDto);

      expect(userRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(userRepository.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual(newUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users: User[] = [mockUser, buildUserMock()];
      jest.spyOn(userRepository, 'find').mockResolvedValue(users);
      expect(await service.findAll()).toEqual(users);
    });
  });

  describe('findOneById', () => {
    it('should return the user with the provided id', async () => {
      const userId = '1';
      const user: User = buildUserMock();
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);
      expect(await service.findOneById(userId)).toBe(user);
    });

    it('should throw HttpStatus.NOT_FOUND if user with provided id does not exist', async () => {
      const userId = 'nonexistent-id';
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(undefined);
      await expect(service.findOneById(userId)).rejects.toThrow(
        new NotFoundException('User with this id does not exist'),
      );
    });
  });

  describe('fineOneByEmail', () => {
    const emailIdentifier = 'test@example.com';
    it('should return the user with the provided email', async () => {
      const user: User = buildUserMock({ email: emailIdentifier });
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);
      expect(await service.fineOneByEmail(emailIdentifier)).toBe(user);
    });

    it('should throw HttpStatus.NOT_FOUND if user with provided email does not exist', async () => {
      const userIdentifier = 'nonexistent@example.com';
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(undefined);
      await expect(service.fineOneByEmail(userIdentifier)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
