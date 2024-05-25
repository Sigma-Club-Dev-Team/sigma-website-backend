import { IsEmail, IsNotEmpty } from 'class-validator';
import { IsCustomStrongPassword } from '../../users/strong-password.decorator';

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsCustomStrongPassword()
  new_password: string;
}
