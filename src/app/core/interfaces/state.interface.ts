// state.interface.ts

export interface State {
  _id?: string;
  name: string;
  code: string;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStateRequest {
  name: string;
  code: string;
}

export interface UpdateStateRequest {
  name?: string;
  code?: string;
  isDeleted?: boolean;
}

// state.service.ts - Update the response interfaces

export interface PaginatedStateResponse {
  message: string;
  data: {
    docs: State[];
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

export interface StateResponse {
  message: string;
  data: State | State[] | PaginatedStateResponse['data'] | null;
  status: number;
}

export interface ToggleStateStatusRequest {
  id: string;
}

export interface DeleteStateRequest {
  id: string;
}