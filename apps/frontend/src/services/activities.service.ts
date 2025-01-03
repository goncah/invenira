import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
} from './requests';
import { api_hostname } from '../constants';
import { Activity, CreateActivity, UpdateActivity } from '@invenira/model';

export class ActivitiesService {
  async getAll(token: string): Promise<Activity[]> {
    return getRequest(api_hostname + '/activities', token);
  }

  async delete(id: string, token: string): Promise<void> {
    return deleteRequest(api_hostname + '/activities/' + id, token);
  }

  async create(activity: CreateActivity, token: string): Promise<Activity> {
    return postRequest(api_hostname + '/activities', token, activity);
  }

  async update(
    id: string,
    updateActivity: UpdateActivity,
    token: string,
  ): Promise<Activity> {
    return patchRequest(
      api_hostname + '/activities/' + id,
      token,
      updateActivity,
    );
  }
}
