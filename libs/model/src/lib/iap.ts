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

export interface CreateIap extends Partial<Iap> {
  name: string;
  description: string;
}

export interface UpdateIap extends Partial<Iap> {
  name: string;
  description: string;
}

export interface AddActivityToIap {
  activityId: string;
}
