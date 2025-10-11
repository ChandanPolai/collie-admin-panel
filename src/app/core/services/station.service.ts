// station.service.ts

import { Injectable } from '@angular/core';
import { ApiManagerService } from '../utilities/api-manager';
import { Observable } from 'rxjs';
import { apiEndpoints } from '../constants/api-endpoint';
import {
  Station,
  CreateStationRequest,
  StationResponse,
  AllStationsResponse
} from '../interfaces/station.interface';

@Injectable({
  providedIn: 'root'
})
export class StationService {
  constructor(private apiManager: ApiManagerService) {}

  /**
   * Create a new station
   * @param data - Station creation data
   * @returns Observable<StationResponse>
   */
  createStation(data: CreateStationRequest): Observable<StationResponse> {
    return this.apiManager.post(apiEndpoints.CREATE_STATION, data);
  }

  /**
   * Get all stations
   * @returns Observable<AllStationsResponse>
   */
  getAllStations(): Observable<AllStationsResponse> {
    return this.apiManager.get(apiEndpoints.GET_ALL_STATION);
  }

  /**
   * Helper method to validate station code format
   * @param code - Station code to validate
   * @returns boolean
   */
  isValidStationCode(code: string): boolean {
    return !!code && code.trim().length > 0;
  }

  /**
   * Helper method to check if coordinates are valid
   * @param latitude - Latitude value
   * @param longitude - Longitude value
   * @returns boolean
   */
  areCoordinatesValid(latitude?: number, longitude?: number): boolean {
    if (latitude === undefined || longitude === undefined) return false;
    return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  }
}