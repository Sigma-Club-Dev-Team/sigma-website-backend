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
import { FindOptionsRelations, FindOptionsWhere, Repository } from 'typeorm';
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

  async findOneById(
    id: string,
    relations?: FindOptionsRelations<SigmaQuiz>,
  ): Promise<SigmaQuiz> {
    const sigmaQuiz = await this.sigmaQuizRepo.findOne({
      where: { id },
      relations: {
        rounds: true,
        ...relations,
      },
    });

    if (!sigmaQuiz) {
      throw new NotFoundException('Sigma Quiz with this id does not exist');
    }
    return sigmaQuiz;
  }

  async update(id: string, updateSigmaQuizDto: UpdateSigmaQuizDto) {
    try {
      const quiz = await this.findOneById(id);

      const sigmaQuizUpdate = {
        ...quiz,
        ...updateSigmaQuizDto,
      };

      await this.sigmaQuizRepo.save(sigmaQuizUpdate);

      return await this.findOneById(quiz.id);
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new ConflictException(
          error?.detail ?? 'Quiz with that date already exists',
        );
      }

      throw error;
    }
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
    const quizRounds = await this.quizRoundService.findAll({
      quiz: { id: quiz.id },
    });
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
    const schoolRegistrations = await this.schoolRegistrationRepo.findBy({
      quiz: { id: quiz.id },
    });

    return schoolRegistrations;
  }

  async unregisterSchoolForQuiz(quizId: string, schoolId) {
    const quiz = await this.findOneById(quizId);
    const school = await this.quizSchoolService.findOneById(schoolId);
    const schoolRegistration = await this.schoolRegistrationRepo.findOneBy({
      quiz: { id: quiz.id },
      school: { id: school.id },
    });
    if (!schoolRegistration) {
      throw new NotFoundException('School is not registered for Quiz');
    }

    await this.schoolRegistrationRepo.remove(schoolRegistration);
    return this.fetchSchoolsRegisteredForQuiz(quiz.id);
  }

  async fetchSchoolRegisterationForQuiz(quizId: string, schoolId: string) {
    const quiz = await this.findOneById(quizId);
    const school = await this.quizSchoolService.findOneById(schoolId);
    const schoolRegistration = await this.schoolRegistrationRepo.findOneBy({
      quiz: { id: quiz.id },
      school: { id: school.id },
    });

    if (!schoolRegistration) {
      throw new NotFoundException('School Not Registered for Quiz');
    }

    return schoolRegistration;
  }

  async fetchResults(quizId: string) {
    const quiz = await this.findOneById(quizId, {
      schoolRegistrations: {
        rounds: {
          answered_questions: true,
          bonus_questions: true,
        },
      },
      rounds: {
        schoolParticipations: {
          answered_questions: true,
          bonus_questions: true,
        },
        questions: {
          answered_by: { schoolRegistration: true },
          bonus_to: { schoolRegistration: true },
        },
      },
    });

    return quiz;
  }

  async computeQuizScores(quizId: string) {
    const quiz = await this.findOneById(quizId, {
      schoolRegistrations: {
        rounds: true
      },
    });
    for (let school of quiz.schoolRegistrations) {
      let schoolScore = 0;
      for (let round of school.rounds) {
        schoolScore += round.score;
      }
      school.score = schoolScore;
    }

    quiz.schoolRegistrations.sort((a, b) => b.score - a.score);
    quiz.schoolRegistrations.forEach((roundPart, idx) => {
      roundPart.position = idx + 1;
    });
    await this.sigmaQuizRepo.save(quiz);
    return await this.fetchResults(quizId);
  }
}
