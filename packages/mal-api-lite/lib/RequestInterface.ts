/* eslint @typescript-eslint/no-explicit-any: 0 */
export interface BaseRequest {
  [key: string]: any;
}

export interface PaginatableRequest extends BaseRequest {
  limit?: number;
  offset?: number;
  fields?: string | string[];
}

export interface BaseRequester {
  get<T = any>(resource: string, param?: PaginatableRequest): Promise<T>;
  post<T = any>(resource: string, param?: PaginatableRequest): Promise<T>;
  put<T = any>(resource: string, param?: PaginatableRequest): Promise<T>;
  patch<T = any>(resource: string, param?: PaginatableRequest): Promise<T>;
  delete<T = any>(resource: string, param?: PaginatableRequest): Promise<T>;
}


export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}
