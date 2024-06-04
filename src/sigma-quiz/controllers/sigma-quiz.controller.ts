import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import { SigmaQuizService } from '../services/sigma-quiz.service';
import { CreateSigmaQuizDto } from '../dto/create-sigma-quiz.dto';
import { UpdateSigmaQuizDto } from '../dto/update-sigma-quiz.dto';
import { Roles } from '../../auth/decorators/role.decorator';
import { Role } from '../../constants/enums';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import RolesGuard from '../../auth/guards/role.guard';
import { RegisterSchoolForQuizDto } from '../dto/register-school-gor-quiz-dto';

@Controller('sigma-quiz')
export class SigmaQuizController {
  constructor(private readonly sigmaQuizService: SigmaQuizService) {}

  @Roles(Role.SuperAdmin, Role.QuizMaster)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() createSigmaQuizDto: CreateSigmaQuizDto) {
    return this.sigmaQuizService.create(createSigmaQuizDto);
  }

  @Get()
  findAll() {
    return this.sigmaQuizService.findAll();
  }

  @Get(':id')
  findSigmaQuizById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.sigmaQuizService.findOneById(id);
  }

  @Get(':id/rounds')
  fetchQuizRounds(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.sigmaQuizService.fetchQuizRounds(id);
  }

  @Roles(Role.SuperAdmin, Role.QuizMaster)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateSigmaQuizDto: UpdateSigmaQuizDto,
  ) {
    return this.sigmaQuizService.update(id, updateSigmaQuizDto);
  }

  @Roles(Role.SuperAdmin, Role.QuizMaster)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.sigmaQuizService.remove(id);
    return {
      message: 'Successful',
    };
  }

  @Roles(Role.SuperAdmin, Role.QuizMaster, Role.Adhoc)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/schools')
  registerSchoolForQuiz(
    @Param('id', new ParseUUIDPipe()) quizId: string,
    @Body() registerSchForQuizDto: RegisterSchoolForQuizDto,
  ) {
    return this.sigmaQuizService.registerSchoolForQuiz(
      quizId,
      registerSchForQuizDto.school_id,
    );
  }

  @Get(':id/schools')
  fetchSchoolsRegisteredForQuiz(
    @Param('id', new ParseUUIDPipe()) quizId: string,
  ) {
    return this.sigmaQuizService.fetchSchoolsRegisteredForQuiz(quizId);
  }

  @Delete(':quizId/schools/:schoolId')
  async unregisterSchoolFromQuiz(
    @Param('quizId', new ParseUUIDPipe()) quizId: string,
    @Param('schoolId', new ParseUUIDPipe()) schoolId: string,
  ) {
    const remainingRegisteredSchools =
      await this.sigmaQuizService.unregisterSchoolForQuiz(quizId, schoolId);
    return {
      message: 'Successful',
      registered_schools: remainingRegisteredSchools,
    };
  }
}
