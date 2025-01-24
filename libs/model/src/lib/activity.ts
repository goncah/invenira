import { z } from 'zod';

export interface Activity {
  _id: string;
  name: string;
  activityProviderId: string;
  parameters: Map<string, unknown>;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export type ActivityKey = keyof Activity;

export interface EnrichedActivity extends Activity {
  ap: string;
}

export type EnrichedActivityKey = keyof EnrichedActivity;

export const CreateActivitySchema = z
  .object({
    name: z.string().nonempty(),
    activityProviderId: z.string().nonempty(),
    parameters: z.object({}).passthrough(),
  })
  .strict();

export type CreateActivity = z.infer<typeof CreateActivitySchema>;

export const UpdateActivitySchema = z
  .object({
    parameters: z.object({}).passthrough(),
  })
  .strict();

export type UpdateActivity = z.infer<typeof UpdateActivitySchema>;

export const ConfigInterfaceSchema = z
  .object({
    url: z.string().url(),
  })
  .strict();

export type ConfigInterface = z.infer<typeof ConfigInterfaceSchema>;
