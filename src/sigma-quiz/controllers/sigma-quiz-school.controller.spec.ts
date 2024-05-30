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
});
