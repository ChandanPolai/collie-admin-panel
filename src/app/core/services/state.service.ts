// state.service.ts

import { Injectable } from '@angular/core';
import { ApiManagerService } from '../utilities/api-manager';
import { Observable } from 'rxjs';
import { apiEndpoints } from '../constants/api-endpoint';
import {
  State,
  CreateStateRequest,
  UpdateStateRequest,
  StateResponse,
  PaginatedStateResponse,
  ToggleStateStatusRequest,
  DeleteStateRequest
} from '../interfaces/state.interface';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  constructor(private apiManager: ApiManagerService) {}

  /**
   * Get all states with pagination support
   * @param params - Optional pagination parameters
   * @returns Observable<StateResponse>
   */
  getAllStates(params?: { page?: number; limit?: number }): Observable<StateResponse> {
    let url = apiEndpoints.GET_STATES;
    
    // Add pagination params if provided
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      if (queryParams.toString()) {
        url += '?' + queryParams.toString();
      }
    }
    
    return this.apiManager.get(url);
  }

  /**
   * Get state by ID
   * @param id - State ID
   * @returns Observable<StateResponse>
   */
  getStateById(id: string): Observable<StateResponse> {
    const url = apiEndpoints.GET_STATE_BY_ID.replace(':id', id);
    return this.apiManager.get(url);
  }

  /**
   * Create a new state
   * @param data - State creation data
   * @returns Observable<StateResponse>
   */
  createState(data: CreateStateRequest): Observable<StateResponse> {
    return this.apiManager.post(apiEndpoints.CREATE_STATE, data);
  }

  /**
   * Update an existing state
   * @param id - State ID
   * @param data - State update data
   * @returns Observable<StateResponse>
   */
  updateState(id: string, data: UpdateStateRequest): Observable<StateResponse> {
    const url = apiEndpoints.UPDATE_STATE.replace(':id', id);
    return this.apiManager.put(url, data);
  }

  /**
   * Toggle state status (active/inactive)
   * @param data - Toggle status request
   * @returns Observable<StateResponse>
   */
  toggleStateStatus(data: ToggleStateStatusRequest): Observable<StateResponse> {
    const url = apiEndpoints.TOGGLE_STATE_STATUS.replace(':toggle-status', data.id);
    return this.apiManager.patch(url, {});
  }

  /**
   * Delete a state
   * @param id - State ID
   * @returns Observable<StateResponse>
   */
  deleteState(id: string): Observable<StateResponse> {
    const url = apiEndpoints.DELETE_STATE.replace(':id', id);
    return this.apiManager.delete(url);
  }

  /**
   * Helper method to validate state code format
   * @param code - State code to validate
   * @returns boolean
   */
  isValidStateCode(code: string): boolean {
    return !!code && code.trim().length > 0;
  }
}