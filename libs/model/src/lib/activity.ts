import { z } from 'zod';

export const ActivitySchema = z
  .object({
    _id: z.string().nonempty(),
    name: z.string().nonempty(),
    activityProviderId: z.string().nonempty(),
    parameters: z.record(z.string(), z.any()),
    createdAt: z.date(),
    createdBy: z.string().nonempty(),
    updatedAt: z.date(),
    updatedBy: z.string().nonempty(),
  })
  .strict();

export type Activity = Required<z.infer<typeof ActivitySchema>>;

export type ActivityKey = keyof Activity;

export const EnrichedActivitySchema = z
  .object({
    ap: z.string().nonempty(),
  })
  .strict();

export type EnrichedActivity = Required<z.infer<typeof EnrichedActivitySchema>>;

export type EnrichedActivityKey = keyof EnrichedActivity;

export const CreateActivitySchema = z
  .object({
    name: z.string().nonempty(),
    activityProviderId: z.string().nonempty(),
    parameters: z.object({}).passthrough(),
  })
  .strict();

export type CreateActivity = Required<z.infer<typeof CreateActivitySchema>>;

export const UpdateActivitySchema = z
  .object({
    parameters: z.object({}).passthrough(),
  })
  .strict();

export type UpdateActivity = Required<z.infer<typeof UpdateActivitySchema>>;

export const ConfigInterfaceSchema = z
  .object({
    url: z.string().url(),
  })
  .strict();

export type ConfigInterface = Required<z.infer<typeof ConfigInterfaceSchema>>;
