import { LoginDto } from "../../auth/dto/login.dto";

export const buildLoginDTOMock = (partial?: Partial<LoginDto>): LoginDto => {
  return {
    email: 'john.doe@example.com',
    password: 'Password123!',
    ...partial,
  };
};
