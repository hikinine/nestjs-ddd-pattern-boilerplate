/* eslint-disable @typescript-eslint/ban-types */
import { PaginationCriteria } from '@hiki9/rich-domain/dist';
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ValidatorOptions, validate } from 'class-validator';

@Injectable()
export class ClassValidationPipe implements PipeTransform<any> {
  constructor(private readonly validateOptions: ValidatorOptions) {}

  private allowedQueryProps = [
    'limit',
    'offset',
    'orderBy',
    'filter',
    'search',
  ];

  async transform(value: any, { metatype, type }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    if (type === 'query') {
      const criteria = new PaginationCriteria(value);
      return criteria;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object, this.validateOptions);
    if (errors.length > 0) {
      const [error] = errors;
      const constructorName = error?.target?.constructor?.name;
      const message = error.toString(undefined, true, constructorName, true);

      throw new BadRequestException(message?.replace?.(' - property ', ''));
    }
    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
