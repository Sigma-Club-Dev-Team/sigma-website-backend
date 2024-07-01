import { IsEnum } from 'class-validator';
import { QuizStatus } from '../../constants/enums';

export class UpdateQuizStatusDto {
  @IsEnum(QuizStatus)
  new_status: QuizStatus;
}
