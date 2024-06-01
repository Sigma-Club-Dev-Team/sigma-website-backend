import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../auth/decorators/role.decorator';
import { Role } from '../../constants/enums';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import RolesGuard from '../../auth/guards/role.guard';
import { QuizRoundService } from '../services/quiz-round.service';
import { CreateQuizRoundDto } from '../dto/create-quiz-round.dto';

@Controller('sigma-quiz/rounds')
export class QuizRoundController {
  constructor(
    private readonly quizRoundService: QuizRoundService,
  ) {}

  @Roles(Role.SuperAdmin, Role.QuizMaster, Role.Adhoc)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() createQuizRoundDto: CreateQuizRoundDto) {
    return this.quizRoundService.create(createQuizRoundDto);
  }

}