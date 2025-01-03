import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
} from './requests';
import { api_hostname } from '../constants';

export class IAPsService {
  async getAll(token: string): Promise<any[]> {
    return getRequest(api_hostname + '/iaps', token).then((r) => r.json());
  }

  async getOne(id: string, token: string): Promise<any> {
    return getRequest(api_hostname + '/iaps/' + id, token).then((r) =>
      r.json(),
    );
  }

  async delete(id: string, token: string): Promise<void> {
    return deleteRequest(api_hostname + '/iaps/' + id, token);
  }

  async create(
    iap: {
      name: string;
      description: string;
    },
    token: string,
  ): Promise<any> {
    return postRequest(api_hostname + '/iaps', token, iap).then((r) =>
      r.json(),
    );
  }

  async update(
    id: string,
    iap: {
      name: string;
      description: string;
    },
    token: string,
  ): Promise<void> {
    return patchRequest(api_hostname + '/iaps/' + id, token, iap).then((r) =>
      r.json(),
    );
  }

  async addActivity(
    id: string,
    activityId: string,
    token: string,
  ): Promise<any[]> {
    return postRequest(api_hostname + '/iaps/' + id + '/activities', token, {
      activityId,
    }).then((r) => r.json());
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

  async deploy(id: string, token: string): Promise<any[]> {
    return patchRequest(
      api_hostname + '/iaps/' + id + '/deploy',
      token,
      {},
    ).then((r) => r.json());
  }
}
