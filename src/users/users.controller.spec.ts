import { TestBed } from '@automock/jest';
import { UsersController } from './users.controller';
import { buildUserMock } from '../test/factories/user.factory';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(UsersController).compile();

    controller = unit;
    usersService = unitRef.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = [
        buildUserMock({
          id: '1',
          email: 'user1@example.com',
          password: 'password1',
        }),
        buildUserMock({
          id: '2',
          email: 'user2@example.com',
          password: 'password2',
        }),
      ];

      jest.spyOn(usersService, "findAll").mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
      expect(usersService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should handle errors', async () => {
      const error = new Error('An error occurred');
      jest.spyOn(usersService, 'findAll').mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow(error);
      expect(usersService.findAll).toHaveBeenCalledTimes(1);
    });
  });
});
