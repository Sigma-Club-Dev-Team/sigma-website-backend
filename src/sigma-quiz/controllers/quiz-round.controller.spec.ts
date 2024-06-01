import { TestBed } from '@automock/jest';
import {
  mockCreateQuizRoundDto,
  mockQuizRound,
  mockUpdateQuizRoundDto,
} from '../../test/factories/sigma-quiz.factory';
import { QuizRoundController } from './quiz-round.controller';
import { QuizRoundService } from '../services/quiz-round.service';

describe('QuizRoundController', () => {
  let controller: QuizRoundController;
  let quizRoundService: QuizRoundService;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(QuizRoundController).compile();

    controller = unit;
    quizRoundService = unitRef.get(QuizRoundService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new QuizRound', async () => {
      const createQuizRoundDto = mockCreateQuizRoundDto();

      const result = mockQuizRound(createQuizRoundDto);

      jest.spyOn(quizRoundService, 'create').mockResolvedValue(result);

      expect(await controller.create(createQuizRoundDto)).toEqual(result);
      expect(quizRoundService.create).toHaveBeenCalledWith(createQuizRoundDto);
    });
  });

  describe('fetchQuizRoundById', () => {
    it('should return a Sigma QuizRound by ID', async () => {
      const quizRoundId = '1';
      const quizRoundMock = mockQuizRound({ id: quizRoundId });

      jest
        .spyOn(quizRoundService, 'findOneById')
        .mockResolvedValue(quizRoundMock);

      expect(await controller.findQuizRoundById(quizRoundId)).toEqual(
        quizRoundMock,
      );
      expect(quizRoundService.findOneById).toHaveBeenCalledWith(quizRoundId);
    });
  });

  describe('update', () => {
    it('should update a QuizRound by ID', async () => {
      const updateSchoolDto = mockUpdateQuizRoundDto({
        name: 'updated_NAME',
      });
      const schoolId = '1';
      const schoolMock = mockQuizRound({ id: '1' });

      const expectedResponse = {
        ...schoolMock,
        ...updateSchoolDto,
      };

      jest
        .spyOn(quizRoundService, 'update')
        .mockResolvedValueOnce(expectedResponse);

      const result = await controller.update(schoolId, updateSchoolDto);
      expect(result).toEqual({ ...schoolMock, ...updateSchoolDto });
      expect(quizRoundService.update).toHaveBeenCalledWith(
        schoolId,
        updateSchoolDto,
      );
    });
  });
});
