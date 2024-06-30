import { IsNotEmpty, IsPositive, IsUUID } from 'class-validator';
import { CustomBaseEntity } from '../../database/base.entity';
import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { SchoolRoundParticipation } from './school-round-participation.entity';
import { QuizRound } from './quiz-round.entity';

@Entity()
@Unique('unique-round-question', ['roundId', 'question_number'])
export class QuizQuestion extends CustomBaseEntity {
  @Column()
  @IsUUID()
  public roundId: string;

  @ManyToOne(() => QuizRound, (round) => round.questions, {
    onDelete: 'CASCADE',
  })
  round: QuizRound;

  @Column()
  @IsPositive()
  /** specifies if this is the 1st, 2nd and so question in a round. or the order */
  question_number: number;

  @ManyToOne(() => SchoolRoundParticipation, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  public answered_by?: SchoolRoundParticipation;

  @Column({ nullable: true })
  @IsNotEmpty()
  answered_correctly?: boolean;

  @ManyToOne(() => SchoolRoundParticipation, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  public bonus_to?: SchoolRoundParticipation;
}
