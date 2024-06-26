import { IsNotEmpty, IsPositive, IsUUID, Min } from 'class-validator';
import { CustomBaseEntity } from '../../database/base.entity';
import { Column, Entity, ManyToOne, OneToMany, Unique } from 'typeorm';
import { SigmaQuiz } from './sigma-quiz.entity';
import { IsValidNumberOfQuestions } from '../decorators/is-valid-number-of-school';
import { SchoolRoundParticipation } from './school-round-participation.entity';
import { QuizQuestion } from './quiz-question.entity';

@Entity()
@Unique('unique-quiz-round', ['quizId', 'round_number'])
export class QuizRound extends CustomBaseEntity {
  constructor(partial: Partial<QuizRound>) {
    super();
    Object.assign(this, partial);
  }

  @Column()
  @IsUUID()
  public quizId: string;

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
  @Min(0)
  marks_per_bonus_question: number;

  @OneToMany(
    () => SchoolRoundParticipation,
    (schoolParticipation) => schoolParticipation.round,
    { 
      cascade: ["update", "remove"] },
  )
  public schoolParticipations: SchoolRoundParticipation[];

  @OneToMany(() => QuizQuestion, (quiz_question) => quiz_question.round, {
  })
  public questions: QuizQuestion[];
}
