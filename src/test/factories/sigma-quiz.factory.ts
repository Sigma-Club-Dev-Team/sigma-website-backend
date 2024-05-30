import { SigmaQuiz } from '../../sigma-quiz/entities/sigma-quiz.entity';
import { CreateSigmaQuizDto } from '../../sigma-quiz/dto/create-sigma-quiz.dto';
import { UpdateSigmaQuizDto } from '../../sigma-quiz/dto/update-sigma-quiz.dto';
import { SigmaQuizSchool } from '../../sigma-quiz/entities/sigma-quiz-school.entity';
import { CreateSigmaQuizSchoolDto } from '../../sigma-quiz/dto/create-sigma-quiz-school.dto';
import { UpdateSigmaQuizSchoolDto } from '../../sigma-quiz/dto/update-sigma-quiz-school.dto';

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

export const mockSigmaQuizSchool = (
  inputs?: Partial<SigmaQuizSchool>,
): SigmaQuizSchool => {
  return {
    id: 'mock-id',
    name: 'Test School',
    state: 'Lasgidi',
    created_at: new Date(),
    updated_at: new Date(),
    ...inputs,
  };
};

export function mockCreateSigmaQuizSchoolDto(
  partial?: Partial<CreateSigmaQuizSchoolDto>,
): CreateSigmaQuizSchoolDto {
  return {
    name: 'Test School',
    state: 'Lasgidi',
    ...partial,
  };
}

export function mockUpdateSigmaQuizSchoolDto(
  partial: Partial<UpdateSigmaQuizSchoolDto>,
): UpdateSigmaQuizSchoolDto {
  return {
    ...partial,
  };
}
