import { TestBed } from '@automock/jest';
import { FindOptionsWhere, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  buildSigmaQuizMock,
  mockCreateQuizRoundDto,
  mockQuizRound,
  mockSchoolQuizRegistration,
  mockSchoolRoundParticipation,
  mockSigmaQuizSchool,
  mockUpdateQuizRoundDto,
} from '../../test/factories/sigma-quiz.factory';
import { QuizRoundService } from './quiz-round.service';
import { QuizRound } from '../entities/quiz-round.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { SigmaQuizService } from './sigma-quiz.service';
import { SchoolRoundParticipation } from '../entities/school-round-participation.entity';
import { PostgresErrorCode } from '../../database/postgres-errorcodes.enum';
import { SigmaQuizSchoolService } from './sigma-quiz-school.service';

describe('QuizRoundService', () => {
  let service: QuizRoundService;
  let quizRoundRepo: Repository<QuizRound>;
  let sigmaQuizService: SigmaQuizService;
  let roundParticipationRepo: Repository<SchoolRoundParticipation>;
  let quizSchoolService: SigmaQuizSchoolService;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(QuizRoundService).compile();

    service = unit;
    sigmaQuizService = unitRef.get(SigmaQuizService);
    quizSchoolService = unitRef.get(SigmaQuizSchoolService);
    quizRoundRepo = unitRef.get(getRepositoryToken(QuizRound) as string);
    roundParticipationRepo = unitRef.get(
      getRepositoryToken(SchoolRoundParticipation) as string,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new QuizRound successfully', async () => {
      const createQuizRoundDto = mockCreateQuizRoundDto();
      const savedQuizRound = mockQuizRound(createQuizRoundDto);

      jest.spyOn(quizRoundRepo, 'create').mockReturnValue(savedQuizRound);
      jest.spyOn(quizRoundRepo, 'save').mockResolvedValue(savedQuizRound);

      const result = await service.create(createQuizRoundDto);
      expect(result).toEqual(savedQuizRound);
      expect(quizRoundRepo.create).toHaveBeenCalledWith(createQuizRoundDto);
      expect(quizRoundRepo.save).toHaveBeenCalledWith(savedQuizRound);
    });

    it('should throw any other error that occurs during creation', async () => {
      const createQuizRoundDto = mockCreateQuizRoundDto();
      const error = new Error('Some unexpected error');

      const savedQuizRound = mockQuizRound(createQuizRoundDto);

      jest.spyOn(quizRoundRepo, 'create').mockReturnValue(savedQuizRound);
      jest.spyOn(quizRoundRepo, 'save').mockRejectedValue(error);

      await expect(service.create(createQuizRoundDto)).rejects.toThrow(error);
      expect(quizRoundRepo.create).toHaveBeenCalled();
      expect(quizRoundRepo.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of QuizRounds', async () => {
      const quizRounds = [mockQuizRound(), mockQuizRound()];
      jest.spyOn(quizRoundRepo, 'find').mockResolvedValue(quizRounds);
      expect(await service.findAll()).toEqual(quizRounds);
    });

    it('should query QuizRounds with provided whereClause', async () => {
      const whereClause: FindOptionsWhere<QuizRound> = {
        round_number: 1,
      };
      const quizRounds = [mockQuizRound({ round_number: 1 })];

      jest.spyOn(quizRoundRepo, 'find').mockResolvedValue(quizRounds);

      const result = await service.findAll(whereClause);

      expect(result).toEqual(quizRounds);
      expect(quizRoundRepo.find).toHaveBeenCalledWith({
        where: whereClause,
      });
    });
  });

  describe('findOneById', () => {
    it('should return the QuizRound with the provided id', async () => {
      const quizRoundId = '1';
      const quizRound = mockQuizRound({id: quizRoundId});
      jest.spyOn(quizRoundRepo, 'findOneBy').mockResolvedValue(quizRound);
      expect(await service.findOneById(quizRoundId)).toBe(quizRound);
    });

    it('should throw NotFound Exception if QuizRound with provided id does not exist', async () => {
      const quizRoundId = 'nonexistent-id';
      jest.spyOn(quizRoundRepo, 'findOneBy').mockResolvedValue(undefined);
      await expect(service.findOneById(quizRoundId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a QuizRound', async () => {
      const quizRoundId = 'quiz-round-id';
      const updateQuizRoundDto = mockUpdateQuizRoundDto({
        name: 'updated_name',
      });
      const quizRoundMock = mockQuizRound({ id: quizRoundId });
      const updatedQuizRound = mockQuizRound({
        ...quizRoundMock,
        ...updateQuizRoundDto,
      });
      jest
        .spyOn(service, 'findOneById')
        .mockResolvedValueOnce(quizRoundMock)
        .mockResolvedValueOnce(updatedQuizRound);
      jest.spyOn(quizRoundRepo, 'save').mockResolvedValueOnce(updatedQuizRound);

      const result = await service.update(quizRoundId, updateQuizRoundDto);

      expect(result).toBe(updatedQuizRound);
    });
  });

  describe('remove', () => {
    it('should remove a QuizRound', async () => {
      const quizRoundId = 'quiz-round-id';
      const quizRoundMock = mockQuizRound({ id: quizRoundId });
      jest.spyOn(service, 'findOneById').mockResolvedValueOnce(quizRoundMock);
      jest.spyOn(quizRoundRepo, 'delete').mockResolvedValueOnce(undefined);

      await service.remove(quizRoundId);

      expect(quizRoundRepo.delete).toHaveBeenCalledWith(quizRoundId);
    });

    it('should throw NotFoundException if course not found', async () => {
      const schoolId = 'school-id';
      jest.spyOn(service, 'findOneById').mockResolvedValueOnce(undefined);

      await expect(service.remove(schoolId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addSchoolParticipationInRound', () => {
    const roundId = 'round-id-1';
    const schoolId = 'school-id';
    const quizId = 'quiz-id-1';
    const quiz = buildSigmaQuizMock({ id: quizId });
    const school = mockSigmaQuizSchool({ id: schoolId });
    const quizRound = mockQuizRound({ id: roundId, quizId });
    const schoolRegistration = mockSchoolQuizRegistration({
      quizId,
      schoolId,
      school,
      quiz,
    });
    const roundParticipation = {
      roundId,
      schoolRegistrationId: schoolRegistration.id,
      schoolRegistration,
      round: quizRound,
    };
    const schoolRoundParticipation =
      mockSchoolRoundParticipation(roundParticipation);

    it('should add school participation in round', async () => {
      jest.spyOn(service, 'findOneById').mockResolvedValue(quizRound);
      jest
        .spyOn(sigmaQuizService, 'fetchSchoolRegisterationForQuiz')
        .mockResolvedValue(schoolRegistration);
      jest
        .spyOn(roundParticipationRepo, 'save')
        .mockResolvedValue(schoolRoundParticipation);

      const result = await service.addSchoolParticipationInRound(
        roundId,
        schoolId,
      );
      expect(result).toEqual(schoolRoundParticipation);
      expect(service.findOneById).toHaveBeenCalledWith(roundId);
      expect(
        sigmaQuizService.fetchSchoolRegisterationForQuiz,
      ).toHaveBeenCalledWith(quizId, schoolId);
      expect(roundParticipationRepo.save).toHaveBeenCalledWith(
        roundParticipation,
      );
    });

    it('should throw ConflictException if school is already participating in quiz round', async () => {
      jest.spyOn(service, 'findOneById').mockResolvedValue(quizRound);
      jest
        .spyOn(sigmaQuizService, 'fetchSchoolRegisterationForQuiz')
        .mockResolvedValue(schoolRegistration);
      jest.spyOn(roundParticipationRepo, 'save').mockRejectedValue({
        code: PostgresErrorCode.UniqueViolation,
      });

      await expect(
        service.addSchoolParticipationInRound(roundId, schoolId),
      ).rejects.toThrow(ConflictException);
      expect(service.findOneById).toHaveBeenCalledWith(roundId);
      expect(
        sigmaQuizService.fetchSchoolRegisterationForQuiz,
      ).toHaveBeenCalledWith(quizId, schoolId);
      expect(roundParticipationRepo.save).toHaveBeenCalledWith(
        roundParticipation,
      );
    });

    it('should throw error for other exceptions', async () => {
      const otherError = new Error('Some other error');
      jest.spyOn(service, 'findOneById').mockResolvedValue(quizRound);
      jest
        .spyOn(sigmaQuizService, 'fetchSchoolRegisterationForQuiz')
        .mockResolvedValue(schoolRegistration);
      jest.spyOn(roundParticipationRepo, 'save').mockRejectedValue(otherError);

      await expect(
        service.addSchoolParticipationInRound(roundId, schoolId),
      ).rejects.toThrow(otherError);
      expect(service.findOneById).toHaveBeenCalledWith(roundId);
      expect(
        sigmaQuizService.fetchSchoolRegisterationForQuiz,
      ).toHaveBeenCalledWith(quizId, schoolId);
      expect(roundParticipationRepo.save).toHaveBeenCalledWith(
        roundParticipation,
      );
    });
  });

  describe('fetchParticipatingSchools', () => {
    it('should fetch schools participating in quiz round', async () => {
      const quizRoundId = 'quiz-round-id';
      const quizRound = mockQuizRound({ id: quizRoundId });
      const participatingSchools = [
        mockSchoolRoundParticipation({
          roundId: quizRoundId,
        }),
        mockSchoolRoundParticipation({
          roundId: quizRoundId,
        }),
      ];

      jest.spyOn(service, 'findOneById').mockResolvedValue(quizRound);
      jest
        .spyOn(roundParticipationRepo, 'find')
        .mockResolvedValue(participatingSchools);

      const result = await service.fetchParticipatingSchools(quizRoundId);
      expect(result).toEqual(participatingSchools);
    });

    it('should throw NotFoundException if quiz round does not exist', async () => {
      const quizId = 'invalidQuizId';
      jest
        .spyOn(service, 'findOneById')
        .mockRejectedValue(new NotFoundException());

      await expect(service.fetchParticipatingSchools(quizId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeSchoolFromQuizRound', () => {
    it('should remove a school from a quizround participating schools and return the updated list of participating schools', async () => {
      const roundId = 'round-id-1';
      const schoolId = 'school-id';
      const quizId = 'quiz-id-1';
      const quiz = buildSigmaQuizMock({ id: quizId });
      const school = mockSigmaQuizSchool({ id: schoolId });
      const quizRound = mockQuizRound({ id: roundId, quizId });
      const schoolRegistration = mockSchoolQuizRegistration({
        quizId,
        schoolId,
        school,
        quiz,
      });
      const roundParticipation = {
        roundId,
        schoolRegistrationId: schoolRegistration.id,
        schoolRegistration,
        round: quizRound,
      };
      const schoolRoundParticipation =
        mockSchoolRoundParticipation(roundParticipation);

      jest.spyOn(service, 'findOneById').mockResolvedValue(quizRound);
      jest
        .spyOn(sigmaQuizService, 'fetchSchoolRegisterationForQuiz')
        .mockResolvedValue(schoolRegistration);
      jest
        .spyOn(roundParticipationRepo, 'findOneBy')
        .mockResolvedValue(schoolRoundParticipation);
      jest.spyOn(roundParticipationRepo, 'remove').mockResolvedValue(undefined);
      jest.spyOn(service, 'fetchParticipatingSchools').mockResolvedValue([]);

      const result = await service.removeSchoolFromQuizRound(roundId, schoolId);

      expect(service.findOneById).toHaveBeenCalledWith(roundId);
      expect(
        sigmaQuizService.fetchSchoolRegisterationForQuiz,
      ).toHaveBeenCalledWith(quizId, schoolId);
      expect(roundParticipationRepo.findOneBy).toHaveBeenCalledWith({
        round: { id: quizRound.id },
        schoolRegistration: { id: schoolRegistration.id },
      });
      expect(roundParticipationRepo.remove).toHaveBeenCalledWith(
        schoolRoundParticipation,
      );
      expect(result).toEqual([]);
    });

    it('should throw NotFoundException if the school is not registered for the quiz', async () => {
      const roundId = 'round-id-1';
      const schoolId = 'school-id';
      const quizId = 'quiz-id-1';
      const quiz = buildSigmaQuizMock({ id: quizId });
      const school = mockSigmaQuizSchool({ id: schoolId });
      const quizRound = mockQuizRound({ id: roundId, quizId });
      const schoolRegistration = mockSchoolQuizRegistration({
        quizId,
        schoolId,
        school,
        quiz,
      });

      jest.spyOn(service, 'findOneById').mockResolvedValue(quizRound);
      jest
        .spyOn(sigmaQuizService, 'fetchSchoolRegisterationForQuiz')
        .mockResolvedValue(schoolRegistration);
      jest.spyOn(roundParticipationRepo, 'findOneBy').mockResolvedValue(null);

      await expect(
        service.removeSchoolFromQuizRound(quizId, schoolId),
      ).rejects.toThrow(NotFoundException);
      expect(service.findOneById).toHaveBeenCalledWith(quizId);
      expect(
        sigmaQuizService.fetchSchoolRegisterationForQuiz,
      ).toHaveBeenCalledWith(quizId, schoolId);
      expect(roundParticipationRepo.findOneBy).toHaveBeenCalledWith({
        round: { id: quizRound.id },
        schoolRegistration: { id: schoolRegistration.id },
      });
    });
  });

  describe('fetchSchoolParticipationForQuizRound', () => {
    const roundId = 'round-id-1';
    const schoolId = 'school-id-1';

    it('should return the round participation if the school is participating in the quiz round', async () => {
      const mockRound = mockQuizRound({ id: roundId });
      const mockSchool = mockSigmaQuizSchool({ id: schoolId });
      const mockRoundParticipation = mockSchoolRoundParticipation({
        id: 'participation-id-1',
        round: mockRound,
        schoolRegistration: mockSchoolQuizRegistration({ school: mockSchool }),
      });

      jest.spyOn(service, 'findOneById').mockResolvedValue(mockRound);
      jest
        .spyOn(quizSchoolService, 'findOneById')
        .mockResolvedValue(mockSchool);
      jest
        .spyOn(roundParticipationRepo, 'findOneBy')
        .mockResolvedValue(mockRoundParticipation);

      const result = await service.fetchSchoolParticipationForQuizRound(
        roundId,
        schoolId,
      );

      expect(service.findOneById).toHaveBeenCalledWith(roundId);
      expect(quizSchoolService.findOneById).toHaveBeenCalledWith(schoolId);
      expect(roundParticipationRepo.findOneBy).toHaveBeenCalledWith({
        round: { id: roundId },
        schoolRegistration: { school: { id: schoolId } },
      });
      expect(result).toEqual(mockRoundParticipation);
    });

    it('should throw NotFoundException if the school is not participating in the quiz round', async () => {
      const mockRound = mockQuizRound({ id: roundId });
      const mockSchool = mockSigmaQuizSchool({ id: schoolId });
      const mockRoundParticipation = mockSchoolRoundParticipation({
        id: 'participation-id-1',
        round: mockRound,
        schoolRegistration: mockSchoolQuizRegistration({ school: mockSchool }),
      });

      jest.spyOn(service, 'findOneById').mockResolvedValue(mockRound);
      jest
        .spyOn(quizSchoolService, 'findOneById')
        .mockResolvedValue(mockSchool);
      jest.spyOn(roundParticipationRepo, 'findOneBy').mockResolvedValue(null);

      await expect(
        service.fetchSchoolParticipationForQuizRound(roundId, schoolId),
      ).rejects.toThrow(
        new NotFoundException('School Not Participating in Quiz Round'),
      );

      expect(service.findOneById).toHaveBeenCalledWith(roundId);
      expect(quizSchoolService.findOneById).toHaveBeenCalledWith(schoolId);
      expect(roundParticipationRepo.findOneBy).toHaveBeenCalledWith({
        round: { id: roundId },
        schoolRegistration: { school: { id: schoolId } },
      });
    });
  });
});
