import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '../../constants/enums';

export class LoginDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
