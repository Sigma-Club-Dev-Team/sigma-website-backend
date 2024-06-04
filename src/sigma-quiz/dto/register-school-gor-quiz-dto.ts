import { IsUUID } from 'class-validator';

export class RegisterSchoolForQuizDto {
  @IsUUID()
  public school_id: string;
}
