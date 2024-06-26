import { TestBed } from '@automock/jest';
import { SigmaQuizController } from './sigma-quiz.controller';
import { SigmaQuizService } from '../services/sigma-quiz.service';
import {
  buildCreateSigmaQuizDtoMock,
  buildSigmaQuizMock,
  buildUpdateSigmaQuizDtoMock,
  mockQuizRound,
  mockRegisterSchForQuizDto,
  mockSchoolQuizRegistration,
  mockUpdateQuizStatusDto,
} from '../../test/factories/sigma-quiz.factory';
import { NotFoundException } from '@nestjs/common';
import { QuizStatus } from '../../constants/enums';

describe('SigmaQuizController', () => {
  let controller: SigmaQuizController;
  let sigmaQuizService: SigmaQuizService;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(SigmaQuizController).compile();

    controller = unit;
    sigmaQuizService = unitRef.get(SigmaQuizService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new SigmaQuiz', async () => {
      const createSigmaQuizDto = buildCreateSigmaQuizDtoMock({
        title: 'New Quiz',
        description: 'A description for the new quiz',
        date: new Date('2024-05-23'),
      });

      const result = buildSigmaQuizMock({
        id: 'some-id',
        ...createSigmaQuizDto,
        year: 2024,
      });

      jest.spyOn(sigmaQuizService, 'create').mockResolvedValue(result);

      expect(await controller.create(createSigmaQuizDto)).toEqual(result);
      expect(sigmaQuizService.create).toHaveBeenCalledWith(createSigmaQuizDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of quizes', async () => {
      const result = [
        buildSigmaQuizMock({
          id: '1',
        }),
        buildSigmaQuizMock({
          id: '2',
        }),
      ];

      jest.spyOn(sigmaQuizService, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
      expect(sigmaQuizService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should handle errors', async () => {
      const error = new Error('An error occurred');
      jest.spyOn(sigmaQuizService, 'findAll').mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow(error);
      expect(sigmaQuizService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('fetchSigmaQuizById', () => {
    it('should return a SigmaQuiz by ID', async () => {
      const quizId = '1';
      const mockQuiz = buildSigmaQuizMock({ id: quizId });

      jest.spyOn(sigmaQuizService, 'findOneById').mockResolvedValue(mockQuiz);

      expect(await controller.findSigmaQuizById(quizId)).toEqual(mockQuiz);
      expect(sigmaQuizService.findOneById).toHaveBeenCalledWith(quizId);
    });
  });

  describe('update', () => {
    it('should update a SigmaQuiz by ID', async () => {
      const updateSigmaQuizDto = buildUpdateSigmaQuizDtoMock({
        title: 'updated_title',
      });
      const quizId = '1';
      const mockQuiz = buildSigmaQuizMock({ id: '1' });

      const expectedResponse = {
        ...mockQuiz,
        ...updateSigmaQuizDto,
      };

      jest
        .spyOn(sigmaQuizService, 'update')
        .mockResolvedValueOnce(expectedResponse);

      const result = await controller.update(quizId, updateSigmaQuizDto);
      expect(result).toEqual({ ...mockQuiz, ...updateSigmaQuizDto });
      expect(sigmaQuizService.update).toHaveBeenCalledWith(
        quizId,
        updateSigmaQuizDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a SigmaQuiz', async () => {
      const quizId = 'quiz-id';
      jest.spyOn(sigmaQuizService, 'remove').mockResolvedValueOnce(undefined);

      const result = await controller.remove(quizId);

      expect(result).toEqual({ message: 'Successful' });
      expect(sigmaQuizService.remove).toHaveBeenCalledWith(quizId);
    });
  });

  describe('fetchQuizRounds', () => {
    it('should return quiz rounds', async () => {
      const quizId = '123e4567-e89b-12d3-a456-426614174000';
      const quizRounds = [
        mockQuizRound({ id: '1' }),
        mockQuizRound({ id: '2' }),
      ];
      jest
        .spyOn(sigmaQuizService, 'fetchQuizRounds')
        .mockResolvedValue(quizRounds);

      const result = await controller.fetchQuizRounds(quizId);

      expect(result).toEqual(quizRounds);
      expect(sigmaQuizService.fetchQuizRounds).toHaveBeenCalledWith(quizId);
    });

    it('should throw an error when SigmaQuizService.fetchQuizRounds throws an error', async () => {
      const quizId = '123e4567-e89b-12d3-a456-426614174000';
      jest
        .spyOn(sigmaQuizService, 'fetchQuizRounds')
        .mockRejectedValue(new NotFoundException());

      await expect(controller.fetchQuizRounds(quizId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('registerSchoolForQuiz', () => {
    it('should register school for quiz successfully', async () => {
      const quizId = 'quiz-id';
      const registerSchForQuizDto = mockRegisterSchForQuizDto({
        school_id: 'school-id',
      });
      const expectedResult = mockSchoolQuizRegistration();

      jest
        .spyOn(sigmaQuizService, 'registerSchoolForQuiz')
        .mockResolvedValue(expectedResult);

      const result = await controller.registerSchoolForQuiz(
        quizId,
        registerSchForQuizDto,
      );

      expect(result).toEqual(expectedResult);
      expect(sigmaQuizService.registerSchoolForQuiz).toHaveBeenCalledWith(
        quizId,
        registerSchForQuizDto.school_id,
      );
    });
  });

  describe('fetchSchoolsRegisteredForQuiz', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should fetch schools registered for a quiz', async () => {
      const quizId = 'quizId1';
      const schoolRegistrations = [
        mockSchoolQuizRegistration(),
        mockSchoolQuizRegistration(),
      ];
      jest
        .spyOn(sigmaQuizService, 'fetchSchoolsRegisteredForQuiz')
        .mockResolvedValue(schoolRegistrations);

      const result = await controller.fetchSchoolsRegisteredForQuiz(quizId);

      expect(
        sigmaQuizService.fetchSchoolsRegisteredForQuiz,
      ).toHaveBeenCalledWith(quizId);
      expect(result).toEqual(schoolRegistrations);
    });
  });

  describe('unregisterSchoolFromQuiz', () => {
    it('should unregister a school from a quiz and return a success message with remaining registered schools', async () => {
      const quizId = 'quizId1';
      const schoolId = 'schoolId1';
      const remainingRegisteredSchools = [
        mockSchoolQuizRegistration({ id: 'schoolId2' }),
      ];

      jest
        .spyOn(sigmaQuizService, 'unregisterSchoolForQuiz')
        .mockResolvedValue(remainingRegisteredSchools);

      const result = await controller.unregisterSchoolFromQuiz(
        quizId,
        schoolId,
      );

      expect(sigmaQuizService.unregisterSchoolForQuiz).toHaveBeenCalledWith(
        quizId,
        schoolId,
      );
      expect(result).toEqual({
        message: 'Successful',
        registered_schools: remainingRegisteredSchools,
      });
    });

  });

  describe('fetchResults', () => {
    const quizId = 'some-uuid';

    it('should call SigmaQuizService.fetchResults with the correct ID', async () => {
      const result = buildSigmaQuizMock();
      jest.spyOn(sigmaQuizService, 'fetchResults').mockResolvedValue(result);
      

      const response = await controller.fetchResults(quizId);

      expect(sigmaQuizService.fetchResults).toHaveBeenCalledWith(quizId);
      expect(response).toBe(result);
    });

    it('should throw an error if the service throws an error', async () => {
      jest
        .spyOn(sigmaQuizService, 'fetchResults')
        .mockRejectedValue(new NotFoundException('Quiz not found'));

      await expect(controller.fetchResults(quizId)).rejects.toThrow(
        NotFoundException,
      );

      expect(sigmaQuizService.fetchResults).toHaveBeenCalledWith(quizId);
    });
  });

  describe('updateQuizStatus', () => {
    it('should successfully update the quiz status', async () => {
      const quizId = 'test-quiz-id';
      const updateQuizStatusDto = mockUpdateQuizStatusDto({
        new_status: QuizStatus.InProgress,
      });
      const updatedQuiz = buildSigmaQuizMock({
        id: quizId,
        status: updateQuizStatusDto.new_status
      });

      jest.spyOn(sigmaQuizService, 'updateQuizStatus').mockResolvedValue(updatedQuiz);

      const result = await controller.updateQuizStatus(
        quizId,
        updateQuizStatusDto,
      );

      expect(sigmaQuizService.updateQuizStatus).toHaveBeenCalledWith(
        quizId,
        updateQuizStatusDto.new_status,
      );
      expect(result).toEqual(updatedQuiz);
    });

    it('should throw an error if updateQuizStatus throws an error', async () => {
      const quizId = 'test-quiz-id';
      const updateQuizStatusDto = mockUpdateQuizStatusDto({
        new_status: QuizStatus.InProgress,
      });

      jest
        .spyOn(sigmaQuizService, 'updateQuizStatus')
        .mockRejectedValue(new Error('Update failed'));

      await expect(
        controller.updateQuizStatus(quizId, updateQuizStatusDto),
      ).rejects.toThrow('Update failed');
      expect(sigmaQuizService.updateQuizStatus).toHaveBeenCalledWith(
        quizId,
        updateQuizStatusDto.new_status,
      );
    });
  });
});
