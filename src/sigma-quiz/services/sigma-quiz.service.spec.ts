import { TestBed } from '@automock/jest';
import { SigmaQuizService } from './sigma-quiz.service';
import { SigmaQuiz } from '../entities/sigma-quiz.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import {
  buildCreateSigmaQuizDtoMock,
  buildSigmaQuizMock,
  buildUpdateSigmaQuizDtoMock,
  mockQuizQuestion,
  mockQuizRound,
  mockSchoolQuizRegistration,
  mockSchoolRoundParticipation,
  mockSigmaQuizSchool,
} from '../../test/factories/sigma-quiz.factory';
import { PostgresErrorCode } from '../../database/postgres-errorcodes.enum';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { QuizRoundService } from './quiz-round.service';
import { SigmaQuizSchoolService } from './sigma-quiz-school.service';
import { SchoolQuizRegistration } from '../entities/school-registration.entity';

describe('SigmaQuizService', () => {
  let service: SigmaQuizService;
  let sigmaQuizRepo: Repository<SigmaQuiz>;
  let quizRoundService: QuizRoundService;
  let quizSchoolService: SigmaQuizSchoolService;
  let schoolRegistrationRepo: Repository<SchoolQuizRegistration>;

  const queryBuilderMock = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    setFindOptions: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    setParameters: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(SigmaQuizService).compile();

    service = unit;
    sigmaQuizRepo = unitRef.get(getRepositoryToken(SigmaQuiz) as string);
    quizRoundService = unitRef.get(QuizRoundService);
    quizSchoolService = unitRef.get(SigmaQuizSchoolService);
    schoolRegistrationRepo = unitRef.get(
      getRepositoryToken(SchoolQuizRegistration) as string,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new sigma quiz successfully', async () => {
      const createSigmaQuizDto = buildCreateSigmaQuizDtoMock({
        date: new Date('2023-05-23'),
      });
      const createdSigmaQuiz = {
        ...createSigmaQuizDto,
        year: 2023,
      };
      const savedSigmaQuiz = buildSigmaQuizMock({
        id: '1',
        ...createdSigmaQuiz,
      });

      jest.spyOn(sigmaQuizRepo, 'create').mockReturnValue(savedSigmaQuiz);
      jest.spyOn(sigmaQuizRepo, 'save').mockResolvedValue(savedSigmaQuiz);

      const result = await service.create(createSigmaQuizDto);
      expect(result).toEqual(savedSigmaQuiz);
      expect(sigmaQuizRepo.create).toHaveBeenCalledWith(createdSigmaQuiz);
      expect(sigmaQuizRepo.save).toHaveBeenCalledWith(savedSigmaQuiz);
    });

    it('should throw a ConflictException if quiz with the same date already exists', async () => {
      const createSigmaQuizDto = buildCreateSigmaQuizDtoMock({
        date: new Date('2023-05-23'),
      });

      const error = {
        code: PostgresErrorCode.UniqueViolation,
        detail: 'Quiz with that date already exists',
      };

      const savedSigmaQuiz = buildSigmaQuizMock({
        id: '1',
        ...createSigmaQuizDto,
      });

      jest.spyOn(sigmaQuizRepo, 'create').mockReturnValue(savedSigmaQuiz);
      jest.spyOn(sigmaQuizRepo, 'save').mockRejectedValue(error);

      await expect(service.create(createSigmaQuizDto)).rejects.toThrow(
        ConflictException,
      );
      expect(sigmaQuizRepo.create).toHaveBeenCalled();
      expect(sigmaQuizRepo.save).toHaveBeenCalled();
    });

    it('should throw any other error that occurs during creation', async () => {
      const createSigmaQuizDto = buildCreateSigmaQuizDtoMock({
        date: new Date('2023-05-23'),
      });
      const error = new Error('Some unexpected error');

      const savedSigmaQuiz = buildSigmaQuizMock({
        id: '1',
        ...createSigmaQuizDto,
      });

      jest.spyOn(sigmaQuizRepo, 'create').mockReturnValue(savedSigmaQuiz);
      jest.spyOn(sigmaQuizRepo, 'save').mockRejectedValue(error);

      await expect(service.create(createSigmaQuizDto)).rejects.toThrow(error);
      expect(sigmaQuizRepo.create).toHaveBeenCalled();
      expect(sigmaQuizRepo.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of Sigma Quizes', async () => {
      const sigmaQuizes = [buildSigmaQuizMock(), buildSigmaQuizMock()];
      jest.spyOn(sigmaQuizRepo, 'find').mockResolvedValue(sigmaQuizes);
      expect(await service.findAll()).toEqual(sigmaQuizes);
    });

    it('should query Sigma Quizes with provided whereClause', async () => {
      const whereClause: FindOptionsWhere<SigmaQuiz> = {
        date: new Date(),
      };
      const sigmaQuizes = [buildSigmaQuizMock()];

      jest.spyOn(sigmaQuizRepo, 'find').mockResolvedValue(sigmaQuizes);

      const result = await service.findAll(whereClause);

      expect(result).toEqual(sigmaQuizes);
      expect(sigmaQuizRepo.find).toHaveBeenCalledWith({ where: whereClause });
    });
  });

  describe('findOneById', () => {
    it('should return the Sigma Quiz with the provided id', async () => {
      const quizId = '1';
      const sigmaQuiz = buildSigmaQuizMock();
      jest
        .spyOn(sigmaQuizRepo, 'createQueryBuilder')
        .mockReturnValue(queryBuilderMock as any);

      queryBuilderMock.getOne.mockResolvedValue(sigmaQuiz);

      jest.spyOn(sigmaQuizRepo, 'findOne').mockResolvedValue(sigmaQuiz);
      expect(await service.findOneById(quizId)).toBe(sigmaQuiz);
    });

    it('should throw HttpStatus.NOT_FOUND if Sigma Quiz with provided id does not exist', async () => {
      const userId = 'nonexistent-id';
      jest
        .spyOn(sigmaQuizRepo, 'createQueryBuilder')
        .mockReturnValue(queryBuilderMock as any);

      queryBuilderMock.getOne.mockResolvedValue(undefined);

      await expect(service.findOneById(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a SigmaQuiz', async () => {
      const quizId = 'quiz-id';
      const updateSigmaQuizDto = buildUpdateSigmaQuizDtoMock({
        title: 'updated_title',
      });
      const mockSigmaQuiz = buildSigmaQuizMock({ id: quizId });
      const updatedSigmaQuizMock = buildSigmaQuizMock({
        ...mockSigmaQuiz,
        ...updateSigmaQuizDto,
      });
      jest
        .spyOn(service, 'findOneById')
        .mockResolvedValueOnce(mockSigmaQuiz)
        .mockResolvedValueOnce(updatedSigmaQuizMock);
      jest
        .spyOn(sigmaQuizRepo, 'save')
        .mockResolvedValueOnce(updatedSigmaQuizMock);

      const result = await service.update(quizId, updateSigmaQuizDto);

      expect(result).toBe(updatedSigmaQuizMock);
      expect(sigmaQuizRepo.save).toHaveBeenCalledWith(
        expect.objectContaining(updateSigmaQuizDto),
      );
    });
  });

  describe('remove', () => {
    it('should remove a SigmaQuiz', async () => {
      const quizId = 'quiz-id';
      const mockQuiz = buildSigmaQuizMock({ id: quizId });
      jest.spyOn(service, 'findOneById').mockResolvedValueOnce(mockQuiz);
      jest.spyOn(sigmaQuizRepo, 'delete').mockResolvedValueOnce(undefined);

      await service.remove(quizId);

      expect(sigmaQuizRepo.delete).toHaveBeenCalledWith(quizId);
    });

    it('should throw NotFoundException if course not found', async () => {
      const quizId = 'quiz-id';
      jest.spyOn(service, 'findOneById').mockResolvedValueOnce(undefined);

      await expect(service.remove(quizId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('fetchQuizRounds', () => {
    it('should return quiz rounds when quiz exists', async () => {
      const quizId = '1';
      const quiz = { id: quizId } as SigmaQuiz;
      const quizRounds = [
        mockQuizRound({ id: '1' }),
        mockQuizRound({ id: '2' }),
      ];
      jest.spyOn(service, 'findOneById').mockResolvedValue(quiz);
      const findAllSpy = jest
        .spyOn(quizRoundService, 'findAll')
        .mockResolvedValue(quizRounds);

      const result = await service.fetchQuizRounds(quizId);

      expect(result).toEqual(quizRounds);
      expect(service.findOneById).toHaveBeenCalledWith(quizId);
      expect(findAllSpy).toHaveBeenCalledWith({ quiz: { id: quizId } });
    });

    it('should throw an error when quiz does not exist', async () => {
      const quizId = '1';
      jest
        .spyOn(service, 'findOneById')
        .mockRejectedValue(new NotFoundException());

      await expect(service.fetchQuizRounds(quizId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle errors gracefully', async () => {
      const quizId = '1';
      jest
        .spyOn(service, 'findOneById')
        .mockRejectedValue(new Error('Some error'));

      await expect(service.fetchQuizRounds(quizId)).rejects.toThrow(
        'Some error',
      );
    });
  });

  describe('registerSchoolForQuiz', () => {
    it('should register school for quiz successfully', async () => {
      const quizId = 'quiz-id';
      const schoolId = 'school-id';
      const quiz = buildSigmaQuizMock({ id: quizId });
      const school = mockSigmaQuizSchool({ id: schoolId });
      const registerSchObj = {
        quizId,
        schoolId,
        school,
        quiz,
      };
      const schoolRegistration = mockSchoolQuizRegistration(registerSchObj);

      jest.spyOn(service, 'findOneById').mockResolvedValue(quiz);
      jest.spyOn(quizSchoolService, 'findOneById').mockResolvedValue(school);
      jest
        .spyOn(schoolRegistrationRepo, 'save')
        .mockResolvedValue(schoolRegistration);

      const result = await service.registerSchoolForQuiz(quizId, schoolId);

      expect(service.findOneById).toHaveBeenCalledWith(quizId);
      expect(quizSchoolService.findOneById).toHaveBeenCalledWith(schoolId);
      expect(schoolRegistrationRepo.save).toHaveBeenCalledWith(registerSchObj);
      expect(result).toEqual(schoolRegistration);
    });

    it('should throw ConflictException when school is already registered for quiz', async () => {
      const quizId = 'quiz-id';
      const schoolId = 'school-id';
      const quiz = buildSigmaQuizMock({ id: quizId });
      const school = mockSigmaQuizSchool({ id: schoolId });

      jest.spyOn(service, 'findOneById').mockResolvedValue(quiz);
      jest.spyOn(quizSchoolService, 'findOneById').mockResolvedValue(school);
      jest
        .spyOn(schoolRegistrationRepo, 'save')
        .mockRejectedValue({ code: PostgresErrorCode.UniqueViolation });

      await expect(
        service.registerSchoolForQuiz(quizId, schoolId),
      ).rejects.toThrow(ConflictException);
      expect(service.findOneById).toHaveBeenCalledWith(quizId);
      expect(quizSchoolService.findOneById).toHaveBeenCalledWith(schoolId);
      expect(schoolRegistrationRepo.save).toHaveBeenCalledWith({
        quizId,
        schoolId,
        school,
        quiz,
      });
    });

    it('should throw error for other issues during registration', async () => {
      const quizId = 'quiz-id';
      const schoolId = 'school-id';
      const quiz = buildSigmaQuizMock({ id: quizId });
      const school = mockSigmaQuizSchool({ id: schoolId });

      const error = new Error('Some error');

      jest.spyOn(service, 'findOneById').mockResolvedValue(quiz);
      jest.spyOn(quizSchoolService, 'findOneById').mockResolvedValue(school);
      jest.spyOn(schoolRegistrationRepo, 'save').mockRejectedValue(error);

      await expect(
        service.registerSchoolForQuiz(quizId, schoolId),
      ).rejects.toThrow(error);
      expect(service.findOneById).toHaveBeenCalledWith(quizId);
      expect(quizSchoolService.findOneById).toHaveBeenCalledWith(schoolId);
      expect(schoolRegistrationRepo.save).toHaveBeenCalledWith({
        quizId,
        schoolId,
        school,
        quiz,
      });
    });
  });

  describe('fetchSchoolsRegisteredForQuiz', () => {
    it('should fetch schools registered for a quiz', async () => {
      const quizId = 'quizId1';
      const quiz = buildSigmaQuizMock({ id: quizId });
      const schoolRegistrations = [
        mockSchoolQuizRegistration({
          quizId,
          schoolId: 'school1',
        }),
        mockSchoolQuizRegistration({ quizId, schoolId: 'school2' }),
      ];

      jest.spyOn(service, 'findOneById').mockResolvedValue(quiz);
      jest
        .spyOn(schoolRegistrationRepo, 'findBy')
        .mockResolvedValue(schoolRegistrations);

      const result = await service.fetchSchoolsRegisteredForQuiz(quizId);

      expect(schoolRegistrationRepo.findBy).toHaveBeenCalledWith({
        quiz: { id: quiz.id },
      });
      expect(result).toEqual(schoolRegistrations);
    });

    it('should throw NotFoundException if quiz does not exist', async () => {
      const quizId = 'invalidQuizId';
      jest
        .spyOn(service, 'findOneById')
        .mockRejectedValue(new NotFoundException());

      await expect(
        service.fetchSchoolsRegisteredForQuiz(quizId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('unregisterSchoolForQuiz', () => {
    it('should unregister a school from a quiz and return the updated list of registered schools', async () => {
      const quizId = 'quizId1';
      const schoolId = 'schoolId1';
      const quiz = buildSigmaQuizMock({ id: quizId });
      const school = mockSigmaQuizSchool({ id: schoolId }); // Mocked school entity
      const schoolRegistration = mockSchoolQuizRegistration({
        quizId,
        schoolId,
        quiz,
        school,
      });
      const updatedSchoolRegistrations = [
        mockSchoolQuizRegistration({
          quizId,
          schoolId: 'schoolId2',
        }),
      ];

      jest.spyOn(service, 'findOneById').mockResolvedValue(quiz);
      jest.spyOn(quizSchoolService, 'findOneById').mockResolvedValue(school);
      jest
        .spyOn(schoolRegistrationRepo, 'findOneBy')
        .mockResolvedValue(schoolRegistration);
      jest.spyOn(schoolRegistrationRepo, 'remove').mockResolvedValue(undefined);
      jest
        .spyOn(schoolRegistrationRepo, 'findBy')
        .mockResolvedValue(updatedSchoolRegistrations);

      const result = await service.unregisterSchoolForQuiz(quizId, schoolId);

      expect(service.findOneById).toHaveBeenCalledWith(quizId);
      expect(quizSchoolService.findOneById).toHaveBeenCalledWith(schoolId);
      expect(schoolRegistrationRepo.findOneBy).toHaveBeenCalledWith({
        quiz: { id: quizId },
        school: { id: schoolId },
      });
      expect(schoolRegistrationRepo.remove).toHaveBeenCalledWith(
        schoolRegistration,
      );
      expect(result).toEqual(updatedSchoolRegistrations);
    });

    it('should throw NotFoundException if the school is not registered for the quiz', async () => {
      const quizId = 'quizId1';
      const schoolId = 'schoolId1';
      const quiz = buildSigmaQuizMock({ id: quizId });
      const school = mockSigmaQuizSchool({ id: schoolId });

      jest.spyOn(service, 'findOneById').mockResolvedValue(quiz);
      jest.spyOn(quizSchoolService, 'findOneById').mockResolvedValue(school);
      jest.spyOn(schoolRegistrationRepo, 'findOneBy').mockResolvedValue(null);

      await expect(
        service.unregisterSchoolForQuiz(quizId, schoolId),
      ).rejects.toThrow(NotFoundException);
      expect(service.findOneById).toHaveBeenCalledWith(quizId);
      expect(quizSchoolService.findOneById).toHaveBeenCalledWith(schoolId);
      expect(schoolRegistrationRepo.findOneBy).toHaveBeenCalledWith({
        quiz: { id: quizId },
        school: { id: schoolId },
      });
    });
  });

  describe('fetchSchoolRegisterationForQuiz', () => {
    it('should return the school registration if found', async () => {
      const quizId = 'quiz-id';
      const schoolId = 'school-id';
      const quiz = buildSigmaQuizMock({ id: quizId });
      const school = mockSigmaQuizSchool({ id: schoolId });
      const schoolRegistration = mockSchoolQuizRegistration({
        quizId,
        schoolId,
        school,
        quiz,
      });

      jest.spyOn(service, 'findOneById').mockResolvedValue(quiz);
      jest.spyOn(quizSchoolService, 'findOneById').mockResolvedValue(school);
      jest
        .spyOn(schoolRegistrationRepo, 'findOneBy')
        .mockResolvedValue(schoolRegistration);

      const result = await service.fetchSchoolRegisterationForQuiz(
        quizId,
        schoolId,
      );
      expect(result).toEqual(schoolRegistration);
    });

    it('should throw NotFoundException if the school registration is not found', async () => {
      const quizId = 'quiz-id';
      const schoolId = 'school-id';
      const quiz = buildSigmaQuizMock({ id: quizId });
      const school = mockSigmaQuizSchool({ id: schoolId });

      jest.spyOn(service, 'findOneById').mockResolvedValue(quiz);
      jest.spyOn(quizSchoolService, 'findOneById').mockResolvedValue(school);
      jest.spyOn(schoolRegistrationRepo, 'findOneBy').mockResolvedValue(null);

      await expect(
        service.fetchSchoolRegisterationForQuiz(quizId, schoolId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('fetchResults', () => {
    const quizId = 'quiz-id-1';
    const mockQuiz = buildSigmaQuizMock({
      id: quizId,
      schoolRegistrations: [mockSchoolQuizRegistration({})],
      rounds: [
        mockQuizRound({
          schoolParticipations: [
            mockSchoolRoundParticipation(),
            mockSchoolRoundParticipation(),
          ],
          questions: [mockQuizQuestion(), mockQuizQuestion()],
        }),
      ],
    });

    it('should fetch quiz results successfully', async () => {
      jest.spyOn(service, 'findOneById').mockResolvedValueOnce(mockQuiz);

      const result = await service.fetchResults(quizId);

      expect(result).toEqual(mockQuiz);
      expect(service.findOneById).toHaveBeenCalledWith(quizId, {
        schoolRegistrations: {
          rounds: {
            answered_questions: true,
            bonus_questions: true,
          },
        },
        rounds: {
          schoolParticipations: {
            answered_questions: true,
            bonus_questions: true,
          },
          questions: {
            answered_by: { schoolRegistration: true },
            bonus_to: { schoolRegistration: true },
          },
        },
      });
    });

    it('should handle errors', async () => {
      const errorMessage = 'An error occurred';
      jest
        .spyOn(service, 'findOneById')
        .mockRejectedValueOnce(new Error(errorMessage));

      await expect(service.fetchResults(quizId)).rejects.toThrow(errorMessage);

      expect(service.findOneById).toHaveBeenCalledWith(quizId, {
        schoolRegistrations: {
          rounds: {
            answered_questions: true,
            bonus_questions: true,
          },
        },
        rounds: {
          schoolParticipations: {
            answered_questions: true,
            bonus_questions: true,
          },
          questions: {
            answered_by: { schoolRegistration: true },
            bonus_to: { schoolRegistration: true },
          },
        },
      });
    });
  });

  describe('computeQuizScores', () => {
    const quizId = 'quiz-id-1';
    const mockQuiz = buildSigmaQuizMock({
      id: quizId,
      schoolRegistrations: [
        mockSchoolQuizRegistration({
          rounds: [
            mockSchoolRoundParticipation({ score: 10 }),
            mockSchoolRoundParticipation({ score: 20 }),
          ],
          score: 0,
          position: 0,
        }),
        mockSchoolQuizRegistration({
          rounds: [
            mockSchoolRoundParticipation({ score: 15 }),
            mockSchoolRoundParticipation({ score: 10 }),
          ],
          score: 0,
          position: 0,
        }),
      ],
    });

    it('should compute quiz scores correctly and update positions', async () => {
      jest.spyOn(service, 'findOneById').mockResolvedValueOnce(mockQuiz);
      jest.spyOn(sigmaQuizRepo, 'save').mockResolvedValueOnce(mockQuiz);

      jest.spyOn(service, 'fetchResults').mockResolvedValueOnce(mockQuiz);

      const result = await service.computeQuizScores(quizId);

      expect(service.findOneById).toHaveBeenCalledWith(quizId, {
        schoolRegistrations: { rounds: true },
      });
      expect(sigmaQuizRepo.save).toHaveBeenCalledWith(mockQuiz);
      expect(service.fetchResults).toHaveBeenCalledWith(quizId);

      expect(result.schoolRegistrations[0].score).toBe(30);
      expect(result.schoolRegistrations[0].position).toBe(1);
      expect(result.schoolRegistrations[1].score).toBe(25);
      expect(result.schoolRegistrations[1].position).toBe(2);
    });

    it('should handle errors', async () => {
      const errorMessage = 'An error occurred';
      jest
        .spyOn(service, 'findOneById')
        .mockRejectedValueOnce(new Error(errorMessage));

      await expect(service.computeQuizScores(quizId)).rejects.toThrow(
        errorMessage,
      );

      expect(service.findOneById).toHaveBeenCalledWith(quizId, {
        schoolRegistrations: { rounds: true },
      });
    });
  });
});
