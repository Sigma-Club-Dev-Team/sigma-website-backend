import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSigmaQuizSchoolDto } from '../dto/create-sigma-quiz-school.dto';
import { UpdateSigmaQuizSchoolDto } from '../dto/update-sigma-quiz-school.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SigmaQuizSchool } from '../entities/sigma-quiz-school.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PostgresErrorCode } from '../../database/postgres-errorcodes.enum';

@Injectable()
export class SigmaQuizSchoolService {
  constructor(
    @InjectRepository(SigmaQuizSchool)
    private readonly sigmaQuizSchRepo: Repository<SigmaQuizSchool>,
  ) {}

  async create(createSigmaQuizSchoolDto: CreateSigmaQuizSchoolDto) {
    try {
      const sigmaQuizSchool = this.sigmaQuizSchRepo.create({
        ...createSigmaQuizSchoolDto,
      });

      return await this.sigmaQuizSchRepo.save(sigmaQuizSchool);
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new ConflictException(
          error?.detail ?? 'Sigma Quiz School with that date already exists',
        );
      }

      throw error;
    }
  }

  async findAll(
    whereClause?:
      | FindOptionsWhere<SigmaQuizSchool>
      | FindOptionsWhere<SigmaQuizSchool>[],
  ): Promise<SigmaQuizSchool[]> {
    return await this.sigmaQuizSchRepo.find({ where: whereClause });
  }

  async findOneById(id: string): Promise<SigmaQuizSchool> {
    const sigmaQuizSch = await this.sigmaQuizSchRepo.findOneBy({ id });
    if (!sigmaQuizSch) {
      throw new NotFoundException(
        'Sigma Quiz School with this id does not exist',
      );
    }
    return sigmaQuizSch;
  }

  async update(id: string, updateSigmaQuizSchoolDto: UpdateSigmaQuizSchoolDto) {
    const school = await this.findOneById(id);

    const schoolUpdate = {
      ...school,
      ...updateSigmaQuizSchoolDto,
    };

    await this.sigmaQuizSchRepo.save(schoolUpdate);

    return await this.findOneById(school.id);
  }

  async remove(id: string) {
    const course = await this.findOneById(id);
    if (!course) {
      throw new NotFoundException('School does not exist!');
    }
    await this.sigmaQuizSchRepo.delete(id);
  }
}
