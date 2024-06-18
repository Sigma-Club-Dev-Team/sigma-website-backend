import { Module } from '@nestjs/common';
import { SigmaQuizService } from './services/sigma-quiz.service';
import { SigmaQuizController } from './controllers/sigma-quiz.controller';
import { SigmaQuiz } from './entities/sigma-quiz.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SigmaQuizSchoolService } from './services/sigma-quiz-school.service';
import { SigmaQuizSchool } from './entities/sigma-quiz-school.entity';
import { SigmaQuizSchoolController } from './controllers/sigma-quiz-school.controller';
import { QuizRound } from './entities/quiz-round.entity';
import { QuizRoundController } from './controllers/quiz-round.controller';
import { QuizRoundService } from './services/quiz-round.service';
import { SchoolQuizRegistration } from './entities/school-registration.entity';
import { SchoolRoundParticipation } from './entities/school-round-participation.entity';
import { QuizQuestion } from './entities/quiz-question.entity';
import { QuizQuestionService } from './services/quiz-question.service';
import { QuizQuestionController } from './controllers/quiz-question.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SigmaQuiz,
      SigmaQuizSchool,
      QuizRound,
      SchoolQuizRegistration,
      SchoolRoundParticipation,
      QuizQuestion
    ]),
  ],
  controllers: [
    SigmaQuizSchoolController,
    QuizRoundController,
    QuizQuestionController,
    SigmaQuizController,
  ],
  providers: [SigmaQuizService, SigmaQuizSchoolService, QuizRoundService, QuizQuestionService],
})
export class SigmaQuizModule {}
