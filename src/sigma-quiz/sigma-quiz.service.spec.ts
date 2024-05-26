import { TestBed } from '@automock/jest';
import { SigmaQuizService } from './sigma-quiz.service';
import { SigmaQuiz } from './entities/sigma-quiz.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  buildCreateSigmaQuizDtoMock,
  buildSigmaQuizMock,
} from '../test/factories/sigma-quiz.factory';
import { PostgresErrorCode } from '../database/postgres-errorcodes.enum';
import { ConflictException } from '@nestjs/common';

describe('SigmaQuizService', () => {
  let service: SigmaQuizService;
  let sigmaQuizRepo: Repository<SigmaQuiz>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(SigmaQuizService).compile();

    service = unit;
    sigmaQuizRepo = unitRef.get(getRepositoryToken(SigmaQuiz) as string);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new sigma quiz successfully', async () => {
      const createSigmaQuizDto = buildCreateSigmaQuizDtoMock({
        date: new Date('2023-05-23'),
      });
      const createdSigmaQuiz = {
        ...createSigmaQuizDto,
        year: 2023,
      };
      const savedSigmaQuiz = buildSigmaQuizMock({
        id: '1',
        ...createdSigmaQuiz,
      });

      jest.spyOn(sigmaQuizRepo, 'create').mockReturnValue(savedSigmaQuiz);
      jest.spyOn(sigmaQuizRepo, 'save').mockResolvedValue(savedSigmaQuiz);

      const result = await service.create(createSigmaQuizDto);
      expect(result).toEqual(savedSigmaQuiz);
      expect(sigmaQuizRepo.create).toHaveBeenCalledWith(createdSigmaQuiz);
      expect(sigmaQuizRepo.save).toHaveBeenCalledWith(savedSigmaQuiz);
    });

    it('should throw a ConflictException if quiz with the same date already exists', async () => {
      const createSigmaQuizDto = buildCreateSigmaQuizDtoMock({
        date: new Date('2023-05-23'),
      });

      const error = {
        code: PostgresErrorCode.UniqueViolation,
        detail: 'Quiz with that date already exists',
      };

      const savedSigmaQuiz = buildSigmaQuizMock({
        id: '1',
        ...createSigmaQuizDto,
      });

      jest.spyOn(sigmaQuizRepo, 'create').mockReturnValue(savedSigmaQuiz);
      jest.spyOn(sigmaQuizRepo, 'save').mockRejectedValue(error);

      await expect(service.create(createSigmaQuizDto)).rejects.toThrow(
        ConflictException,
      );
      expect(sigmaQuizRepo.create).toHaveBeenCalled();
      expect(sigmaQuizRepo.save).toHaveBeenCalled();
    });

    it('should throw any other error that occurs during creation', async () => {
      const createSigmaQuizDto = buildCreateSigmaQuizDtoMock({
        date: new Date('2023-05-23'),
      });
      const error = new Error('Some unexpected error');

      const savedSigmaQuiz = buildSigmaQuizMock({
        id: '1',
        ...createSigmaQuizDto,
      });

      jest.spyOn(sigmaQuizRepo, 'create').mockReturnValue(savedSigmaQuiz);
      jest.spyOn(sigmaQuizRepo, 'save').mockRejectedValue(error);

      await expect(service.create(createSigmaQuizDto)).rejects.toThrow(error);
      expect(sigmaQuizRepo.create).toHaveBeenCalled();
      expect(sigmaQuizRepo.save).toHaveBeenCalled();
    });
  });
});
