import { IsNotEmpty, IsPositive, IsUUID } from 'class-validator';
import { IsValidNumberOfQuestions } from '../decorators/is-valid-number-of-school';

export class CreateQuizRoundDto {
  @IsUUID()
  public quizId: string;

  @IsNotEmpty()
  name: string;

  @IsPositive()
  round_number: number;

  @IsPositive()
  @IsValidNumberOfQuestions()
  no_of_questions: number;

  @IsPositive()
  no_of_schools: number;

  @IsPositive()
  marks_per_question: number;

  @IsPositive()
  marks_per_bonus_question: number;
}
