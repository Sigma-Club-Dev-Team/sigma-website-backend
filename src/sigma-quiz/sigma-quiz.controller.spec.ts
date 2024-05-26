import { TestBed } from '@automock/jest';
import { SigmaQuizController } from './sigma-quiz.controller';
import { SigmaQuizService } from './sigma-quiz.service';
import {
  buildCreateSigmaQuizDtoMock,
  buildSigmaQuizMock,
  buildUpdateSigmaQuizDtoMock,
} from '../test/factories/sigma-quiz.factory';

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
    it('should return an array of users', async () => {
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
});
