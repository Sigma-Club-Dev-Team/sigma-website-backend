import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsValidNumberOfQuestions(
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidNumberOfQuestions',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        defaultMessage() {
          return `Number of Questions should be be a multiple of number of Schools`;
        },
        validate(numberOfQuestions: any, args: ValidationArguments) {
          const noOfSchools = (args.object as any).no_of_schools;
          return (
            typeof numberOfQuestions === 'number' &&
            typeof noOfSchools === 'number' &&
            numberOfQuestions % noOfSchools === 0
          ); // you can return a Promise<boolean> here as well, if you want to make async validation
        },
      },
    });
  };
}
