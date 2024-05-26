import { SigmaQuiz } from '../../sigma-quiz/entities/sigma-quiz.entity';
import { CreateSigmaQuizDto } from '../../sigma-quiz/dto/create-sigma-quiz.dto';
import { UpdateSigmaQuizDto } from '../../sigma-quiz/dto/update-sigma-quiz.dto';

export const buildSigmaQuizMock = (inputs?: Partial<SigmaQuiz>): SigmaQuiz => {
  return {
    id: 'mock-id',
    year: 2023,
    title: 'Mock Sigma Quiz',
    description: 'This is a mock description',
    date: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
    ...inputs,
  };
};

export function buildCreateSigmaQuizDtoMock(
  partial?: Partial<CreateSigmaQuizDto>,
): CreateSigmaQuizDto {
  return {
    title: 'Mock Sigma Quiz',
    description: 'This is a mock description',
    date: new Date(),
    ...partial,
  };
}

export function buildUpdateSigmaQuizDtoMock(
  partial: Partial<UpdateSigmaQuizDto>,
): UpdateSigmaQuizDto {
  return {
    ...partial,
  };
}
