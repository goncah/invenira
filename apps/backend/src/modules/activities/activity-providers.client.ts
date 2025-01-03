import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosInstance } from 'axios';
import { Injectable } from '@nestjs/common';
import {
  httpPathConfigInterface,
  httpPathConfigPar,
  httpPathDeployActivity,
} from '../../config.defaults';

@Injectable()
export class ActivityProvidersClient {
  private readonly axios: AxiosInstance;
  private readonly pathConfigPar: string;
  private readonly pathConfigInterface: string;
  private readonly pathDeployActivity: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.axios = this.httpService.axiosRef as AxiosInstance; // required for ncc
    this.pathConfigPar =
      this.configService.get<string>('APC_PATH_CONFIG_PAR') ||
      httpPathConfigPar;

    if (!this.pathConfigPar.startsWith('/')) {
      this.pathConfigPar = '/' + this.pathConfigPar;
    }

    if (this.pathConfigPar.endsWith('/')) {
      this.pathConfigPar = this.pathConfigPar.substring(
        0,
        this.pathConfigPar.length - 1,
      );
    }

    this.pathConfigInterface =
      this.configService.get<string>('APC_PATH_CONFIG_INTERFACE') ||
      httpPathConfigInterface;

    if (!this.pathConfigInterface.startsWith('/')) {
      this.pathConfigInterface = '/' + this.pathConfigInterface;
    }

    if (this.pathConfigInterface.endsWith('/')) {
      this.pathConfigInterface = this.pathConfigInterface.substring(
        0,
        this.pathConfigInterface.length - 1,
      );
    }

    this.pathDeployActivity =
      this.configService.get<string>('APC_PATH_DEPLOY_ACTIVITY') ||
      httpPathDeployActivity;

    if (!this.pathDeployActivity.startsWith('/')) {
      this.pathDeployActivity = '/' + this.pathDeployActivity;
    }

    if (this.pathDeployActivity.endsWith('/')) {
      this.pathDeployActivity = this.pathDeployActivity.substring(
        0,
        this.pathDeployActivity.length - 1,
      );
    }
  }

  async getActivityParameters(baseUrl: string): Promise<string[]> {
    return this.axios
      .get<Record<string, string>[]>(baseUrl + this.pathConfigPar)
      .then((response) => {
        if (response.status === 200) {
          return response.data.map((r) => r.name);
        } else {
          throw new Error(response.statusText);
        }
      });
  }

  async getConfigInterface(baseUrl: string): Promise<string> {
    // Currently we assume that the AP provides the Configuiration Interface
    // HTML on this URL, in the future we should call the AP to get the Config
    // Interface URL.
    return Promise.resolve(baseUrl + this.pathConfigInterface);
  }

  async deployActivity(baseUrl: string, activityId: string): Promise<string> {
    return this.axios
      .get<
        Record<string, any>
      >(baseUrl + this.pathDeployActivity + '/' + activityId)
      .then((response) => {
        if (response.status === 200) {
          return response.data.deployURL;
        } else {
          throw new Error(response.statusText);
        }
      });
  }
}
