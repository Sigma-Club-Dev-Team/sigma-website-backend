import { TestBed } from '@automock/jest';
import {
  mockCreateQuizRoundDto,
  mockQuizRound,
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
    it('should create a new SigmaQuiz', async () => {
      const createQuizRoundDto = mockCreateQuizRoundDto();

      const result = mockQuizRound(createQuizRoundDto);

      jest.spyOn(quizRoundService, 'create').mockResolvedValue(result);

      expect(await controller.create(createQuizRoundDto)).toEqual(result);
      expect(quizRoundService.create).toHaveBeenCalledWith(createQuizRoundDto);
    });
  });
});
