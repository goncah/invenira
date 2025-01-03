import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
} from './requests';
import { api_hostname } from '../constants';

export class ActivityProvidersService {
  async getAll(token: string): Promise<any[]> {
    return getRequest(api_hostname + '/activity-providers', token).then((r) =>
      r.json(),
    );
  }

  async getOne(id: string, token: string): Promise<any[]> {
    return getRequest(api_hostname + '/activity-providers/' + id, token).then(
      (r) => r.json(),
    );
  }

  async delete(id: string, token: string): Promise<void> {
    return deleteRequest(api_hostname + '/activity-providers/' + id, token);
  }

  async create(
    ap: {
      name: string;
      url: string;
    },
    token: string,
  ): Promise<void> {
    return postRequest(api_hostname + '/activity-providers', token, ap).then(
      null,
    );
  }

  async update(id: string, url: { url: string }, token: string): Promise<void> {
    return patchRequest(
      api_hostname + '/activity-providers/' + id,
      token,
      url,
    ).then((r) => r.json());
  }

  async getConfigInterfaceUrl(id: string, token: string): Promise<string> {
    return getRequest(
      api_hostname + '/activity-providers/' + id + '/config-interface',
      token,
    )
      .then((r) => r.json())
      .then((r) => r.url);
  }

  async getActivityParams(id: string, token: string): Promise<string[]> {
    return getRequest(
      api_hostname + '/activity-providers/' + id + '/config-params',
      token,
    ).then((r) => r.json());
  }
}
