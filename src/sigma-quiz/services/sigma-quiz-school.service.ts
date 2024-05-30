import { ConflictException, Injectable } from '@nestjs/common';
import { CreateSigmaQuizSchoolDto } from '../dto/create-sigma-quiz-school.dto';
import { UpdateSigmaQuizSchoolDto } from '../dto/update-sigma-quiz-school.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SigmaQuizSchool } from '../entities/sigma-quiz-school.entity';
import { Repository } from 'typeorm';
import { PostgresErrorCode } from '../../database/postgres-errorcodes.enum';

@Injectable()
export class SigmaQuizSchoolService {
  constructor(
    @InjectRepository(SigmaQuizSchool)
    private readonly sigmaQuizSchoolRepo: Repository<SigmaQuizSchool>,
  ) {}

  async create(createSigmaQuizSchoolDto: CreateSigmaQuizSchoolDto) {
    try {
      const sigmaQuizSchool = this.sigmaQuizSchoolRepo.create({
        ...createSigmaQuizSchoolDto,
      });

      return await this.sigmaQuizSchoolRepo.save(sigmaQuizSchool);
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new ConflictException(
          error?.detail ?? 'Sigma Quiz School with that date already exists',
        );
      }

      throw error;
    }
  }

  findAll() {
    return `This action returns all sigmaQuizSchool`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sigmaQuizSchool`;
  }

  update(id: number, updateSigmaQuizSchoolDto: UpdateSigmaQuizSchoolDto) {
    return `This action updates a #${id} sigmaQuizSchool`;
  }

  remove(id: number) {
    return `This action removes a #${id} sigmaQuizSchool`;
  }
}
