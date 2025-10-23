// JSONRPC 2.0 Client Implementation
// Based on KBase Job Browser JSONRPC implementation

import { v4 as uuid } from 'uuid';

export interface JSONRPC20Request {
  jsonrpc: '2.0';
  method: string;
  id: string;
  params?: any;
}

export interface JSONRPC11Request {
  version: '1.1';
  method: string;
  id: string;
  params: any[];
}

export type JSONRPCRequest = JSONRPC20Request | JSONRPC11Request;

export interface JSONRPC20SuccessResponse<T = any> {
  jsonrpc: '2.0';
  id: string;
  result: T;
  error?: never;
}

export interface JSONRPC20ErrorResponse {
  jsonrpc: '2.0';
  id: string;
  result?: never;
  error: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface JSONRPC11SuccessResponse<T = any> {
  version: '1.1';
  id: string;
  result: [T];
  error?: never;
}

export interface JSONRPC11ErrorResponse {
  version: '1.1';
  id: string;
  result?: never;
  error: {
    code: number;
    message: string;
    error?: any;
  };
}

export type JSONRPCResponse<T = any> =
  | JSONRPC20SuccessResponse<T>
  | JSONRPC20ErrorResponse
  | JSONRPC11SuccessResponse<T>
  | JSONRPC11ErrorResponse;

export class JSONRPCError extends Error {
  code: number;

  data?: any;

  constructor(
    error: JSONRPC20ErrorResponse['error'] | JSONRPC11ErrorResponse['error']
  ) {
    super(error.message);
    this.name = 'JSONRPCError';
    this.code = error.code;
    this.data =
      'data' in error ? error.data : 'error' in error ? error.error : undefined;
  }
}

export interface JSONRPCClientOptions {
  url: string;
  token?: string;
  timeout?: number;
  version?: '1.1' | '2.0';
}

export class JSONRPCClient {
  private url: string;

  private token?: string;

  private timeout: number;

  private version: '1.1' | '2.0';

  constructor(options: JSONRPCClientOptions) {
    this.url = options.url;
    this.token = options.token;
    this.timeout = options.timeout || 30000;
    this.version = options.version || '2.0';
  }

  async call<T = any>(method: string, params?: any): Promise<T> {
    const request: JSONRPCRequest =
      this.version === '1.1'
        ? {
            version: '1.1',
            method,
            id: uuid(),
            params: params ? [params] : [],
          }
        : {
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

      // Handle JSONRPC 1.1 response (result is an array)
      if ('version' in data && data.version === '1.1') {
        return data.result[0];
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
