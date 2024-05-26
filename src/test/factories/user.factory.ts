import * as bcrypt from 'bcrypt';
import { Role } from '../../constants/enums';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { User } from '../../users/entities/user.entity';
import { UpdateUserDto } from '../../users/dto/update-user.dto';

export const buildUserMock = (inputs?: Partial<User>): User => {
  return {
    id: '1',
    first_name: 'fake',
    last_name: 'fraud',
    email: 'test@example.com',
    roles: [Role.Adhoc],
    created_at: new Date(),
    updated_at: new Date(),
    ...inputs,
    password:
      inputs?.password ?? bcrypt.hashSync(inputs?.password ?? 'password', 10),
  };
};

export function buildCreateUserDtoMock(
  partial?: Partial<CreateUserDto>,
): CreateUserDto {
  return {
    first_name: 'John',
    last_name: 'Doe',
    password: 'fakePassword64',
    email: 'joe@doe.com',
    roles: [Role.Adhoc],
    ...partial,
  };
}

export function buildUpdateUserDtoMock(
  partial: Partial<UpdateUserDto>,
): UpdateUserDto {
  return {
    ...partial,
  };
}
