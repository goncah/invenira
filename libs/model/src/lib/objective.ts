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

export const ObjectiveArraySchema = z.array(ObjectiveSchema);

export type ObjectiveArray = Required<z.infer<typeof ObjectiveArraySchema>>;

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

export const StudentObjectiveSchema = ObjectiveSchema.extend({
  inveniraStdID: z.string().nonempty(),
  lmsStdID: z.string().nonempty(),
}).strict();

export type StudentObjective = Required<z.infer<typeof StudentObjectiveSchema>>;

export type StudentObjectiveKey = keyof StudentObjective;

export const StudentObjectiveArraySchema = z.array(StudentObjectiveSchema);

export type StudentObjectiveArray = Required<
  z.infer<typeof StudentObjectiveArraySchema>
>;
