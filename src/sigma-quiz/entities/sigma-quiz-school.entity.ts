import { IsNotEmpty, IsOptional } from 'class-validator';
import { CustomBaseEntity } from '../../database/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class SigmaQuizSchool extends CustomBaseEntity {
    @Column()
    @IsNotEmpty()
    name: string;

    @Column()
    @IsNotEmpty()
    state: string;

    @Column({nullable: true})
    @IsOptional()
    @IsNotEmpty()
    address?: string;
}
