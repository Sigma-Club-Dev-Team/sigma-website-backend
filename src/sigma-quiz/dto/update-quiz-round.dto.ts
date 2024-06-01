import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateQuizRoundDto } from './create-quiz-round.dto';

export class UpdateQuizRoundDto extends PartialType(
  OmitType(CreateQuizRoundDto, ['quizId']),
) {}
