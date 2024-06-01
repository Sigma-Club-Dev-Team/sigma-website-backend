import { SigmaQuiz } from '../../sigma-quiz/entities/sigma-quiz.entity';
import { CreateSigmaQuizDto } from '../../sigma-quiz/dto/create-sigma-quiz.dto';
import { UpdateSigmaQuizDto } from '../../sigma-quiz/dto/update-sigma-quiz.dto';
import { SigmaQuizSchool } from '../../sigma-quiz/entities/sigma-quiz-school.entity';
import { CreateSigmaQuizSchoolDto } from '../../sigma-quiz/dto/create-sigma-quiz-school.dto';
import { UpdateSigmaQuizSchoolDto } from '../../sigma-quiz/dto/update-sigma-quiz-school.dto';
import { QuizRound } from '../../sigma-quiz/entities/quiz-round.entity';
import { CreateQuizRoundDto } from '../../sigma-quiz/dto/create-quiz-round.dto';
import { UpdateQuizRoundDto } from '../../sigma-quiz/dto/update-quiz-round.dto';

export const buildSigmaQuizMock = (inputs?: Partial<SigmaQuiz>): SigmaQuiz => {
  return {
    id: 'mock-id',
    year: 2023,
    title: 'Mock Sigma Quiz',
    description: 'This is a mock description',
    date: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
    rounds: [],
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

export const mockQuizRound = (partial?: Partial<QuizRound>): QuizRound => {
  return {
    id: 'mock-id',
    quizId: 'mock-quiz-id',
    name: 'Mock Round',
    round_number: 1,
    no_of_questions: 10,
    no_of_schools: 5,
    marks_per_question: 1,
    marks_per_bonus_question: 2,
    created_at: new Date(),
    updated_at: new Date(),
    ...partial,
    quiz: {
      ...buildSigmaQuizMock(partial?.quiz),
    },
  };
};

export function mockCreateQuizRoundDto(
  partial?: Partial<CreateQuizRoundDto>,
): CreateQuizRoundDto {
  return {
    quizId: 'mock-quiz-id',
    name: 'Mock Round',
    round_number: 1,
    no_of_questions: 10,
    no_of_schools: 5,
    marks_per_question: 1,
    marks_per_bonus_question: 2,
    ...partial,
  };
}

export function mockUpdateQuizRoundDto(
  partial: Partial<UpdateQuizRoundDto>,
): UpdateQuizRoundDto {
  return {
    ...partial,
  };
}