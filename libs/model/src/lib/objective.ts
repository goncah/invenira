import { z } from 'zod';

export const ObjectiveSchema = z
  .object({
    _id: z.string().nonempty(),
    name: z.string().nonempty(),
    iapId: z.string().nonempty(),
    formula: z.string().nonempty(),
    targetValue: z.number(),
    value: z.number(),
    createdAt: z.date(),
    createdBy: z.string().nonempty(),
    updatedAt: z.date(),
    updatedBy: z.string().nonempty(),
  })
  .strict();

export type Objective = Required<z.infer<typeof ObjectiveSchema>>;

export type ObjectiveKey = keyof Objective;

export const CreateObjectiveSchema = z
  .object({
    name: z.string().nonempty(),
    iapId: z.string().nonempty(),
    formula: z.string().nonempty(),
    targetValue: z.number(),
  })
  .strict();

export type CreateObjective = Required<z.infer<typeof CreateObjectiveSchema>>;

export const UpdateObjectiveSchema = z
  .object({
    name: z.string().nonempty(),
    formula: z.string().nonempty(),
  })
  .strict();

export type UpdateObjective = Required<z.infer<typeof UpdateObjectiveSchema>>;
