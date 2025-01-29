import { z } from 'zod';

export const MetricSchema = z
  .object({
    name: z.string().nonempty(),
    type: z.string().nonempty(),
  })
  .strict();

export type Metric = Required<z.infer<typeof MetricSchema>>;

export const AnalyticsContractSchema = z
  .object({
    qualAnalytics: z.array(MetricSchema),
    quantAnalytics: z.array(MetricSchema),
  })
  .strict();

export type AnalyticsContract = Required<
  z.infer<typeof AnalyticsContractSchema>
>;

export const QuantMetricWithValueSchema = MetricSchema.extend({
  value: z.number(),
}).strict();

export const QualMetricWithValueSchema = MetricSchema.extend({
  value: z.string().nonempty(),
}).strict();

export type QuantMetricWithValue = Required<
  z.infer<typeof QuantMetricWithValueSchema>
>;

export type QualMetricWithValue = Required<
  z.infer<typeof QualMetricWithValueSchema>
>;

export const AnalyticsSchema = z
  .object({
    inveniraStdID: z.string().nonempty(),
    qualAnalytics: z.array(QualMetricWithValueSchema),
    quantAnalytics: z.array(QuantMetricWithValueSchema),
  })
  .strict();

export const AnalyticsArraySchema = z.array(AnalyticsSchema);

export type Analytics = Required<z.infer<typeof AnalyticsSchema>>;

export type AnalyticsArray = Required<z.infer<typeof AnalyticsArraySchema>>;
