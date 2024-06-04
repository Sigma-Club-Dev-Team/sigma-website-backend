import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Delete,
} from '@nestjs/common';
import { Roles } from '../../auth/decorators/role.decorator';
import { Role } from '../../constants/enums';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import RolesGuard from '../../auth/guards/role.guard';
import { QuizRoundService } from '../services/quiz-round.service';
import { CreateQuizRoundDto } from '../dto/create-quiz-round.dto';
import { UpdateQuizRoundDto } from '../dto/update-quiz-round.dto';
import { RegisterSchoolForQuizDto } from '../dto/register-school-gor-quiz-dto';

@Controller('sigma-quiz/rounds')
export class QuizRoundController {
  constructor(private readonly quizRoundService: QuizRoundService) {}

  @Roles(Role.SuperAdmin, Role.QuizMaster, Role.Adhoc)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() createQuizRoundDto: CreateQuizRoundDto) {
    return this.quizRoundService.create(createQuizRoundDto);
  }

  @Get(':id')
  findQuizRoundById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.quizRoundService.findOneById(id);
  }

  @Roles(Role.SuperAdmin, Role.QuizMaster)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateQuizRoundDtoDto: UpdateQuizRoundDto,
  ) {
    return this.quizRoundService.update(id, updateQuizRoundDtoDto);
  }

  @Roles(Role.SuperAdmin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.quizRoundService.remove(id);
    return {
      message: 'Successful',
    };
  }

  @Roles(Role.SuperAdmin, Role.QuizMaster, Role.Adhoc)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/schools')
  registerSchoolForRound(
    @Param('id', new ParseUUIDPipe()) roundId: string,
    @Body() registerSchForRoundDto: RegisterSchoolForQuizDto,
  ) {
    return this.quizRoundService.addSchoolParticipationInRound(
      roundId,
      registerSchForRoundDto.school_id,
    );
  }

  @Get(':id/schools')
  fetchParticipatingSchools(@Param('id', new ParseUUIDPipe()) roundId: string) {
    return this.quizRoundService.fetchParticipatingSchools(roundId);
  }

  @Roles(Role.SuperAdmin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':roundId/schools/:schoolId')
  async removeSchoolFromRound(
    @Param('roundId', new ParseUUIDPipe()) roundId: string,
    @Param('schoolId', new ParseUUIDPipe()) schoolId: string,
  ) {
    const remainingSchools =
      await this.quizRoundService.removeSchoolFromQuizRound(roundId, schoolId);
    return {
      message: 'Successful',
      participating_schools: remainingSchools,
    };
  }
}               