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
    name: z.string().nonempty(),
    url: z.string().nonempty(),
  })
  .strict();

export type CreateActivityProvider = z.infer<
  typeof CreateActivityProviderSchema
>;

export const UpdateActivityProviderSchema = z
  .object({
    url: z.string().nonempty(),
  })
  .strict();

export type UpdateActivityProvider = z.infer<
  typeof UpdateActivityProviderSchema
>;
