import { IsDateString, IsNotEmpty, IsOptional } from 'class-validator';
import { CustomBaseEntity } from '../../database/base.entity';
import { Column, Entity } from 'typeorm';

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

  @Column({nullable: true})
  @IsOptional()
  @IsNotEmpty()
  description?: string;

  @Column({ type: 'date', unique: true })
  @IsDateString()
  date: Date;
}