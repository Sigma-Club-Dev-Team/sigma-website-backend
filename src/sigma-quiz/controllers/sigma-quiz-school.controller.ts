import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SigmaQuizSchoolService } from '../services/sigma-quiz-school.service';
import { CreateSigmaQuizSchoolDto } from '../dto/create-sigma-quiz-school.dto';
import { Roles } from '../../auth/decorators/role.decorator';
import { Role } from '../../constants/enums';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import RolesGuard from '../../auth/guards/role.guard';

@Controller('sigma-quiz/school')
export class SigmaQuizSchoolController {
  constructor(
    private readonly sigmaQuizSchoolService: SigmaQuizSchoolService,
  ) {}

  @Roles(Role.SuperAdmin, Role.QuizMaster, Role.Adhoc)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() createSigmaQuizSchoolDto: CreateSigmaQuizSchoolDto) {
    return this.sigmaQuizSchoolService.create(createSigmaQuizSchoolDto);
  }

}
