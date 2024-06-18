import { TestBed } from '@automock/jest';
import { QuizQuestionController } from './quiz-question.controller';
import { QuizQuestionService } from '../services/quiz-question.service';
import {
  mockMarkQuestionDto,
  mockQuizQuestion,
} from '../../test/factories/sigma-quiz.factory';

describe('QuizQuestionController', () => {
  let controller: QuizQuestionController;
  let quizQuestionService: QuizQuestionService;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(QuizQuestionController).compile();

    controller = unit;
    quizQuestionService = unitRef.get(QuizQuestionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('registerSchoolForRound', () => {
    const roundId = 'round-id-1';
    const markQuestionDto = mockMarkQuestionDto({
      school_id: 'school-id-1',
      answered_correctly: true,
    });

    it('should successfully mark a question', async () => {
      const expectedResponse = mockQuizQuestion();

      jest
        .spyOn(quizQuestionService, 'markQuestion')
        .mockResolvedValue(expectedResponse);

      const result = await controller.markQuestion(roundId, markQuestionDto);

      expect(result).toEqual(expectedResponse);
      expect(quizQuestionService.markQuestion).toHaveBeenCalledWith(
        roundId,
        markQuestionDto.school_id,
        markQuestionDto.answered_correctly,
      );
    });

    it('should handle errors when marking a question', async () => {
      const errorMessage = 'Error marking question';

      jest
        .spyOn(quizQuestionService, 'markQuestion')
        .mockRejectedValue(new Error(errorMessage));

      try {
        await controller.markQuestion(roundId, markQuestionDto);
      } catch (error) {
        expect(error.message).toBe(errorMessage);
      }

      expect(quizQuestionService.markQuestion).toHaveBeenCalledWith(
        roundId,
        markQuestionDto.school_id,
        markQuestionDto.answered_correctly,
      );
    });
  });
});
