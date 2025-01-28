import { z } from 'zod';

export const IapSchema = z
  .object({
    _id: z.string().nonempty(),
    name: z.string().nonempty(),
    description: z.string().nonempty(),
    activityIds: z.array(z.string().nonempty()),
    isDeployed: z.boolean(),
    deployUrls: z.record(z.string(), z.any()),
    createdAt: z.date(),
    createdBy: z.string().nonempty(),
    updatedAt: z.date(),
    updatedBy: z.string().nonempty(),
  })
  .strict();

export type Iap = Required<z.infer<typeof IapSchema>>;

export type IapKey = keyof Iap;

export const CreateIapSchema = z
  .object({
    name: z.string().nonempty(),
    description: z.string().nonempty(),
  })
  .strict();

export type CreateIap = Required<z.infer<typeof CreateIapSchema>>;

export const UpdateIapSchema = z
  .object({
    name: z.string().nonempty(),
    description: z.string().nonempty(),
  })
  .strict();

export type UpdateIap = Required<z.infer<typeof UpdateIapSchema>>;

export const AddActivityToIapSchema = z
  .object({
    activityId: z.string().nonempty(),
  })
  .strict();

export type AddActivityToIap = Required<z.infer<typeof AddActivityToIapSchema>>;
