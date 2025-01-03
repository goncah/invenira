import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Error } from 'mongoose';
import { HttpAdapterHost } from '@nestjs/core';

@Catch(Error.ValidationError)
export class MongoValidationErrorExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: Error.ValidationError, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const errors = Object.keys(exception.errors).map((key) => ({
      field: key,
      message: exception.errors[key].message,
    }));

    const httpStatus = HttpStatus.BAD_REQUEST;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message: exception.message,
      errors,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
