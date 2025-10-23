// JSONRPC 2.0 Client Implementation
// Based on KBase Job Browser JSONRPC implementation

import { v4 as uuid } from 'uuid';

export interface JSONRPCRequest {
  jsonrpc: '2.0';
  method: string;
  id: string;
  params?: any;
}

export interface JSONRPCSuccessResponse<T = any> {
  jsonrpc: '2.0';
  id: string;
  result: T;
  error?: never;
}

export interface JSONRPCErrorResponse {
  jsonrpc: '2.0';
  id: string;
  result?: never;
  error: {
    code: number;
    message: string;
    data?: any;
  };
}

export type JSONRPCResponse<T = any> = JSONRPCSuccessResponse<T> | JSONRPCErrorResponse;

export class JSONRPCError extends Error {
  code: number;
  data?: any;

  constructor(error: JSONRPCErrorResponse['error']) {
    super(error.message);
    this.name = 'JSONRPCError';
    this.code = error.code;
    this.data = error.data;
  }
}

export interface JSONRPCClientOptions {
  url: string;
  token?: string;
  timeout?: number;
}

export class JSONRPCClient {
  private url: string;
  private token?: string;
  private timeout: number;

  constructor(options: JSONRPCClientOptions) {
    this.url = options.url;
    this.token = options.token;
    this.timeout = options.timeout || 30000;
  }

  async call<T = any>(method: string, params?: any): Promise<T> {
    const request: JSONRPCRequest = {
      jsonrpc: '2.0',
      method,
      id: uuid(),
      params,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (this.token) {
      headers.Authorization = this.token;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: JSONRPCResponse<T> = await response.json();

      if (data.error) {
        throw new JSONRPCError(data.error);
      }

      return data.result;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof JSONRPCError) {
        throw error;
      }
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = undefined;
  }
}
