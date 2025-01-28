import { CreateObjective, Iap, Objective } from '@invenira/model';
import { deleteRequest, getRequest, postRequest } from './requests';
import { api_hostname } from '../constants';

export class ObjectivesService {
  async create(objective: CreateObjective, token: string): Promise<Iap> {
    return postRequest(api_hostname + '/objectives', token, objective);
  }

  async getAll(token: string): Promise<Objective[]> {
    return getRequest(api_hostname + '/objectives', token);
  }

  async delete(id: string, token: string): Promise<void> {
    return deleteRequest(api_hostname + '/objectives/' + id, token);
  }
}
