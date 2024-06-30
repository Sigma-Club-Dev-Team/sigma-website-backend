import { CustomBaseEntity } from '../../database/base.entity';
import { Column, Entity, ManyToOne, OneToMany, Unique } from 'typeorm';
import { SigmaQuiz } from './sigma-quiz.entity';
import { SigmaQuizSchool } from './sigma-quiz-school.entity';
import { IsUUID } from 'class-validator';
import { SchoolRoundParticipation } from './school-round-participation.entity';

@Entity()
@Unique('unique-quiz-school', ['quizId', 'schoolId'])
export class SchoolQuizRegistration extends CustomBaseEntity {
  constructor(partial: Partial<SchoolQuizRegistration>) {
    super();
    Object.assign(this, partial);
  }

  @Column()
  @IsUUID()
  public quizId: string;

  @Column()
  @IsUUID()
  public schoolId: string;

  @ManyToOne(() => SigmaQuiz, (quiz) => quiz.schoolRegistrations, {
    onDelete: 'CASCADE',
  })
  public quiz: SigmaQuiz;

  @ManyToOne(() => SigmaQuizSchool, {
    onDelete: 'CASCADE',
  })
  public school: SigmaQuizSchool;

  @OneToMany(
    () => SchoolRoundParticipation,
    (schoolParticipation) => schoolParticipation.schoolRegistration,
  )
  public rounds: SchoolRoundParticipation[];

  @Column({ default: 0 })
  public score: number;

  @Column({ default: 0 })
  public position: number;
}
