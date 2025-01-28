import { z } from 'zod';

export const ActivityProviderSchema = z
  .object({
    _id: z.string().nonempty(),
    name: z.string().nonempty(),
    url: z.string().url(),
    createdAt: z.date(),
    createdBy: z.string().nonempty(),
    updatedAt: z.date(),
    updatedBy: z.string().nonempty(),
  })
  .strict();

export type ActivityProvider = Required<z.infer<typeof ActivityProviderSchema>>;

export type ActivityProviderKey = keyof ActivityProvider;

export const CreateActivityProviderSchema = z
  .object({
    name: z
      .string()
      .min(3, 'Activity Provider name must have a length of 3 or more!'),
    url: z.string().url('Invalid Activity Provider URL'),
  })
  .strict();

export type CreateActivityProvider = Required<
  z.infer<typeof CreateActivityProviderSchema>
>;

export const UpdateActivityProviderSchema = z
  .object({
    url: z.string().url('Invalid Activity Provider URL'),
  })
  .strict();

export type UpdateActivityProvider = Required<
  z.infer<typeof UpdateActivityProviderSchema>
>;
