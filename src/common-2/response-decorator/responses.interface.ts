import { HttpStatus } from '@nestjs/common';

export interface Links {
  current: string;
  first: string;
  last: string;
  prev?: string;
  next?: string;
}

export interface Response {
  status?: string;
  message?: string;
  data?: Record<string, unknown>;
  total?: number;
  page?: number;
  limit?: number;
  links?: Links;
}

export interface ControllerResponse {
  httpStatus?: HttpStatus;
  message?: string;
  data?: any;
  total?: number;
}
