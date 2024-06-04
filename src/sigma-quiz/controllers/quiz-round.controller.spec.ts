import { TestBed } from '@automock/jest';
import {
  mockCreateQuizRoundDto,
  mockQuizRound,
  mockRegisterSchForQuizDto,
  mockSchoolRoundParticipation,
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

  describe('remove', () => {
    it('should remove a QuizRound', async () => {
      const quizRoundId = 'quiz-round-id';
      jest.spyOn(quizRoundService, 'remove').mockResolvedValueOnce(undefined);

      const result = await controller.remove(quizRoundId);

      expect(result).toEqual({ message: 'Successful' });
      expect(quizRoundService.remove).toHaveBeenCalledWith(quizRoundId);
    });
  });

  describe('registerSchoolForRound', () => {
    it('should add school participation for QuizRound successfully', async () => {
      const roundId = 'quiz-round-id';
      const registerSchForQuizDto = mockRegisterSchForQuizDto({
        school_id: 'school-id',
      });
      const expectedResult = mockSchoolRoundParticipation();

      jest
        .spyOn(quizRoundService, 'addSchoolParticipationInRound')
        .mockResolvedValue(expectedResult);

      const result = await controller.registerSchoolForRound(
        roundId,
        registerSchForQuizDto,
      );

      expect(result).toEqual(expectedResult);
      expect(
        quizRoundService.addSchoolParticipationInRound,
      ).toHaveBeenCalledWith(roundId, registerSchForQuizDto.school_id);
    });
  });

  describe('fetchScholsRegisteredForQuiz', () => {
    it('should fetch schools participating in quiz round', async () => {
      const quizRoundId = 'quiz-round-id';
      const participatingSchools = [
        mockSchoolRoundParticipation({
          roundId: quizRoundId,
        }),
        mockSchoolRoundParticipation({
          roundId: quizRoundId,
        }),
      ];
      jest
        .spyOn(quizRoundService, 'fetchParticipatingSchools')
        .mockResolvedValue(participatingSchools);

      const result = await controller.fetchParticipatingSchools(quizRoundId);

      expect(quizRoundService.fetchParticipatingSchools).toHaveBeenCalledWith(
        quizRoundId,
      );
      expect(result).toEqual(participatingSchools);
    });
  });

  describe('removeSchoolFromRound', () => {
    it('should remove a school from a quizround participating schools and return a success message with remaining participating schools', async () => {
      const quizRoundId = 'quiz-round-Id';
      const schoolId = 'schoolId1';
      const remainingParticipatingSchools = [
        mockSchoolRoundParticipation({ id: schoolId }),
      ];

      jest
        .spyOn(quizRoundService, 'removeSchoolFromQuizRound')
        .mockResolvedValue(remainingParticipatingSchools);

      const result = await controller.removeSchoolFromRound(
        quizRoundId,
        schoolId,
      );

      expect(quizRoundService.removeSchoolFromQuizRound).toHaveBeenCalledWith(
        quizRoundId,
        schoolId,
      );
      expect(result).toEqual({
        message: 'Successful',
        participating_schools: remainingParticipatingSchools,
      });
    });
  });
});
