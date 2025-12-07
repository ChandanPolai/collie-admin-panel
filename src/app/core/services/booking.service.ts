// booking-history.service.ts

import { Injectable } from '@angular/core';
import { ApiManagerService } from '../utilities/api-manager';
import { Observable } from 'rxjs';
import { apiEndpoints } from '../constants/api-endpoint';
import { BookingHistoryResponse } from '../interfaces/booking.interface';

@Injectable({
  providedIn: 'root'
})
export class BookingHistoryService {
  private readonly apiUrl = 'http://localhost:2500/api/admin/getAllBookingHistory';

  constructor(private apiManager: ApiManagerService) {}

  /**
   * Get all booking history with filters and pagination
   * @param body - Request body with page, limit, status, startDate, endDate, search
   * @returns Observable<BookingHistoryResponse>
   */
  getAllBookingHistory(body: {
    page: number;
    limit: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Observable<BookingHistoryResponse> {
    return this.apiManager.post(this.apiUrl, body);
  }
}