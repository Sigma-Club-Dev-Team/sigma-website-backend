import { Module } from '@nestjs/common';
import { SigmaQuizService } from './sigma-quiz.service';
import { SigmaQuizController } from './sigma-quiz.controller';
import { SigmaQuiz } from './entities/sigma-quiz.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([SigmaQuiz])],
  controllers: [SigmaQuizController],
  providers: [SigmaQuizService],
})
export class SigmaQuizModule {}