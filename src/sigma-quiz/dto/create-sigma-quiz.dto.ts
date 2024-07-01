import { IsDateString, IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import { QuizStatus } from "../../constants/enums";

export class CreateSigmaQuizDto {
  @IsOptional()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsNotEmpty()
  description?: string;

  @IsDateString()
  date: Date;

  @IsEnum(QuizStatus)
  status: QuizStatus;
}
