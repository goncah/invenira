import { z } from 'zod';

export interface ActivityProvider {
  _id: string;
  name: string;
  url: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export type ActivityProviderKey = keyof ActivityProvider;

export const CreateActivityProviderSchema = z
  .object({
    name: z
      .string()
      .min(3, 'Activity Provider name must have a length of 3 or more!'),
    url: z.string().url('Invalid Activity Provider URL'),
  })
  .strict();

export type CreateActivityProvider = z.infer<
  typeof CreateActivityProviderSchema
>;

export const UpdateActivityProviderSchema = z
  .object({
    url: z.string().url('Invalid Activity Provider URL'),
  })
  .strict();

export type UpdateActivityProvider = z.infer<
  typeof UpdateActivityProviderSchema
>;
