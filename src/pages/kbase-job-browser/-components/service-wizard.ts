// ServiceWizard Client for KBase Dynamic Service Discovery

import { JSONRPCClient } from './jsonrpc20';

export interface ServiceStatus {
  git_commit_hash: string;
  status: string;
  version: string;
  hash: string;
  release_tags: string[];
  url: string;
  module_name: string;
  health: string;
  up: number;
}

export interface GetServiceStatusParams {
  module_name: string;
  version?: string | null;
}

export class ServiceWizardClient {
  private client: JSONRPCClient;

  constructor(url: string, token?: string) {
    this.client = new JSONRPCClient({
      url,
      token,
      timeout: 30000,
      version: '1.1',
    });
  }

  async getServiceStatus(
    params: GetServiceStatusParams
  ): Promise<ServiceStatus> {
    return this.client.call<ServiceStatus>(
      'ServiceWizard.get_service_status',
      params
    );
  }

  setToken(token: string) {
    this.client.setToken(token);
  }

  clearToken() {
    this.client.clearToken();
  }
}
