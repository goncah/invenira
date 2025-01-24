import { z } from 'zod';

export interface Iap {
  _id: string;
  name: string;
  description: string;
  activityIds: string[];
  isDeployed: boolean;
  deployUrls: Map<string, string>;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export type IapKey = keyof Iap;

export const CreateIapProviderSchema = z
  .object({
    name: z.string().nonempty(),
    description: z.string().nonempty(),
  })
  .strict();

export type CreateIap = z.infer<typeof CreateIapProviderSchema>;

export const UpdateIapProviderSchema = z
  .object({
    name: z.string().nonempty(),
    description: z.string().nonempty(),
  })
  .strict();

export type UpdateIap = z.infer<typeof UpdateIapProviderSchema>;

export const AddActivityToIapSchema = z
  .object({
    activityId: z.string().nonempty(),
  })
  .strict();

export type AddActivityToIap = z.infer<typeof AddActivityToIapSchema>;
