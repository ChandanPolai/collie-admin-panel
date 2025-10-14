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
   * Update geofence for a station (circle or polygon)
   */
  updateStationGeofence(payload: {
    stationId: string;
    latitude?: number | null;
    longitude?: number | null;
    geofenceRadius?: number | null;
    geofencePolygon?: number[][][] | null;
    geofenceType: 'circle' | 'polygon';
  }): Observable<StationResponse> {
    return this.apiManager.post(apiEndpoints.UPDATE_STATION_GEOFENCE, payload);
  }

  /**
   * Get geofence details for a station
   */
  getStationGeofence(stationId: string): Observable<StationResponse> {
    const url = apiEndpoints.GET_STATION_GEOFENCE.replace(':stationId', stationId);
    return this.apiManager.get(url);
  }

  /**
   * Delete/reset geofence for a station
   */
  deleteStationGeofence(stationId: string): Observable<StationResponse> {
    return this.apiManager.post(apiEndpoints.DELETE_STATION_GEOFENCE, { stationId });
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