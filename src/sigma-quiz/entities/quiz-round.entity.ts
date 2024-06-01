import { IsDefined, IsNotEmpty, IsPositive, IsUUID } from 'class-validator';
import { CustomBaseEntity } from '../../database/base.entity';
import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { SigmaQuiz } from './sigma-quiz.entity';
import { IsValidNumberOfQuestions } from '../decorators/is-valid-number-of-school';

@Entity()
@Unique('unique-quiz-round', ['quizId', 'round_number'])
export class QuizRound extends CustomBaseEntity {
  @Column()
  @IsUUID()
  public quizId: string;

  @IsDefined()
  @ManyToOne(() => SigmaQuiz, (user) => user.rounds)
  quiz: SigmaQuiz;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column()
  @IsPositive()
  /** specifies if this is the 1st, 2nd and so round. or the order */
  round_number: number;

  @Column()
  @IsPositive()
  @IsValidNumberOfQuestions()
  no_of_questions: number;

  @Column()
  @IsPositive()
  no_of_schools: number;

  @Column()
  @IsPositive()
  marks_per_question: number;

  @Column()
  @IsPositive()
  marks_per_bonus_question: number;
}