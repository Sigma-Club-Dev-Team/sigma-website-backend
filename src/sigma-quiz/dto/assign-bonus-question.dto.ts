import { IsUUID } from 'class-validator';

export class AssignBonusQuestionDto {
  @IsUUID()
  public school_id: string;
}
