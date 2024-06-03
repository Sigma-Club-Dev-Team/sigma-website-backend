import {
  ConflictException,
  forwardRef,
  Inject,
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
import { QuizRoundService } from './quiz-round.service';
import { QuizRound } from '../entities/quiz-round.entity';
import { SchoolQuizRegistration } from '../entities/school-registration.entity';
import { SigmaQuizSchoolService } from './sigma-quiz-school.service';

@Injectable()
export class SigmaQuizService {
  constructor(
    @Inject(forwardRef(() => QuizRoundService))
    private readonly quizRoundService: QuizRoundService,
    @InjectRepository(SigmaQuiz)
    private readonly sigmaQuizRepo: Repository<SigmaQuiz>,
    @InjectRepository(SchoolQuizRegistration)
    private readonly schoolRegistrationRepo: Repository<SchoolQuizRegistration>,
    @Inject(forwardRef(() => SigmaQuizSchoolService))
    private readonly quizSchoolService: SigmaQuizSchoolService,
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
    const queryBuilder = this.sigmaQuizRepo
      .createQueryBuilder('quiz')
      .leftJoinAndSelect('quiz.rounds', 'rounds')
      .setFindOptions({ where: { id } });
    const sigmaQuiz = await queryBuilder.getOne();

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
    const quiz = await this.findOneById(id);
    if (!quiz) {
      throw new NotFoundException('SigmaQuiz does not exist!');
    }
    await this.sigmaQuizRepo.delete(id);
  }

  async fetchQuizRounds(quidId: string): Promise<QuizRound[]> {
    const quiz = await this.findOneById(quidId);
    const quizRounds = await this.quizRoundService.findAll({quiz: {id: quiz.id}});
    return quizRounds;
  }

  async registerSchoolForQuiz(quizId: string, schoolId: string) {
    try {
      const quiz = await this.findOneById(quizId);
      const school = await this.quizSchoolService.findOneById(schoolId);
      const schoolRegistration = {
        quizId,
        schoolId,
        school: school,
        quiz: quiz,
      };

      return await this.schoolRegistrationRepo.save(schoolRegistration);
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new ConflictException('School already registered for Quiz');
      }

      throw error;
    }
  }

  async fetchSchoolsRegisteredForQuiz(quizId: string) {
    const quiz = await this.findOneById(quizId);
    const schoolRegistrations = await this.schoolRegistrationRepo.findBy({quiz: {id: quiz.id}});

    return schoolRegistrations; 
  }
}
