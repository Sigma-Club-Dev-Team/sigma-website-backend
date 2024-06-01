import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostgresErrorCode } from '../../database/postgres-errorcodes.enum';
import { QuizRound } from '../entities/quiz-round.entity';
import { CreateQuizRoundDto } from '../dto/create-quiz-round.dto';
import { SigmaQuizService } from './sigma-quiz.service';

@Injectable()
export class QuizRoundService {
  constructor(
    @InjectRepository(QuizRound)
    private readonly quizRoundRepo: Repository<QuizRound>,
    private readonly sigmaQuizService: SigmaQuizService
  ) {}

  async create(createQuizRoundDto: CreateQuizRoundDto) {
    try {
        const quiz = await this.sigmaQuizService.findOneById(createQuizRoundDto.quizId);
      const quizRound = this.quizRoundRepo.create(createQuizRoundDto);

      quizRound.quiz = quiz;

      return await this.quizRoundRepo.save(quizRound);
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new ConflictException(
          error?.detail ?? 'Quiz Round number already exists',
        );
      }

      throw error;
    }
  }
}
