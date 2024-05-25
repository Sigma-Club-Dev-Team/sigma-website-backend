import { ResetPasswordDto } from "src/auth/dto/ResetPassword.dto";
import { UpdatePasswordDto } from "../../auth/dto/UpdatePassword.dto";
import { LoginDto } from "../../auth/dto/login.dto";

export const buildLoginDTOMock = (partial?: Partial<LoginDto>): LoginDto => {
  return {
    email: 'john.doe@example.com',
    password: 'Password123!',
    ...partial,
  };
};

export const buildUpdatePasswordDTOMock = (
  partial?: Partial<UpdatePasswordDto>,
): UpdatePasswordDto => {
  return {
    old_password: 'oldPassword',
    new_password: 'newPassword',
    ...partial,
  };
};

export const buildResetPasswordDTOMock = (
  partial?: Partial<ResetPasswordDto>,
): ResetPasswordDto => {
  return {
    email: "test@email.com",
    new_password: 'newPassword',
    ...partial,
  };
};
