import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
} from './requests';
import { api_hostname } from '../constants';
import {
  ActivityProvider,
  ConfigInterface,
  CreateActivityProvider,
  UpdateActivityProvider,
} from '@invenira/model';

export class ActivityProvidersService {
  async getAll(token: string): Promise<ActivityProvider[]> {
    return getRequest(api_hostname + '/activity-providers', token);
  }

  async getOne(id: string, token: string): Promise<ActivityProvider> {
    return getRequest(api_hostname + '/activity-providers/' + id, token);
  }

  async delete(id: string, token: string): Promise<void> {
    return deleteRequest(api_hostname + '/activity-providers/' + id, token);
  }

  async create(
    ap: CreateActivityProvider,
    token: string,
  ): Promise<ActivityProvider> {
    return postRequest(api_hostname + '/activity-providers', token, ap);
  }

  async update(
    id: string,
    url: UpdateActivityProvider,
    token: string,
  ): Promise<ActivityProvider> {
    return patchRequest(api_hostname + '/activity-providers/' + id, token, url);
  }

  async getConfigInterfaceUrl(id: string, token: string): Promise<string> {
    return getRequest<ConfigInterface>(
      api_hostname + '/activity-providers/' + id + '/config-interface',
      token,
    ).then((r) => r.url);
  }

  async getActivityParams(id: string, token: string): Promise<string[]> {
    return getRequest(
      api_hostname + '/activity-providers/' + id + '/config-params',
      token,
    );
  }
}
