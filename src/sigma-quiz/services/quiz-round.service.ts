import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { PostgresErrorCode } from '../../database/postgres-errorcodes.enum';
import { QuizRound } from '../entities/quiz-round.entity';
import { CreateQuizRoundDto } from '../dto/create-quiz-round.dto';
import { SigmaQuizService } from './sigma-quiz.service';
import { UpdateQuizRoundDto } from '../dto/update-quiz-round.dto';
import { SchoolRoundParticipation } from '../entities/school-round-participation.entity';
import { QuizQuestionService } from './quiz-question.service';

@Injectable()
export class QuizRoundService {
  constructor(
    @InjectRepository(QuizRound)
    private readonly quizRoundRepo: Repository<QuizRound>,
    @InjectRepository(SchoolRoundParticipation)
    private readonly roundParticipationRepo: Repository<SchoolRoundParticipation>,
    @Inject(forwardRef(() => SigmaQuizService))
    private readonly sigmaQuizService: SigmaQuizService,
    @Inject(forwardRef(() => QuizQuestionService))
    private readonly quizQuestionService: QuizQuestionService,
    private dataSource: DataSource,
  ) {}

  async create(createQuizRoundDto: CreateQuizRoundDto) {
    try {
      const quiz = await this.sigmaQuizService.findOneById(
        createQuizRoundDto.quizId,
      );

      let quizRound = this.quizRoundRepo.create(createQuizRoundDto);

      quizRound.quiz = quiz;

      await this.dataSource.transaction(async (transactionManager) => {
        quizRound = await transactionManager.save<QuizRound>(quizRound);

        await this.quizQuestionService.createRoundQuestions(quizRound, transactionManager);
      });

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

  async findAll(
    whereClause?: FindOptionsWhere<QuizRound> | FindOptionsWhere<QuizRound>[],
  ): Promise<QuizRound[]> {
    return await this.quizRoundRepo.find({ where: whereClause });
  }

  async findOneById(id: string): Promise<QuizRound> {
    const quizRound = await this.quizRoundRepo.findOneBy({ id });
    if (!quizRound) {
      throw new NotFoundException('Quiz Round with this id does not exist');
    }
    return quizRound;
  }

  async update(id: string, updateQuizRoundDto: UpdateQuizRoundDto) {
    try {
      let quizRound = await this.findOneById(id);

    const quizRoundUpdate = Object.assign(quizRound, updateQuizRoundDto);

    await this.dataSource.transaction(async (transactionManager) => {
      quizRound = await transactionManager.save<QuizRound>(quizRoundUpdate);

      await this.quizQuestionService.updateRoundQuestions(
        quizRound,
        transactionManager,
      );
    });

    return await this.findOneById(quizRound.id);
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new ConflictException(
          'Quiz Round number already exists',
        );
      }

      throw error;
    }
  }

  async remove(id: string) {
    const quizRound = await this.findOneById(id);
    if (!quizRound) {
      throw new NotFoundException('QuizRound does not exist!');
    }
    await this.quizRoundRepo.delete(id);
  }

  async addSchoolParticipationInRound(roundId: string, schoolId: string) {
    try {
      const quizRound = await this.findOneById(roundId);
      const schoolRegistration =
        await this.sigmaQuizService.fetchSchoolRegisterationForQuiz(
          quizRound.quizId,
          schoolId,
        );
      const schoolRoundParticipation = {
        roundId,
        schoolRegistrationId: schoolRegistration.id,
        schoolRegistration,
        round: quizRound,
      };

      return await this.roundParticipationRepo.save(schoolRoundParticipation);
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new ConflictException(
          'School already Participating In Quiz Round',
        );
      }

      throw error;
    }
  }

  async fetchParticipatingSchools(roundId: string) {
    const round = await this.findOneById(roundId);
    const participatingSchools = await this.roundParticipationRepo.find({
      where: { round: { id: round.id } },
      relations: {
        schoolRegistration: true,
      },
    });

    return participatingSchools;
  }

  async removeSchoolFromQuizRound(roundId: string, schoolId) {
    const quizRound = await this.findOneById(roundId);
    const schoolRegistration =
      await this.sigmaQuizService.fetchSchoolRegisterationForQuiz(
        quizRound.quizId,
        schoolId,
      );
    const schoolParticipation = await this.roundParticipationRepo.findOneBy({
      round: { id: quizRound.id },
      schoolRegistration: { id: schoolRegistration.id },
    });
    if (!schoolParticipation) {
      throw new NotFoundException('School is not part of this Quiz Round');
    }

    await this.roundParticipationRepo.remove(schoolParticipation);
    return this.fetchParticipatingSchools(quizRound.id);
  }
}
