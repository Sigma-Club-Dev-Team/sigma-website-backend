import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { QuizQuestionService } from '../services/quiz-question.service';
import { Roles } from '../../auth/decorators/role.decorator';
import { Role } from '../../constants/enums';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import RolesGuard from '../../auth/guards/role.guard';
import { MarkQuestionDto } from '../dto/mark-question.dto';

@Controller('sigma-quiz/questions')
export class QuizQuestionController {
  constructor(private readonly quizQuestionService: QuizQuestionService) {}

  @Roles(Role.SuperAdmin, Role.QuizMaster)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id/mark')
  markQuestion(
    @Param('id', new ParseUUIDPipe()) roundId: string,
    @Body() markQuestionDto: MarkQuestionDto,
  ) {
    return this.quizQuestionService.markQuestion(
      roundId,
      markQuestionDto.school_id,
      markQuestionDto.answered_correctly,
    );
  }
}
