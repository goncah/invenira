export interface ActivityProvider {
  _id: string;
  name: string;
  url: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export type ActivityProviderKey = keyof ActivityProvider;

export interface CreateActivityProvider extends Partial<ActivityProvider> {
  name: string;
  url: string;
}

export interface UpdateActivityProvider extends Partial<ActivityProvider> {
  url: string;
}
