export interface BaseRequest {
  [key: string]: any;
}

export interface PaginatableRequest extends BaseRequest {
  limit: number;
  offset: number;
  fields: string;
}
