import {
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  Repository,
} from 'typeorm';
import { QuizRound } from '../entities/quiz-round.entity';
import { QuizQuestion } from '../entities/quiz-question.entity';

@Injectable()
export class QuizQuestionService {
  constructor(
    @InjectRepository(QuizQuestion)
    private readonly quizRoundRepo: Repository<QuizQuestion>,
  ) {}

  async createRoundQuestions(round: QuizRound, transaction: EntityManager) {
    const questions: QuizQuestion[] = [];
    for (let questionNumber = 1; questionNumber <= round.no_of_questions; questionNumber++) {
      questions.push(
        this.quizRoundRepo.create({
          question_number: questionNumber,
          roundId: round.id,
          round: round,
        }),
      );
    }

    await transaction.save<QuizQuestion, any>(QuizQuestion, questions);
  }
}
