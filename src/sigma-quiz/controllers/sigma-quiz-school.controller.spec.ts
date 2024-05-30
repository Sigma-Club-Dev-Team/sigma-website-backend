import { TestBed } from '@automock/jest';
import { SigmaQuizSchoolController } from './sigma-quiz-school.controller';
import { SigmaQuizSchoolService } from '../services/sigma-quiz-school.service';
import {
  mockCreateSigmaQuizSchoolDto,
  mockSigmaQuizSchool,
} from '../../test/factories/sigma-quiz.factory';

describe('SigmaQuizSchoolController', () => {
  let controller: SigmaQuizSchoolController;
  let sigmaQuizSchService: SigmaQuizSchoolService;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(
      SigmaQuizSchoolController,
    ).compile();

    controller = unit;
    sigmaQuizSchService = unitRef.get(SigmaQuizSchoolService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new SigmaQuiz', async () => {
      const createSigmaQuizSchDto = mockCreateSigmaQuizSchoolDto();

      const result = mockSigmaQuizSchool(createSigmaQuizSchDto);

      jest.spyOn(sigmaQuizSchService, 'create').mockResolvedValue(result);

      expect(await controller.create(createSigmaQuizSchDto)).toEqual(result);
      expect(sigmaQuizSchService.create).toHaveBeenCalledWith(
        createSigmaQuizSchDto,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of sigma quiz schools', async () => {
      const result = [
        mockSigmaQuizSchool({
          id: '1',
        }),
        mockSigmaQuizSchool({
          id: '2',
        }),
      ];

      jest.spyOn(sigmaQuizSchService, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
      expect(sigmaQuizSchService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should handle errors', async () => {
      const error = new Error('An error occurred');
      jest.spyOn(sigmaQuizSchService, 'findAll').mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow(error);
      expect(sigmaQuizSchService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('fetchSigmaQuizSchoolById', () => {
    it('should return a SigmaQuizSchool by ID', async () => {
      const schoolId = '1';
      const mockSchool = mockSigmaQuizSchool({ id: schoolId });

      jest
        .spyOn(sigmaQuizSchService, 'findOneById')
        .mockResolvedValue(mockSchool);

      expect(await controller.findSigmaQuizById(schoolId)).toEqual(mockSchool);
      expect(sigmaQuizSchService.findOneById).toHaveBeenCalledWith(schoolId);
    });
  });
});
