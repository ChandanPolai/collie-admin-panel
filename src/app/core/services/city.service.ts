// city.service.ts

import { Injectable } from '@angular/core';
import { ApiManagerService } from '../utilities/api-manager';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { apiEndpoints } from '../constants/api-endpoint';
import {
  City,
  CreateCityRequest,
  UpdateCityRequest,
  CityResponse,
  PaginatedCityResponse,
  ToggleCityStatusRequest,
  DeleteCityRequest,
  GetCitiesByStateRequest
} from '../interfaces/city.interface';

@Injectable({
  providedIn: 'root'
})
export class CityService {
  constructor(private apiManager: ApiManagerService) {}

  /**
   * Get all cities with pagination support
   * @param params - Optional pagination parameters
   * @returns Observable<CityResponse>
   */
  getAllCities(params?: { page?: number; limit?: number }): Observable<CityResponse> {
    let url = apiEndpoints.GET_CITIES;
    
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
   * Get city by ID
   * @param id - City ID
   * @returns Observable<CityResponse>
   */
  getCityById(id: string): Observable<CityResponse> {
    const url = `${apiEndpoints.GET_CITY_BY_ID}${id}`;
    return this.apiManager.get(url);
  }

  /**
   * Create a new city
   * @param data - City creation data
   * @returns Observable<CityResponse>
   */
  createCity(data: CreateCityRequest): Observable<CityResponse> {
    return this.apiManager.post(apiEndpoints.CREATE_CITY, data);
  }

  /**
   * Update an existing city
   * @param id - City ID
   * @param data - City update data
   * @returns Observable<CityResponse>
   */
  updateCity(id: string, data: UpdateCityRequest): Observable<CityResponse> {
    const url = apiEndpoints.UPDATE_CITY.replace(':id', id);
    return this.apiManager.put(url, data);
  }

  /**
   * Toggle city status (active/inactive)
   * @param data - Toggle status request
   * @returns Observable<CityResponse>
   */
  toggleCityStatus(data: ToggleCityStatusRequest): Observable<CityResponse> {
    const url = apiEndpoints.TOGGLE_CITY_STATUS.replace(':toggle-status', data.id);
    return this.apiManager.patch(url, {});
  }

  /**
   * Delete a city
   * @param id - City ID
   * @returns Observable<CityResponse>
   */
  deleteCity(id: string): Observable<CityResponse> {
    const url = apiEndpoints.DELETE_CITY.replace(':id', id);
    return this.apiManager.delete(url);
  }

  /**
   * Get cities by state ID
   * @param stateId - State ID
   * @returns Observable<CityResponse>
   */
  getCitiesByState(stateId: string): Observable<CityResponse> {
    const url = apiEndpoints.GET_CITIES_BY_STATE.replace(':stateId', stateId);
    return this.apiManager.get(url);
  }

  /**
   * Helper method to validate city code format
   * @param code - City code to validate
   * @returns boolean
   */
  isValidCityCode(code: string): boolean {
    return !!code && code.trim().length > 0;
  }

  /**
   * Helper method to format city name
   * @param name - City name
   * @returns Formatted city name
   */
  formatCityName(name: string): string {
    return name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase();
  }
}