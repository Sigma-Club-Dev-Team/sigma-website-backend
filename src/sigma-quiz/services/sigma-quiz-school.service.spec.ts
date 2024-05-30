import { TestBed } from '@automock/jest';
import { SigmaQuizSchoolService } from './sigma-quiz-school.service';
import { Repository } from 'typeorm';
import { SigmaQuizSchool } from '../entities/sigma-quiz-school.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  mockSigmaQuizSchool,
  mockCreateSigmaQuizSchoolDto,
} from '../../test/factories/sigma-quiz.factory';

describe('SigmaQuizSchoolService', () => {
  let service: SigmaQuizSchoolService;
  let sigmaQuizSchRepo: Repository<SigmaQuizSchool>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(SigmaQuizSchoolService).compile();

    service = unit;
    sigmaQuizSchRepo = unitRef.get(
      getRepositoryToken(SigmaQuizSchool) as string,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new sigma quiz successfully', async () => {
      const createSigmaQuizSchoolDto = mockCreateSigmaQuizSchoolDto();
      const savedSigmaQuizSchool = mockSigmaQuizSchool(
        createSigmaQuizSchoolDto,
      );

      jest
        .spyOn(sigmaQuizSchRepo, 'create')
        .mockReturnValue(savedSigmaQuizSchool);
      jest
        .spyOn(sigmaQuizSchRepo, 'save')
        .mockResolvedValue(savedSigmaQuizSchool);

      const result = await service.create(createSigmaQuizSchoolDto);
      expect(result).toEqual(savedSigmaQuizSchool);
      expect(sigmaQuizSchRepo.create).toHaveBeenCalledWith(
        createSigmaQuizSchoolDto,
      );
      expect(sigmaQuizSchRepo.save).toHaveBeenCalledWith(savedSigmaQuizSchool);
    });

    it('should throw any other error that occurs during creation', async () => {
      const createSigmaQuizDto = mockCreateSigmaQuizSchoolDto();
      const error = new Error('Some unexpected error');

      const savedSigmaQuiz = mockSigmaQuizSchool(createSigmaQuizDto);

      jest.spyOn(sigmaQuizSchRepo, 'create').mockReturnValue(savedSigmaQuiz);
      jest.spyOn(sigmaQuizSchRepo, 'save').mockRejectedValue(error);

      await expect(service.create(createSigmaQuizDto)).rejects.toThrow(error);
      expect(sigmaQuizSchRepo.create).toHaveBeenCalled();
      expect(sigmaQuizSchRepo.save).toHaveBeenCalled();
    });
  });
});
