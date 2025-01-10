import mongoose from 'mongoose';
import { BadRequestException } from './exceptions/bad.request.exception';

export const checkIsValidMongoId = (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid id');
  }
};
