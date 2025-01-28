import { Injectable, PipeTransform } from '@nestjs/common';
import { BadRequestException } from '../exceptions/bad.request.exception';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema<any>) {}

  transform(value: any) {
    try {
      return this.schema.parse(value);
    } catch (e) {
      throw new BadRequestException(e.errors);
    }
  }
}
