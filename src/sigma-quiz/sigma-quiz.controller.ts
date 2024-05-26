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
import { SigmaQuizService } from './sigma-quiz.service';
import { CreateSigmaQuizDto } from './dto/create-sigma-quiz.dto';
import { UpdateSigmaQuizDto } from './dto/update-sigma-quiz.dto';
import { Roles } from '../auth/decorators/role.decorator';
import { Role } from '../constants/enums';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import RolesGuard from '../auth/guards/role.guard';

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

  @Roles(Role.SuperAdmin, Role.QuizMaster)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateSigmaQuizDto: UpdateSigmaQuizDto,
  ) {
    return this.sigmaQuizService.update(id, updateSigmaQuizDto);
  }
}
