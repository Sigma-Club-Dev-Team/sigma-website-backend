import { TestBed } from '@automock/jest';
import { SigmaQuizService } from './sigma-quiz.service';
import { SigmaQuiz } from './entities/sigma-quiz.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import {
  buildCreateSigmaQuizDtoMock,
  buildSigmaQuizMock,
  buildUpdateSigmaQuizDtoMock,
} from '../test/factories/sigma-quiz.factory';
import { PostgresErrorCode } from '../database/postgres-errorcodes.enum';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('SigmaQuizService', () => {
  let service: SigmaQuizService;
  let sigmaQuizRepo: Repository<SigmaQuiz>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(SigmaQuizService).compile();

    service = unit;
    sigmaQuizRepo = unitRef.get(getRepositoryToken(SigmaQuiz) as string);
  });

  afterEach(() => {
    jest.clearAllMocks();
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

  describe('findAll', () => {
    it('should return an array of Sigma Quizes', async () => {
      const sigmaQuizes = [buildSigmaQuizMock(), buildSigmaQuizMock()];
      jest.spyOn(sigmaQuizRepo, 'find').mockResolvedValue(sigmaQuizes);
      expect(await service.findAll()).toEqual(sigmaQuizes);
    });

    it('should query Sigma Quizes with provided whereClause', async () => {
      const whereClause: FindOptionsWhere<SigmaQuiz> = {
        date: new Date(),
      };
      const sigmaQuizes = [buildSigmaQuizMock()];

      jest.spyOn(sigmaQuizRepo, 'find').mockResolvedValue(sigmaQuizes);

      const result = await service.findAll(whereClause);

      expect(result).toEqual(sigmaQuizes);
      expect(sigmaQuizRepo.find).toHaveBeenCalledWith({ where: whereClause });
    });
  });

  describe('findOneById', () => {
    it('should return the Sigma Quiz with the provided id', async () => {
      const quizId = '1';
      const sigmaQuiz = buildSigmaQuizMock();
      jest.spyOn(sigmaQuizRepo, 'findOneBy').mockResolvedValue(sigmaQuiz);
      expect(await service.findOneById(quizId)).toBe(sigmaQuiz);
    });

    it('should throw HttpStatus.NOT_FOUND if Sigma Quiz with provided id does not exist', async () => {
      const userId = 'nonexistent-id';
      jest.spyOn(sigmaQuizRepo, 'findOneBy').mockResolvedValue(undefined);
      await expect(service.findOneById(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a SigmaQuiz', async () => {
      const quizId = 'quiz-id';
      const updateSigmaQuizDto = buildUpdateSigmaQuizDtoMock({
        title: 'updated_title',
      });
      const mockSigmaQuiz = buildSigmaQuizMock({ id: quizId });
      const updatedSigmaQuizMock = buildSigmaQuizMock({
        ...mockSigmaQuiz,
        ...updateSigmaQuizDto,
      });
      jest
        .spyOn(service, 'findOneById')
        .mockResolvedValueOnce(mockSigmaQuiz)
        .mockResolvedValueOnce(updatedSigmaQuizMock);
      jest.spyOn(sigmaQuizRepo, 'save').mockResolvedValueOnce(updatedSigmaQuizMock);

      const result = await service.update(quizId, updateSigmaQuizDto);

      expect(result).toBe(updatedSigmaQuizMock);
      expect(sigmaQuizRepo.save).toHaveBeenCalledWith(
        expect.objectContaining(updateSigmaQuizDto),
      );
    });
  });

  describe('remove', () => {
    it('should remove a SigmaQuiz', async () => {
      const quizId = 'quiz-id';
      const mockQuiz = buildSigmaQuizMock({ id: quizId });
      jest.spyOn(service, 'findOneById').mockResolvedValueOnce(mockQuiz);
      jest.spyOn(sigmaQuizRepo, 'delete').mockResolvedValueOnce(undefined);

      await service.remove(quizId);

      expect(sigmaQuizRepo.delete).toHaveBeenCalledWith(quizId);
    });

    it('should throw NotFoundException if course not found', async () => {
      const quizId = 'quiz-id';
      jest.spyOn(service, 'findOneById').mockResolvedValueOnce(undefined);

      await expect(service.remove(quizId)).rejects.toThrow(NotFoundException);
    });
  });
});
