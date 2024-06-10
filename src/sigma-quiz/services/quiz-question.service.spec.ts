import { TestBed } from '@automock/jest';
import { QuizQuestionService } from './quiz-question.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, EntityManager, Between } from 'typeorm';
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
    delete: jest.fn(),
  } as unknown as EntityManager;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(QuizQuestionService).compile();

    service = unit;
    quizQuestionRepo = unitRef.get(getRepositoryToken(QuizQuestion) as string);
  });

  afterEach(() => {
    jest.clearAllMocks();
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

  describe('updateRoundQuestions', () => {
    const round = mockQuizRound({
      id: 'round-id-1',
      no_of_questions: 5,
    });

    it('should do nothing if the number of questions matches the existing number', async () => {
      jest
        .spyOn(quizQuestionRepo, 'find')
        .mockResolvedValueOnce([mockQuizQuestion({ question_number: 5 })]);

      await service.updateRoundQuestions(round, mockEntityManager);

      expect(quizQuestionRepo.find).toHaveBeenCalledWith({
        where: { round: { id: round.id } },
        order: { question_number: 'DESC' },
      });
      expect(mockEntityManager.save).not.toHaveBeenCalled();
      expect(mockEntityManager.delete).not.toHaveBeenCalled();
    });

    it('should create new questions if the existing number is less than required', async () => {
      jest
        .spyOn(quizQuestionRepo, 'find')
        .mockResolvedValueOnce([mockQuizQuestion({ question_number: 3 })]);

      const mockCreatedQuestions = [
        mockQuizQuestion({
          question_number: 4,
          roundId: round.id,
          round: round,
        }),
        mockQuizQuestion({
          question_number: 5,
          roundId: round.id,
          round: round,
        }),
      ];

      mockCreatedQuestions.forEach((question) => {
        jest.spyOn(quizQuestionRepo, 'create').mockReturnValueOnce(question);
      });

      await service.updateRoundQuestions(round, mockEntityManager);

      expect(quizQuestionRepo.find).toHaveBeenCalledWith({
        where: { round: { id: round.id } },
        order: { question_number: 'DESC' },
      });
      expect(quizQuestionRepo.create).toHaveBeenCalledTimes(2);
      expect(mockEntityManager.save).toHaveBeenCalledWith(
        QuizQuestion,
        mockCreatedQuestions,
      );
    });

    it('should delete questions if the existing number is more than required', async () => {
      jest
        .spyOn(quizQuestionRepo, 'find')
        .mockResolvedValueOnce([mockQuizQuestion({ question_number: 7 })]);

      await service.updateRoundQuestions(round, mockEntityManager);

      expect(quizQuestionRepo.find).toHaveBeenCalledWith({
        where: { round: { id: round.id } },
        order: { question_number: 'DESC' },
      });
      expect(mockEntityManager.delete).toHaveBeenCalledWith(QuizQuestion, {
        question_number: Between(round.no_of_questions + 1, 7),
      });
      expect(mockEntityManager.save).not.toHaveBeenCalled();
    });

    it('should handle cases where there are no existing questions', async () => {
      jest.spyOn(quizQuestionRepo, 'find').mockResolvedValueOnce([]);

      const mockCreatedQuestions = [
        mockQuizQuestion({
          question_number: 1,
          roundId: round.id,
          round: round,
        }),
        mockQuizQuestion({
          question_number: 2,
          roundId: round.id,
          round: round,
        }),
        mockQuizQuestion({
          question_number: 3,
          roundId: round.id,
          round: round,
        }),
        mockQuizQuestion({
          question_number: 4,
          roundId: round.id,
          round: round,
        }),
        mockQuizQuestion({
          question_number: 5,
          roundId: round.id,
          round: round,
        }),
      ];

      mockCreatedQuestions.forEach((question) => {
        jest.spyOn(quizQuestionRepo, 'create').mockReturnValueOnce(question);
      });

      await service.updateRoundQuestions(round, mockEntityManager);

      expect(quizQuestionRepo.find).toHaveBeenCalledWith({
        where: { round: { id: round.id } },
        order: { question_number: 'DESC' },
      });
      expect(quizQuestionRepo.create).toHaveBeenCalledTimes(5);
      expect(mockEntityManager.save).toHaveBeenCalledWith(
        QuizQuestion,
        mockCreatedQuestions,
      );
    });
  });
});
