// platform.service.ts

import { Injectable } from '@angular/core';
import { ApiManagerService } from '../utilities/api-manager';
import { Observable } from 'rxjs';
import { apiEndpoints } from '../constants/api-endpoint';
import {
  Platform,
  CreatePlatformRequest,
  UpdatePlatformRequest,
  PlatformResponse
} from '../interfaces/platform.interface';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {
  constructor(private apiManager: ApiManagerService) {}

  /**
   * Get platforms by station ID
   * @param stationId - Station ID
   * @returns Observable<PlatformResponse>
   */
  getPlatformsByStation(stationId: string): Observable<PlatformResponse> {
    const url = apiEndpoints.PLATFORM_GET_BY_STATION.replace(':stationId', stationId);
    return this.apiManager.get(url);
  }

  /**
   * Create platforms for a station
   * @param data - Creation data
   * @returns Observable<PlatformResponse>
   */
  createPlatformsForStation(data: CreatePlatformRequest): Observable<PlatformResponse> {
    return this.apiManager.post(apiEndpoints.PLATFORM_CREATE_FOR_STATION, data);
  }

  /**
   * Update a platform
   * @param platformId - Platform ID
   * @param data - Update data
   * @returns Observable<PlatformResponse>
   */
  updatePlatform(platformId: string, data: UpdatePlatformRequest): Observable<PlatformResponse> {
    const url = apiEndpoints.PLATFORM_UPDATE.replace(':id', platformId);
    return this.apiManager.put(url, data);
  }
}