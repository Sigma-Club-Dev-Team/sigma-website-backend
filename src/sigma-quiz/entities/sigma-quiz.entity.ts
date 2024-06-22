import { IsDateString, IsNotEmpty, IsOptional } from 'class-validator';
import { CustomBaseEntity } from '../../database/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { QuizRound } from './quiz-round.entity';
import { SchoolQuizRegistration } from './school-registration.entity';

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

  @OneToMany(() => QuizRound, (photo) => photo.quiz)
  rounds: QuizRound[];

  @OneToMany(
    () => SchoolQuizRegistration,
    (schoolRegistration) => schoolRegistration.quiz,
    { cascade: ['update', 'remove'] },
  )
  public schoolRegistrations: SchoolQuizRegistration[];
}
