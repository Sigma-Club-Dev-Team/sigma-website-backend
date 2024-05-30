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
  Query,
  Req,
} from '@nestjs/common';
import { SigmaQuizSchoolService } from '../services/sigma-quiz-school.service';
import { CreateSigmaQuizSchoolDto } from '../dto/create-sigma-quiz-school.dto';
import { UpdateSigmaQuizSchoolDto } from '../dto/update-sigma-quiz-school.dto';
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

  @Get()
  findAll() {
    return this.sigmaQuizSchoolService.findAll();
  }

  @Get('/search')
  async search(@Query('name') searchText: string) {
    return await this.sigmaQuizSchoolService.search(searchText);
  }

  @Get(':id')
  findSigmaQuizById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.sigmaQuizSchoolService.findOneById(id);
  }

  @Roles(Role.SuperAdmin, Role.QuizMaster, Role.Adhoc)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateSigmaQuizSchoolDto: UpdateSigmaQuizSchoolDto,
  ) {
    return this.sigmaQuizSchoolService.update(id, updateSigmaQuizSchoolDto);
  }

  @Roles(Role.SuperAdmin, Role.QuizMaster, Role.Adhoc)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.sigmaQuizSchoolService.remove(id);
    return {
      message: 'Successful',
    };
  }
}
