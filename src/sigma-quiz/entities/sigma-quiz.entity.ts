import { IsDateString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { CustomBaseEntity } from '../../database/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { QuizRound } from './quiz-round.entity';
import { SchoolQuizRegistration } from './school-registration.entity';
import { QuizStatus } from '../../constants/enums';

@Entity()
export class SigmaQuiz extends CustomBaseEntity {
  constructor(partial: Partial<SigmaQuiz>) {
    super();
    Object.assign(this, partial);
  }

  @Column()
  @IsNotEmpty()
  year: number;

  @Column()
  @IsOptional()
  @IsNotEmpty()
  title: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsNotEmpty()
  description?: string;

  @Column({ type: 'date', unique: true })
  @IsDateString()
  date: Date;

  @Column({type: "enum", enum: QuizStatus, default: QuizStatus.Pending})
  @IsEnum(QuizStatus)
  status: QuizStatus

  @OneToMany(() => QuizRound, (photo) => photo.quiz)
  rounds: QuizRound[];

  @OneToMany(
    () => SchoolQuizRegistration,
    (schoolRegistration) => schoolRegistration.quiz,
    { cascade: ['update', 'remove'] },
  )
  public schoolRegistrations: SchoolQuizRegistration[];
}
