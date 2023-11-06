import { ClassValidationPipe } from './class-validator.pipe';

export const classValidatorPipe = new ClassValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  forbidUnknownValues: true,
  skipMissingProperties: false,
});
