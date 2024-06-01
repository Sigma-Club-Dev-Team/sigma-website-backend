import { TestBed } from '@automock/jest';
import { FindOptionsWhere, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  mockCreateQuizRoundDto,
  mockQuizRound,
  mockUpdateQuizRoundDto,
} from '../../test/factories/sigma-quiz.factory';
import { QuizRoundService } from './quiz-round.service';
import { QuizRound } from '../entities/quiz-round.entity';
import { NotFoundException } from '@nestjs/common';

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

      jest.spyOn(quizRoundRepo, 'create').mockReturnValue(savedQuizRound);
      jest.spyOn(quizRoundRepo, 'save').mockResolvedValue(savedQuizRound);

      const result = await service.create(createQuizRoundDto);
      expect(result).toEqual(savedQuizRound);
      expect(quizRoundRepo.create).toHaveBeenCalledWith(createQuizRoundDto);
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

  describe('findAll', () => {
    it('should return an array of QuizRounds', async () => {
      const quizRounds = [mockQuizRound(), mockQuizRound()];
      jest.spyOn(quizRoundRepo, 'find').mockResolvedValue(quizRounds);
      expect(await service.findAll()).toEqual(quizRounds);
    });

    it('should query QuizRounds with provided whereClause', async () => {
      const whereClause: FindOptionsWhere<QuizRound> = {
        round_number: 1,
      };
      const quizRounds = [mockQuizRound({ round_number: 1 })];

      jest.spyOn(quizRoundRepo, 'find').mockResolvedValue(quizRounds);

      const result = await service.findAll(whereClause);

      expect(result).toEqual(quizRounds);
      expect(quizRoundRepo.find).toHaveBeenCalledWith({
        where: whereClause,
      });
    });
  });

  describe('findOneById', () => {
    it('should return the QuizRound with the provided id', async () => {
      const quizRoundId = '1';
      const quizRound = mockQuizRound();
      jest.spyOn(quizRoundRepo, 'findOneBy').mockResolvedValue(quizRound);
      expect(await service.findOneById(quizRoundId)).toBe(quizRound);
    });

    it('should throw NotFound Exception if QuizRound with provided id does not exist', async () => {
      const quizRoundId = 'nonexistent-id';
      jest.spyOn(quizRoundRepo, 'findOneBy').mockResolvedValue(undefined);
      await expect(service.findOneById(quizRoundId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a QuizRound', async () => {
      const quizRoundId = 'quiz-round-id';
      const updateQuizRoundDto = mockUpdateQuizRoundDto({
        name: 'updated_name',
      });
      const quizRoundMock = mockQuizRound({ id: quizRoundId });
      const updatedQuizRound = mockQuizRound({
        ...quizRoundMock,
        ...updateQuizRoundDto,
      });
      jest
        .spyOn(service, 'findOneById')
        .mockResolvedValueOnce(quizRoundMock)
        .mockResolvedValueOnce(updatedQuizRound);
      jest.spyOn(quizRoundRepo, 'save').mockResolvedValueOnce(updatedQuizRound);

      const result = await service.update(quizRoundId, updateQuizRoundDto);

      expect(result).toBe(updatedQuizRound);
      expect(quizRoundRepo.save).toHaveBeenCalledWith(
        expect.objectContaining(updateQuizRoundDto),
      );
    });
  });
});
