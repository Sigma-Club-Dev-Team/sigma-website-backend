import { TestBed } from '@automock/jest';
import { SigmaQuizSchoolService } from './sigma-quiz-school.service';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { SigmaQuizSchool } from '../entities/sigma-quiz-school.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  mockSigmaQuizSchool,
  mockCreateSigmaQuizSchoolDto,
  mockUpdateSigmaQuizSchoolDto,
} from '../../test/factories/sigma-quiz.factory';
import { NotFoundException } from '@nestjs/common';

describe('SigmaQuizSchoolService', () => {
  let service: SigmaQuizSchoolService;
  let sigmaQuizSchRepo: Repository<SigmaQuizSchool>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(SigmaQuizSchoolService).compile();

    service = unit;
    sigmaQuizSchRepo = unitRef.get(
      getRepositoryToken(SigmaQuizSchool) as string,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new sigma quiz school successfully', async () => {
      const createSigmaQuizSchoolDto = mockCreateSigmaQuizSchoolDto();
      const savedSigmaQuizSchool = mockSigmaQuizSchool(
        createSigmaQuizSchoolDto,
      );

      jest
        .spyOn(sigmaQuizSchRepo, 'create')
        .mockReturnValue(savedSigmaQuizSchool);
      jest
        .spyOn(sigmaQuizSchRepo, 'save')
        .mockResolvedValue(savedSigmaQuizSchool);

      const result = await service.create(createSigmaQuizSchoolDto);
      expect(result).toEqual(savedSigmaQuizSchool);
      expect(sigmaQuizSchRepo.create).toHaveBeenCalledWith(
        createSigmaQuizSchoolDto,
      );
      expect(sigmaQuizSchRepo.save).toHaveBeenCalledWith(savedSigmaQuizSchool);
    });

    it('should throw any other error that occurs during creation', async () => {
      const createSigmaQuizDto = mockCreateSigmaQuizSchoolDto();
      const error = new Error('Some unexpected error');

      const savedSigmaQuiz = mockSigmaQuizSchool(createSigmaQuizDto);

      jest.spyOn(sigmaQuizSchRepo, 'create').mockReturnValue(savedSigmaQuiz);
      jest.spyOn(sigmaQuizSchRepo, 'save').mockRejectedValue(error);

      await expect(service.create(createSigmaQuizDto)).rejects.toThrow(error);
      expect(sigmaQuizSchRepo.create).toHaveBeenCalled();
      expect(sigmaQuizSchRepo.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of Sigma Quiz Schools', async () => {
      const sigmaQuizSchools = [mockSigmaQuizSchool(), mockSigmaQuizSchool()];
      jest.spyOn(sigmaQuizSchRepo, 'find').mockResolvedValue(sigmaQuizSchools);
      expect(await service.findAll()).toEqual(sigmaQuizSchools);
    });

    it('should query Sigma Quiz Schools with provided whereClause', async () => {
      const whereClause: FindOptionsWhere<SigmaQuizSchool> = {
        state: 'Lasgidi',
      };
      const sigmaQuizes = [mockSigmaQuizSchool({state: "Lasgidi"})];

      jest.spyOn(sigmaQuizSchRepo, 'find').mockResolvedValue(sigmaQuizes);

      const result = await service.findAll(whereClause);

      expect(result).toEqual(sigmaQuizes);
      expect(sigmaQuizSchRepo.find).toHaveBeenCalledWith({ where: whereClause });
    });
  });

  describe('findOneById', () => {
    it('should return the Sigma Quiz School with the provided id', async () => {
      const schoolId = '1';
      const sigmaQuizSch = mockSigmaQuizSchool();
      jest.spyOn(sigmaQuizSchRepo, 'findOneBy').mockResolvedValue(sigmaQuizSch);
      expect(await service.findOneById(schoolId)).toBe(sigmaQuizSch);
    });

    it('should throw NotFound Exception if Sigma Quiz School with provided id does not exist', async () => {
      const schoolId = 'nonexistent-id';
      jest.spyOn(sigmaQuizSchRepo, 'findOneBy').mockResolvedValue(undefined);
      await expect(service.findOneById(schoolId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a SigmaQuiz School', async () => {
      const schoolId = 'school-id';
      const updateSchoolDto = mockUpdateSigmaQuizSchoolDto({
        name: 'updated_name',
      });
      const schoolMock = mockSigmaQuizSchool({ id: schoolId });
      const updatedSchoolMock = mockSigmaQuizSchool({
        ...schoolMock,
        ...updateSchoolDto,
      });
      jest
        .spyOn(service, 'findOneById')
        .mockResolvedValueOnce(schoolMock)
        .mockResolvedValueOnce(updatedSchoolMock);
      jest
        .spyOn(sigmaQuizSchRepo, 'save')
        .mockResolvedValueOnce(updatedSchoolMock);

      const result = await service.update(schoolId, updateSchoolDto);

      expect(result).toBe(updatedSchoolMock);
      expect(sigmaQuizSchRepo.save).toHaveBeenCalledWith(
        expect.objectContaining(updateSchoolDto),
      );
    });
  });

  describe('remove', () => {
    it('should remove a SigmaQuiz School', async () => {
      const schoolId = 'school-id';
      const schoolMock = mockSigmaQuizSchool({ id: schoolId });
      jest.spyOn(service, 'findOneById').mockResolvedValueOnce(schoolMock);
      jest.spyOn(sigmaQuizSchRepo, 'delete').mockResolvedValueOnce(undefined);

      await service.remove(schoolId);

      expect(sigmaQuizSchRepo.delete).toHaveBeenCalledWith(schoolId);
    });

    it('should throw NotFoundException if course not found', async () => {
      const schoolId = 'school-id';
      jest.spyOn(service, 'findOneById').mockResolvedValueOnce(undefined);

      await expect(service.remove(schoolId)).rejects.toThrow(NotFoundException);
    });
  });

   describe('search', () => {
     it('should call findAll with correct parameters when name is provided', async () => {
       const searchText = 'Test School';
       const searchTextLower = searchText.toLowerCase();
       const findAllSpy = jest.spyOn(service, 'findAll').mockResolvedValue([]);

       await service.search(searchText);

       expect(findAllSpy).toHaveBeenCalledWith({
         name: ILike(`%${searchTextLower}%`),
       });
     });

     it('should call findAll with empty string when name is not provided', async () => {
       const searchText = '';
       const findAllSpy = jest.spyOn(service, 'findAll').mockResolvedValue([]);

       await service.search(searchText);

       expect(findAllSpy).toHaveBeenCalledWith({
         name: ILike(`%${searchText}%`),
       });
     });

     it('should return the result from findAll', async () => {
       const result = [
         mockSigmaQuizSchool({ id: '1', name: 'Test School' }),
       ];
       
       jest.spyOn(service, 'findAll').mockResolvedValue(result);

       const searchText = 'Test';
       const searchTextLower = searchText.toLowerCase();
       const response = await service.search(searchText);

       expect(response).toEqual(result);
       expect(service.findAll).toHaveBeenCalledWith({
         name: ILike(`%${searchTextLower}%`),
       });
     });

     it('should handle errors gracefully', async () => {
       const searchText = 'Test';
       const searchTextLower = searchText.toLowerCase();
       jest
         .spyOn(service, 'findAll')
         .mockRejectedValue(new Error('Some error'));

       await expect(service.search(searchText)).rejects.toThrow('Some error');
       expect(service.findAll).toHaveBeenCalledWith({
         name: ILike(`%${searchTextLower}%`),
       });
     });
   });
});
