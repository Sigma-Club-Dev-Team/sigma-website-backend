import {
  ArrayNotEmpty,
  ArrayUnique,
  IsEmail,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { Role } from '../../constants/enums';
import { Entity, Column } from 'typeorm';
import { Exclude } from 'class-transformer';
import { IsCustomStrongPassword } from '../strong-password.decorator';
import { CustomBaseEntity } from '../../database/base.entity';

@Entity()
export class User extends CustomBaseEntity {
  constructor(partial: Partial<User>) {
    super();
    Object.assign(this, partial);
  }

  @Column()
  @IsNotEmpty()
  first_name: string;

  @Column()
  @IsNotEmpty()
  last_name: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column()
  @IsNotEmpty()
  @IsCustomStrongPassword()
  @Exclude()
  password: string;

  @Column({ type: 'enum', enum: Role, array: true, default: [Role.Adhoc] })
  @ArrayUnique()
  @ArrayNotEmpty()
  @IsEnum(Role, { each: true })
  roles: Role[];
}
