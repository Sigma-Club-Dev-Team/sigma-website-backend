import { TestBed } from '@automock/jest';
import { SigmaQuizController } from './sigma-quiz.controller';
import { SigmaQuizService } from './sigma-quiz.service';
import { buildCreateSigmaQuizDtoMock, buildSigmaQuizMock } from '../test/factories/sigma-quiz.factory';

describe('SigmaQuizController', () => {
  let controller: SigmaQuizController;
  let sigmaQuizService: SigmaQuizService;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(SigmaQuizController).compile();

    controller = unit;
    sigmaQuizService = unitRef.get(SigmaQuizService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

   describe('create', () => {
     it('should create a new SigmaQuiz', async () => {
       const createSigmaQuizDto =
         buildCreateSigmaQuizDtoMock({
           title: 'New Quiz',
           description: 'A description for the new quiz',
           date: new Date('2024-05-23'),
         });

       const result = buildSigmaQuizMock({
         id: 'some-id',
         ...createSigmaQuizDto,
         year: 2024,
       })

       jest.spyOn(sigmaQuizService, 'create').mockResolvedValue(result);

       expect(await controller.create(createSigmaQuizDto)).toEqual(result);
       expect(sigmaQuizService.create).toHaveBeenCalledWith(createSigmaQuizDto);
     });

   });
});
