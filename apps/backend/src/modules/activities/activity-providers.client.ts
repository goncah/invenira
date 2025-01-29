import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosInstance } from 'axios';
import { Injectable } from '@nestjs/common';
import {
  httpPathAnalytics,
  httpPathAnalyticsContract,
  httpPathConfigInterface,
  httpPathConfigPar,
  httpPathDeployActivity,
} from '../../config.defaults';
import {
  AnalyticsArray,
  AnalyticsArraySchema,
  AnalyticsContract,
  AnalyticsContractSchema,
} from '@invenira/model';

@Injectable()
export class ActivityProvidersClient {
  private readonly axios: AxiosInstance;
  private readonly pathConfigPar: string;
  private readonly pathConfigInterface: string;
  private readonly pathDeployActivity: string;
  private readonly pathAnalyticsContract: string;
  private readonly pathAnalytics: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.axios = this.httpService.axiosRef as AxiosInstance; // required for ncc

    this.pathAnalyticsContract =
      this.configService.get<string>('APC_PATH_ANALYTICS_CONTRACT') ||
      httpPathAnalyticsContract;

    if (!this.pathAnalyticsContract.startsWith('/')) {
      this.pathAnalyticsContract = '/' + this.pathAnalyticsContract;
    }

    this.pathAnalytics =
      this.configService.get<string>('APC_PATH_ANALYTICS') || httpPathAnalytics;

    if (!this.pathAnalytics.startsWith('/')) {
      this.pathAnalytics = '/' + this.pathAnalytics;
    }

    this.pathDeployActivity =
      this.configService.get<string>('APC_PATH_DEPLOY_ACTIVITY') ||
      httpPathDeployActivity;

    if (this.pathDeployActivity.endsWith('/')) {
      this.pathDeployActivity = this.pathDeployActivity.substring(
        0,
        this.pathDeployActivity.length - 1,
      );
    }

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

  async getAnalyticsContract(baseUrl: string): Promise<AnalyticsContract> {
    return this.axios
      .get<Record<string, string>[]>(baseUrl + this.pathAnalyticsContract)
      .then((response) => {
        if (response.status === 200) {
          return AnalyticsContractSchema.parse(
            response.data,
          ) as AnalyticsContract;
        } else {
          throw new Error(response.statusText);
        }
      });
  }

  async getAnalytics(
    baseUrl: string,
    activityId: string,
  ): Promise<AnalyticsArray> {
    return this.axios
      .post<Record<string, string>[]>(baseUrl + this.pathAnalytics, {
        activityID: activityId,
      })
      .then((response) => {
        if (response.status === 200) {
          return AnalyticsArraySchema.parse(response.data) as AnalyticsArray;
        } else {
          throw new Error(response.statusText);
        }
      });
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

  async provide(
    url: string,
    activityId: string,
    userId: string,
    params: Record<string, unknown>,
  ): Promise<string> {
    return this.axios
      .post<Record<string, string>>(url, {
        activityID: activityId,
        'Inven!RAstdID': userId,
        json_params: params,
      })
      .then((res) => {
        return res.data['deployURL'];
      });
  }
}
