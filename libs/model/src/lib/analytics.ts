import { z } from 'zod';

export const AnalyticsSchema = z
  .object({
    name: z.string().nonempty(),
    type: z.string().nonempty(),
  })
  .strict();

export type Analytics = Required<z.infer<typeof AnalyticsSchema>>;

export const AnalyticsContractSchema = z
  .object({
    qualAnalytics: z.array(AnalyticsSchema),
    quantAnalytics: z.array(AnalyticsSchema),
  })
  .strict();

export type AnalyticsContract = Required<
  z.infer<typeof AnalyticsContractSchema>
>;
