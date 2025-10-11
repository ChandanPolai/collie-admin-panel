// city.interface.ts

import { State } from './state.interface';

export interface City {
  _id?: string;
  stateId: string | State;
  name: string;
  code: string;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCityRequest {
  stateId: string;
  name: string;
  code: string;
}

export interface UpdateCityRequest {
  stateId?: string;
  name?: string;
  code?: string;
  isDeleted?: boolean;
}

// city.service.ts - Update the response interfaces

export interface PaginatedCityResponse {
  message: string;
  data: {
    docs: City[];
    totalDocs: string | number;
    limit: string | number;
    totalPages: string | number;
    page: string | number;
    pagingCounter: string | number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: string | number | null;
    nextPage: string | number | null;
  };
  status: number;
}

export interface CityResponse {
  message: string;
  data: City | City[] | PaginatedCityResponse['data'] | null;
  status: number;
}

export interface ToggleCityStatusRequest {
  id: string;
}

export interface DeleteCityRequest {
  id: string;
}

export interface GetCitiesByStateRequest {
  stateId: string;
}