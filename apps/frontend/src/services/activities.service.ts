import {deleteRequest, getRequest, patchRequest, postRequest} from "./requests.ts";
import {api_hostname} from "../constants.ts";

export class ActivitiesService {
    async getAll(token: string): Promise<any[]> {
        return getRequest(api_hostname + '/activities', token).then(r => r.json());
    }

    async delete(id: string, token: string): Promise<void> {
        return deleteRequest(api_hostname + '/activities/' + id, token).then(r => r.json());
    }

    async create(activity: {
        name: string;
        activityProviderId: string;
        parameters: any;
    }, token: string): Promise<void> {
        return postRequest(api_hostname + '/activities', token, activity).then(null);
    }

    async update(id: string, parameters: Map<string, any>, token: string): Promise<void> {
        return patchRequest(api_hostname + '/activities/' + id, token, {parameters}).then(r => r.json());
    }
}