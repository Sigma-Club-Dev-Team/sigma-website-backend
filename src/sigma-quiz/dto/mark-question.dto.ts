import { IsBoolean, IsUUID } from 'class-validator';

export class MarkQuestionDto {
  @IsUUID()
  public school_id: string;

  @IsBoolean()
  public answered_correctly: boolean;
}
