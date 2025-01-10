import {createParamDecorator, ExecutionContext, NotFoundException} from '@nestjs/common';
import { checkIsValidMongoId } from './mongo-utils';

export const MongoId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const id = request.params.id;

    if (!id) throw new NotFoundException();

    checkIsValidMongoId(id);
    return id;
  },
);
