import { Module } from '@nestjs/common';
import { SigmaQuizService } from './services/sigma-quiz.service';
import { SigmaQuizController } from './controllers/sigma-quiz.controller';
import { SigmaQuiz } from './entities/sigma-quiz.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SigmaQuizSchoolService } from './services/sigma-quiz-school.service';
import { SigmaQuizSchool } from './entities/sigma-quiz-school.entity';
import { SigmaQuizSchoolController } from './controllers/sigma-quiz-school.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SigmaQuiz, SigmaQuizSchool])],
  controllers: [SigmaQuizController, SigmaQuizSchoolController],
  providers: [SigmaQuizService, SigmaQuizSchoolService],
})
export class SigmaQuizModule {}
