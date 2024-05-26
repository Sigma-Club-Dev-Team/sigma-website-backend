import { PartialType } from '@nestjs/mapped-types';
import { CreateSigmaQuizDto } from './create-sigma-quiz.dto';

export class UpdateSigmaQuizDto extends PartialType(CreateSigmaQuizDto) {}
