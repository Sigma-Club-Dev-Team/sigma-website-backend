import { TestBed } from '@automock/jest';
import { UsersController } from './users.controller';
import { buildUpdateUserDtoMock, buildUserMock } from '../test/factories/user.factory';
import { UsersService } from './users.service';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

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

  describe('fetchMyProfile', () => {
    it('should return the user profile', async () => {
      const req = {
        user: buildUserMock({ id: '1', email: 'user1@example.com' }),
      } as RequestWithUser;

      expect(await controller.fetchMyProfile(req)).toEqual(req.user);
    });
  });

   describe('fetchUserById', () => {
     it('should return a user by ID', async () => {
       const userId = '1';
       const mockUser = buildUserMock({id: userId});

       jest.spyOn(usersService, 'findOneById').mockResolvedValue(mockUser);

       expect(await controller.fetchUserById(userId)).toEqual(mockUser);
       expect(usersService.findOneById).toHaveBeenCalledWith(userId);
     });
   });

    describe('updateMyProfile', () => {
      it('should update the profile of the current user', async () => {
        const updateUserDto = buildUpdateUserDtoMock({
          email: 'updated@example.com',
        });
        const mockUser = buildUserMock();
        const req: RequestWithUser = {
          user: mockUser,
        } as RequestWithUser;

        const expectedResponse = {
          ...mockUser,
          ...updateUserDto,
        };

        jest
          .spyOn(usersService, 'update')
          .mockResolvedValueOnce(expectedResponse);

        const result = await controller.updateMyProfile(req, updateUserDto);
        expect(result).toEqual(expectedResponse);
        expect(usersService.update).toHaveBeenCalledWith(
          mockUser.id,
          updateUserDto,
        );
      });
    });

    describe('updateUserById', () => {
      it('should update a user by ID', async () => {
        const updateUserDto = buildUpdateUserDtoMock({
          email: 'updated@example.com',
        });
        const userId = '1';
        const mockUser = buildUserMock({id: "1"});

        const expectedResponse = {
          ...mockUser,
          ...updateUserDto,
        };

        jest
          .spyOn(usersService, 'update')
          .mockResolvedValueOnce(expectedResponse);

        const result = await controller.updateUserById(userId, updateUserDto);
        expect(result).toEqual({ ...mockUser, ...updateUserDto });
        expect(usersService.update).toHaveBeenCalledWith(userId, updateUserDto);
      });
    });

    describe('remove', () => {
      it('should remove a user', async () => {
        const userId = 'user-id';
        jest.spyOn(usersService, 'remove').mockResolvedValueOnce(undefined);

        const result = await controller.remove(userId);

        expect(result).toEqual({ message: 'Successful' });
        expect(usersService.remove).toHaveBeenCalledWith(userId);
      });
    });
});
