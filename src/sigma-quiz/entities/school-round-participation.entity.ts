import { CustomBaseEntity } from '../../database/base.entity';
import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { IsUUID } from 'class-validator';
import { SchoolQuizRegistration } from './school-registration.entity';
import { QuizRound } from './quiz-round.entity';

@Entity()
@Unique('unique-round-participation', ['roundId', 'schoolRegistrationId'])
export class SchoolRoundParticipation extends CustomBaseEntity {
  constructor(partial: Partial<SchoolRoundParticipation>) {
    super();
    Object.assign(this, partial);
  }

  @Column()
  @IsUUID()
  public roundId: string;

  @Column()
  @IsUUID()
  /// the record of the school registration for the quiz
  public schoolRegistrationId: string;

  @ManyToOne(() => QuizRound, (round) => round.schoolParticipations, {
    onDelete: 'CASCADE',
  })
  public round: QuizRound;

  @ManyToOne(() => SchoolQuizRegistration, {
    onDelete: 'CASCADE',
  })
  public schoolRegistration: SchoolQuizRegistration;
}