import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateQuizRoundDto } from './create-quiz-round.dto';
import { IsPositive } from 'class-validator';
import { IsValidNumberOfQuestions } from '../decorators/is-valid-number-of-school';

export class UpdateQuizRoundDto extends PartialType(
  OmitType(CreateQuizRoundDto, ['quizId', 'no_of_questions', 'no_of_schools']),
) {
  @IsPositive()
  @IsValidNumberOfQuestions()
  no_of_questions: number;

  @IsPositive()
  no_of_schools: number;
}
