import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSigmaQuizDto } from '../dto/create-sigma-quiz.dto';
import { UpdateSigmaQuizDto } from '../dto/update-sigma-quiz.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SigmaQuiz } from '../entities/sigma-quiz.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { getYear } from 'date-fns';
import { PostgresErrorCode } from '../../database/postgres-errorcodes.enum';

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

  async findAll(
    whereClause?: FindOptionsWhere<SigmaQuiz> | FindOptionsWhere<SigmaQuiz>[],
  ): Promise<SigmaQuiz[]> {
    return await this.sigmaQuizRepo.find({ where: whereClause });
  }

  async findOneById(id: string): Promise<SigmaQuiz> {
    const sigmaQuiz = await this.sigmaQuizRepo.findOneBy({ id });
    if (!sigmaQuiz) {
      throw new NotFoundException('Sigma Quiz with this id does not exist');
    }
    return sigmaQuiz;
  }

  async update(id: string, updateSigmaQuizDto: UpdateSigmaQuizDto) {
    const quiz = await this.findOneById(id);

    const sigmaQuizUpdate = {
      ...quiz,
      ...updateSigmaQuizDto,
    };

    await this.sigmaQuizRepo.save(sigmaQuizUpdate);

    return await this.findOneById(quiz.id);
  }

  async remove(id: string) {
    const course = await this.findOneById(id);
    if (!course) {
      throw new NotFoundException('SigmaQuiz does not exist!');
    }
    await this.sigmaQuizRepo.delete(id);
  }
}
