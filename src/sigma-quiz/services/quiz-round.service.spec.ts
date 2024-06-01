import { TestBed } from '@automock/jest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  mockCreateQuizRoundDto,
  mockQuizRound,
} from '../../test/factories/sigma-quiz.factory';
import { QuizRoundService } from './quiz-round.service';
import { QuizRound } from '../entities/quiz-round.entity';

describe('QuizRoundService', () => {
  let service: QuizRoundService;
  let quizRoundRepo: Repository<QuizRound>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(QuizRoundService).compile();

    service = unit;
    quizRoundRepo = unitRef.get(getRepositoryToken(QuizRound) as string);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new QuizRound successfully', async () => {
      const createQuizRoundDto = mockCreateQuizRoundDto();
      const savedQuizRound = mockQuizRound(createQuizRoundDto);

      jest
        .spyOn(quizRoundRepo, 'create')
        .mockReturnValue(savedQuizRound);
      jest
        .spyOn(quizRoundRepo, 'save')
        .mockResolvedValue(savedQuizRound);

      const result = await service.create(createQuizRoundDto);
      expect(result).toEqual(savedQuizRound);
      expect(quizRoundRepo.create).toHaveBeenCalledWith(
        createQuizRoundDto,
      );
      expect(quizRoundRepo.save).toHaveBeenCalledWith(savedQuizRound);
    });

    it('should throw any other error that occurs during creation', async () => {
      const createQuizRoundDto = mockCreateQuizRoundDto();
      const error = new Error('Some unexpected error');

      const savedQuizRound = mockQuizRound(createQuizRoundDto);

      jest.spyOn(quizRoundRepo, 'create').mockReturnValue(savedQuizRound);
      jest.spyOn(quizRoundRepo, 'save').mockRejectedValue(error);

      await expect(service.create(createQuizRoundDto)).rejects.toThrow(error);
      expect(quizRoundRepo.create).toHaveBeenCalled();
      expect(quizRoundRepo.save).toHaveBeenCalled();
    });
  });
});