import { PartialType } from '@nestjs/mapped-types';
import { CreateSigmaQuizSchoolDto } from './create-sigma-quiz-school.dto';

export class UpdateSigmaQuizSchoolDto extends PartialType(CreateSigmaQuizSchoolDto) {}
