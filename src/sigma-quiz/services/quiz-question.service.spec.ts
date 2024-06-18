import { TestBed } from '@automock/jest';
import { QuizQuestionService } from './quiz-question.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, EntityManager, Between, FindOptionsWhere } from 'typeorm';
import { QuizQuestion } from '../entities/quiz-question.entity';
import {
  mockQuizQuestion,
  mockQuizRound,
  mockSchoolQuizRegistration,
  mockSchoolRoundParticipation,
  mockSigmaQuizSchool,
} from '../../test/factories/sigma-quiz.factory';
import { QuizRoundService } from './quiz-round.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('QuizQuestionService', () => {
  let service: QuizQuestionService;
  let quizQuestionRepo: Repository<QuizQuestion>;
  let quizRoundService: QuizRoundService;

  const mockEntityManager = {
    save: jest.fn(),
    delete: jest.fn(),
  } as unknown as EntityManager;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(QuizQuestionService).compile();

    service = unit;
    quizQuestionRepo = unitRef.get(getRepositoryToken(QuizQuestion) as string);
    quizRoundService = unitRef.get(QuizRoundService);
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

  describe('findAll', () => {
    it('should return an array of QuizQuestions', async () => {
      const quizQuestions = [mockQuizQuestion(), mockQuizQuestion()];
      jest.spyOn(quizQuestionRepo, 'find').mockResolvedValue(quizQuestions);
      expect(await service.findAll()).toEqual(quizQuestions);
    });

    it('should query QuizQuestions with provided whereClause', async () => {
      const whereClause: FindOptionsWhere<QuizQuestion> = {
        question_number: 1,
      };
      const quizQuestions = [mockQuizQuestion({ question_number: 1 })];

      jest.spyOn(quizQuestionRepo, 'find').mockResolvedValue(quizQuestions);

      const result = await service.findAll(whereClause);

      expect(result).toEqual(quizQuestions);
      expect(quizQuestionRepo.find).toHaveBeenCalledWith({
        where: whereClause,
      });
    });
  });

  describe('findOneById', () => {
    it('should return the QuizQuestion with the provided id', async () => {
      const quizQuestionId = '1';
      const quizQuestion = mockQuizQuestion();
      jest.spyOn(quizQuestionRepo, 'findOne').mockResolvedValue(quizQuestion);
      expect(await service.findOneById(quizQuestionId)).toBe(quizQuestion);
    });

    it('should throw NotFound Exception if QuizQuestion with provided id does not exist', async () => {
      const quizQuestionId = 'nonexistent-id';
      jest.spyOn(quizQuestionRepo, 'findOneBy').mockResolvedValue(undefined);
      await expect(service.findOneById(quizQuestionId)).rejects.toThrow(
        NotFoundException,
      );
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

  describe('markQuestion', () => {
    const questionId = 'question-id-1';
    const schoolId = 'school-id-1';
    const roundId = 'round-id-1';
    const answered_correctly = true;
    const question = mockQuizQuestion({
      id: questionId,
      roundId,
      answered_by: null,
      answered_correctly: null,
    });
    const roundParticipation = mockSchoolRoundParticipation({
      id: 'participation-id-1',
      schoolRegistration: mockSchoolQuizRegistration({
        school: mockSigmaQuizSchool({ id: schoolId, name: 'School A' }),
      }),
    });

    it('should successfully mark a question as answered correctly', async () => {
      const markedQuestion = {
        ...question,
        answered_by: roundParticipation,
        answered_correctly: answered_correctly,
      };

      jest
        .spyOn(service, 'findOneById')
        .mockResolvedValueOnce(question);
      jest
        .spyOn(quizRoundService, 'fetchSchoolParticipationForQuizRound')
        .mockResolvedValueOnce(roundParticipation);
      jest.spyOn(quizQuestionRepo, 'save').mockResolvedValueOnce(question);
      jest.spyOn(service, 'findOneById').mockResolvedValueOnce(markedQuestion);

      const result = await service.markQuestion(
        questionId,
        schoolId,
        answered_correctly,
      );

      expect(result.answered_by).toEqual(roundParticipation);
      expect(result.answered_correctly).toBe(answered_correctly);
      expect(service.findOneById).toHaveBeenCalledTimes(2);
      expect(quizQuestionRepo.save).toHaveBeenCalledWith(markedQuestion);
    });

    it('should throw ConflictException if question is already answered', async () => {
      const answeredQuestion = {
        ...question,
        answered_by: roundParticipation,
      };

      jest
        .spyOn(quizRoundService, 'fetchSchoolParticipationForQuizRound')
        .mockResolvedValueOnce(roundParticipation);
      jest
        .spyOn(service, 'findOneById')
        .mockResolvedValueOnce(answeredQuestion);


      await expect(
        service.markQuestion(questionId, schoolId, answered_correctly),
      ).rejects.toThrow(ConflictException);

      expect(service.findOneById).toHaveBeenCalledTimes(1);
      expect(
        quizRoundService.fetchSchoolParticipationForQuizRound,
      ).toHaveBeenCalledTimes(1);
      expect(quizQuestionRepo.save).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const errorMessage = 'An error occurred';
      jest
        .spyOn(service, 'findOneById')
        .mockRejectedValueOnce(new Error(errorMessage));

      await expect(
        service.markQuestion(questionId, schoolId, answered_correctly),
      ).rejects.toThrow(errorMessage);

      expect(service.findOneById).toHaveBeenCalledTimes(1);
      expect(
        quizRoundService.fetchSchoolParticipationForQuizRound,
      ).not.toHaveBeenCalled();
      expect(quizQuestionRepo.save).not.toHaveBeenCalled();
    });
  });
});
