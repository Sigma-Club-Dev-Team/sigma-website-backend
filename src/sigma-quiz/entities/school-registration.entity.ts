import { CustomBaseEntity } from '../../database/base.entity';
import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { SigmaQuiz } from './sigma-quiz.entity';
import { SigmaQuizSchool } from './sigma-quiz-school.entity';
import { IsUUID } from 'class-validator';

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

  @ManyToOne(() => SigmaQuiz, (quiz) => quiz.studentsRegistrations, {
    eager: true,
    onDelete: 'CASCADE',
  })
  public quiz: SigmaQuiz;

  @ManyToOne(() => SigmaQuizSchool, {
    eager: true,
    onDelete: 'CASCADE',
  })
  public school: SigmaQuizSchool;
}