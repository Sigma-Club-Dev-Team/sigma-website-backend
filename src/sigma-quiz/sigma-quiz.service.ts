import { ConflictException, Injectable } from '@nestjs/common';
import { CreateSigmaQuizDto } from './dto/create-sigma-quiz.dto';
import { UpdateSigmaQuizDto } from './dto/update-sigma-quiz.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SigmaQuiz } from './entities/sigma-quiz.entity';
import { Repository } from 'typeorm';
import { getYear } from 'date-fns';
import { PostgresErrorCode } from '../database/postgres-errorcodes.enum';

@Injectable()
export class SigmaQuizService {
  constructor(
    @InjectRepository(SigmaQuiz)
    private readonly sigmaQuizRepo: Repository<SigmaQuiz>,
  ) {}
  
  async create(createSigmaQuizDto: CreateSigmaQuizDto) {
    try {
      const sigmaQuiz = this.sigmaQuizRepo.create({
        ...createSigmaQuizDto,
        title:
          createSigmaQuizDto.title ??
          `${getYear(createSigmaQuizDto.date)} Sigma Quiz`,
        year: getYear(createSigmaQuizDto.date),
      });

      return await this.sigmaQuizRepo.save(sigmaQuiz);
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new ConflictException(
          error?.detail ?? 'Quiz with that date already exists',
        );
      }

      throw error;
    }
  }
}
