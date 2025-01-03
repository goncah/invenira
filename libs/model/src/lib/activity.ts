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

export interface CreateActivity extends Partial<Activity> {
  name: string;
  activityProviderId: string;
  parameters: Map<string, unknown>;
}

export interface UpdateActivity extends Partial<Activity> {
  parameters: Map<string, unknown>;
}

export interface ConfigInterface {
  url: string;
}
