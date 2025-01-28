import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
} from './requests';
import { api_hostname } from '../constants';
import { CreateIap, Iap, UpdateIap } from '@invenira/model';

export class IAPsService {
  async getAll(token: string): Promise<Iap[]> {
    return getRequest(api_hostname + '/iaps', token);
  }

  async getOne(id: string, token: string): Promise<Iap> {
    return getRequest(api_hostname + '/iaps/' + id, token);
  }

  async delete(id: string, token: string): Promise<void> {
    return deleteRequest(api_hostname + '/iaps/' + id, token);
  }

  async create(iap: CreateIap, token: string): Promise<Iap> {
    return postRequest(api_hostname + '/iaps', token, iap);
  }

  async update(id: string, iap: UpdateIap, token: string): Promise<Iap> {
    return patchRequest(api_hostname + '/iaps/' + id, token, iap);
  }

  async addActivity(
    id: string,
    activityId: string,
    token: string,
  ): Promise<Iap> {
    return postRequest(api_hostname + '/iaps/' + id + '/activities', token, {
      activityId,
    });
  }

  async removeActivity(
    id: string,
    activityId: string,
    token: string,
  ): Promise<void> {
    return deleteRequest(
      api_hostname + '/iaps/' + id + '/activities/' + activityId,
      token,
    );
  }

  async deploy(id: string, token: string): Promise<Iap> {
    return patchRequest(api_hostname + '/iaps/' + id + '/deploy', token, {});
  }

  async getMetrics(id: string, token: string): Promise<string[]> {
    return getRequest(
      api_hostname + '/iaps/' + id + '/activities/metrics',
      token,
    );
  }
}
