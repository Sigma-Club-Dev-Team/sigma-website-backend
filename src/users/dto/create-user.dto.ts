import { ArrayNotEmpty, ArrayUnique, IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { IsCustomStrongPassword } from '../strong-password.decorator';
import { Role } from '../../constants/enums';

export class CreateUserDto {
  @IsNotEmpty()
  first_name: string;

  @IsNotEmpty()
  last_name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsCustomStrongPassword()
  password: string;

  @ArrayUnique()
  @ArrayNotEmpty()
  @IsEnum(Role, { each: true })
  roles: Role[];
}
