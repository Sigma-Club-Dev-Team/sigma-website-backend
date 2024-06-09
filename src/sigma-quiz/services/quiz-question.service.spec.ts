import { TestBed } from '@automock/jest';
import { QuizQuestionService } from './quiz-question.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { QuizQuestion } from '../entities/quiz-question.entity';
import {
  mockQuizQuestion,
  mockQuizRound,
} from '../../test/factories/sigma-quiz.factory';

describe('QuizQuestionService', () => {
  let service: QuizQuestionService;
  let quizQuestionRepo: Repository<QuizQuestion>;

  const mockEntityManager = {
    save: jest.fn(),
  } as unknown as EntityManager;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(QuizQuestionService).compile();

    service = unit;
    quizQuestionRepo = unitRef.get(getRepositoryToken(QuizQuestion) as string);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRoundQuestions', () => {
    const round = mockQuizRound({
      id: 'round-id-1',
      no_of_questions: 5,
    });

    it('should create the correct number of questions for the round', async () => {
      const mockCreatedQuestions = Array.from(
        { length: round.no_of_questions },
        (_, index) =>
          mockQuizQuestion({
            question_number: index + 1,
            roundId: round.id,
            round: round,
          }),
      );

      mockCreatedQuestions.forEach((question, index) => {
        jest.spyOn(quizQuestionRepo, 'create').mockReturnValueOnce(question);
      });

      await service.createRoundQuestions(round, mockEntityManager);

      expect(quizQuestionRepo.create).toHaveBeenCalledTimes(
        round.no_of_questions,
      );
      mockCreatedQuestions.forEach((question, index) => {
        expect(quizQuestionRepo.create).toHaveBeenCalledWith({
          question_number: index + 1,
          roundId: round.id,
          round: round,
        });
      });

      expect(mockEntityManager.save).toHaveBeenCalledWith(
        QuizQuestion,
        mockCreatedQuestions,
      );
    });

    it('should handle errors thrown by the repository or entity manager', async () => {
      jest.spyOn(quizQuestionRepo, 'create').mockImplementation(() => {
        throw new Error('Test error');
      });

      await expect(
        service.createRoundQuestions(round, mockEntityManager),
      ).rejects.toThrow('Test error');
    });
  });
});
