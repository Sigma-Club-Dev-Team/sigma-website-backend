import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, EntityManager, FindOptionsWhere, Repository } from 'typeorm';
import { QuizRound } from '../entities/quiz-round.entity';
import { QuizQuestion } from '../entities/quiz-question.entity';
import { QuizRoundService } from './quiz-round.service';

@Injectable()
export class QuizQuestionService {
  constructor(
    @InjectRepository(QuizQuestion)
    private readonly quizQuestionRepo: Repository<QuizQuestion>,
    @Inject(forwardRef(() => QuizRoundService))
    private readonly quizRoundService: QuizRoundService,
  ) {}

  async findAll(
    whereClause?:
      | FindOptionsWhere<QuizQuestion>
      | FindOptionsWhere<QuizQuestion>[],
  ): Promise<QuizQuestion[]> {
    return await this.quizQuestionRepo.find({ where: whereClause });
  }

  async findOneById(id: string): Promise<QuizQuestion> {
    const quizQuestion = await this.quizQuestionRepo.findOne({
      where: { id },
      relations: {
        answered_by: {
          schoolRegistration: true,
        },
      },
    });
    if (!quizQuestion) {
      throw new NotFoundException('Quiz Question with this id does not exist');
    }
    return quizQuestion;
  }

  async createRoundQuestions(round: QuizRound, transaction: EntityManager) {
    const questions: QuizQuestion[] = [];
    for (
      let questionNumber = 1;
      questionNumber <= round.no_of_questions;
      questionNumber++
    ) {
      questions.push(
        this.quizQuestionRepo.create({
          question_number: questionNumber,
          roundId: round.id,
          round: round,
        }),
      );
    }

    await transaction.save<QuizQuestion, any>(QuizQuestion, questions);
  }

  async updateRoundQuestions(round: QuizRound, transaction: EntityManager) {
    const lastQuestion = (
      await this.quizQuestionRepo.find({
        where: {
          round: { id: round.id },
        },
        order: {
          question_number: 'DESC',
        },
      })
    )[0];

    let lastQuesNum = lastQuestion?.question_number ?? 0;

    if (lastQuesNum === round.no_of_questions) {
      return;
    } else if (lastQuesNum < round.no_of_questions) {
      const questions: QuizQuestion[] = [];
      for (
        let quesNo = lastQuesNum + 1;
        quesNo <= round.no_of_questions;
        quesNo++
      ) {
        questions.push(
          this.quizQuestionRepo.create({
            question_number: quesNo,
            roundId: round.id,
            round: round,
          }),
        );
      }
      await transaction.save<QuizQuestion, any>(QuizQuestion, questions);
    } else if (lastQuesNum > round.no_of_questions) {
      await transaction.delete<QuizQuestion>(QuizQuestion, {
        question_number: Between(round.no_of_questions + 1, lastQuesNum),
      });
    }
  }

  async markQuestion(
    questionId: string,
    schoolId: string,
    answered_correctly: boolean,
  ) {
    const question = await this.findOneById(questionId);

    const roundParticipation =
      await this.quizRoundService.fetchSchoolParticipationForQuizRound(
        question.roundId,
        schoolId,
      );

    /** Check if Question already marked as answered by another school*/
    if (
      question.answered_by &&
      question.answered_by.id !== roundParticipation.id
    ) {
      throw new ConflictException(
        `Question already marked as Answered by ${
          question.answered_by?.schoolRegistration?.school?.name ??
          'Another School'
        }`,
      );
    }

    question.answered_by = roundParticipation;
    question.answered_correctly = answered_correctly;
    await this.quizQuestionRepo.save(question);
    return await this.findOneById(questionId);
  }

  async assignBonusQuestion(questionId: string, schoolId: string) {
    const question = await this.findOneById(questionId);

    const roundParticipation =
      await this.quizRoundService.fetchSchoolParticipationForQuizRound(
        question.roundId,
        schoolId,
      );

    /** Check if Question already marked as answered */
    if (!question.answered_by) {
      throw new ConflictException(
        `Can't assign bonus question except marked as answered incorrectly by another school`,
      );
    }

    /** Check if Question already marked as answered */
    if (question.answered_by) {
      // cant assign bonus question to the same school that selected it
      if (question.answered_by.id === roundParticipation.id) {
        throw new ConflictException(
          `Can not assign bonus question. Question already marked as Answered by This School`,
        );
      }

      // can't assign bonus question if answered correctly by another school
      if (
        question.answered_by.id !== roundParticipation.id &&
        question.answered_correctly === true
      ) {
        throw new ConflictException(
          `Can not assign bonus question. Question already marked as Answered correctly by ${
            question.answered_by?.schoolRegistration?.school?.name ??
            'Another School'
          }`,
        );
      }
    }

    /** Check if Question already assigned as bonus as bonus to another */
    if (question.bonus_to && question.bonus_to.id !== roundParticipation.id) {
      throw new ConflictException(
        `Bonus Question already assigned to ${
          question.answered_by?.schoolRegistration?.school?.name ??
          'Another School'
        }`,
      );
    }

    question.bonus_to = roundParticipation;
    await this.quizQuestionRepo.save(question);
    return await this.findOneById(questionId);
  }
}
