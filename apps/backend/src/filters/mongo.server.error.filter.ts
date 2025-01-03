import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { MongoServerError } from 'mongodb';
import { HttpAdapterHost } from '@nestjs/core';
import { mapMongoErrorToHttpStatus } from './mongo.error.codes';

@Catch(MongoServerError) // Catch MongoDB server errors
export class MongoServerErrorExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: MongoServerError, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus = mapMongoErrorToHttpStatus(+exception.code);

    let responseBody;

    if (exception.code === 11000) {
      const duplicateField = Object.keys(exception.keyValue).join(', ');

      responseBody = {
        statusCode: httpStatus,
        timestamp: new Date().toISOString(),
        path: httpAdapter.getRequestUrl(ctx.getRequest()),
        message: `The field(s) ${duplicateField} must be unique.`,
      };
    } else {
      responseBody = {
        statusCode: httpStatus,
        timestamp: new Date().toISOString(),
        path: httpAdapter.getRequestUrl(ctx.getRequest()),
        message: exception.message,
      };
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
