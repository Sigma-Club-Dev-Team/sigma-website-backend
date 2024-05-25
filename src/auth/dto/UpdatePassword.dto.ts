import { IsNotEmpty } from 'class-validator';
import { IsCustomStrongPassword } from '../../users/strong-password.decorator';

export class UpdatePasswordDto {
  @IsNotEmpty()
  old_password: string;

  @IsNotEmpty()
  @IsCustomStrongPassword()
  new_password: string;
}
