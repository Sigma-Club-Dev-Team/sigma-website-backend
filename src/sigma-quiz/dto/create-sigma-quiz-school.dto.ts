import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateSigmaQuizSchoolDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  state: string;

  @IsOptional()
  @IsNotEmpty()
  address?: string;
}
