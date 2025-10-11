// collie.service.ts

import { Injectable } from '@angular/core';
import { ApiManagerService } from '../utilities/api-manager';
import { Observable } from 'rxjs';
import { apiEndpoints } from '../constants/api-endpoint';
import {
  Collie,
  CollieRegisterRequest,
  CollieResponse,
  PendingApprovalsResponse,
  UpdateRatesRequest,
  PerformanceReportRequest,
  PerformanceReportResponse
} from '../interfaces/collie.interface';

@Injectable({
  providedIn: 'root'
})
export class CollieService {
  constructor(private apiManager: ApiManagerService) {}

  /**
   * Register a new collie with image upload
   * @param formData - Form data containing collie details and image
   * @returns Observable<CollieResponse>
   */
  registerCollie(formData: FormData): Observable<CollieResponse> {
    return this.apiManager.post(apiEndpoints.COLLIE_REGISTER, formData);
  }

  /**
   * Get all collies pending approval
   * @returns Observable<PendingApprovalsResponse>
   */
  getPendingApprovals(): Observable<PendingApprovalsResponse> {
    return this.apiManager.get(apiEndpoints.PENDING_APPROVALS);
  }

  /**
   * Approve a collie by ID
   * @param collieId - The ID of the collie to approve
   * @returns Observable<CollieResponse>
   */
  approveCollie(collieId: string): Observable<CollieResponse> {
    const url = apiEndpoints.APPROVE_COLLIE.replace(':collieId', collieId);
    return this.apiManager.get(url);
  }

  /**
   * Update rate card for all collies in a station
   * @param data - Station ID and new rates
   * @returns Observable<CollieResponse>
   */
  updateStationRates(data: UpdateRatesRequest): Observable<CollieResponse> {
    return this.apiManager.post(apiEndpoints.UPDATE_RATES, data);
  }

  /**
   * Get performance report for all approved collies
   * @param params - Optional date range filter
   * @returns Observable<PerformanceReportResponse>
   */
  getPerformanceReport(params?: PerformanceReportRequest): Observable<PerformanceReportResponse> {
    const queryParams = params ? `?startDate=${params.startDate}&endDate=${params.endDate}` : '';
    return this.apiManager.get(`${apiEndpoints.PERFORMANCE_REPORT}${queryParams}`);
  }

  /**
   * Helper method to create FormData for collie registration
   * @param collieData - Collie registration data
   * @param imageFile - Image file
   * @returns FormData
   */
  createCollieFormData(collieData: CollieRegisterRequest, imageFile: File): FormData {
    const formData = new FormData();
    
    formData.append('name', collieData.name);
    formData.append('mobileNo', collieData.mobileNo);
    formData.append('age', collieData.age.toString());
    formData.append('deviceType', collieData.deviceType);
    formData.append('gender', collieData.gender);
    formData.append('buckleNumber', collieData.buckleNumber);
    formData.append('address', collieData.address);
    formData.append('stationId', collieData.stationId);
    
    if (collieData.emailId) {
      formData.append('emailId', collieData.emailId);
    }
    
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    return formData;
  }
}