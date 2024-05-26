import { IsDateString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateSigmaQuizDto {
  @IsOptional()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsNotEmpty()
  description?: string;
  
  @IsDateString()
  date: Date;
}
