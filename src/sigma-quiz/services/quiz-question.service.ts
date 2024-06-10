import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, EntityManager, Repository } from 'typeorm';
import { QuizRound } from '../entities/quiz-round.entity';
import { QuizQuestion } from '../entities/quiz-question.entity';

@Injectable()
export class QuizQuestionService {
  constructor(
    @InjectRepository(QuizQuestion)
    private readonly quizQuestionRepo: Repository<QuizQuestion>,
  ) {}

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
        question_number: Between(round.no_of_questions+1, lastQuesNum),
      });
    }
  }
}
