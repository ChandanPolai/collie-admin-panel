import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { BookingHistoryService } from '../../../core/services/booking.service';
import { Booking, BookingHistoryResponse } from '../../../core/interfaces/booking.interface';
import { swalHelper } from '../../../core/constants/swal-helper';
import { SidebarService } from '../../../core/services/sidebar.service';

@Component({
  selector: 'app-booking-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    NgxPaginationModule
  ],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingHistoryComponent implements OnInit {
  mode: 'list' | 'preview' = 'list';
  bookings: Booking[] = [];
  currentBooking: Booking | null = null;
  
  isLoading: boolean = false;
  isSidebarCollapsed: boolean = false;
  
  // Filters
  searchTerm: string = '';
  filterStatus: string = 'all';
  startDate: string = '';
  endDate: string = '';
  
  statusOptions = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Cancelled', value: 'cancelled' },
    { label: 'Active', value: 'active' }
  ];
  
  // Pagination (server-side)
  paginationConfig = {
    page: 1,
    limit: 10
  };
  
  totalBookings: number = 0;
  statistics: any = null;
Object: any;

  constructor(
    private bookingHistoryService: BookingHistoryService,
    private sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    this.loadBookings();
    
    this.sidebarService.isCollapsed$.subscribe((isCollapsed) => {
      this.isSidebarCollapsed = isCollapsed;
    });
  }

  loadBookings(): void {
    this.isLoading = true;
    
    const requestBody: any = {
      page: this.paginationConfig.page,
      limit: this.paginationConfig.limit
    };

    // Add filters if present
    if (this.filterStatus && this.filterStatus !== 'all') {
      requestBody.status = this.filterStatus;
    }
    if (this.startDate) {
      requestBody.startDate = this.startDate;
    }
    if (this.endDate) {
      requestBody.endDate = this.endDate;
    }
    if (this.searchTerm.trim()) {
      requestBody.search = this.searchTerm.trim();
    }

    this.bookingHistoryService.getAllBookingHistory(requestBody).subscribe({
      next: (response: BookingHistoryResponse) => {
        console.log('Bookings Response:', response);
        
        if (response.data) {
          this.bookings = response.data.bookings || [];
          this.totalBookings = response.data?.pagination?.totalBookings || 0;
          this.statistics = response.data?.statistics;
          
          console.log('✅ Bookings loaded:', this.bookings.length);
          console.log('Total bookings:', this.totalBookings);
        } else {
          this.bookings = [];
          this.totalBookings = 0;
          this.statistics = null;
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error loading bookings:', err);
        swalHelper.messageToast(err?.message ?? 'Failed to load bookings.', 'error');
        this.bookings = [];
        this.totalBookings = 0;
        this.statistics = null;
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.paginationConfig.page = 1;
    this.loadBookings();
  }

  onStatusFilterChange(): void {
    this.paginationConfig.page = 1;
    this.loadBookings();
  }

  onDateFilterChange(): void {
    this.paginationConfig.page = 1;
    this.loadBookings();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterStatus = 'all';
    this.startDate = '';
    this.endDate = '';
    this.paginationConfig.page = 1;
    this.loadBookings();
  }

  onPageChange(page: number): void {
    this.paginationConfig.page = page;
    this.loadBookings();
  }

  onPageSizeChange(): void {
    this.paginationConfig.page = 1;
    this.loadBookings();
  }

  previewBooking(booking: Booking): void {
    this.mode = 'preview';
    this.currentBooking = booking;
  }

  cancelPreview(): void {
    this.mode = 'list';
    this.currentBooking = null;
  }

  formatDate(date: string | null | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      pending: 'tw-bg-yellow-100 tw-text-yellow-800',
      accepted: 'tw-bg-blue-100 tw-text-blue-800',
      'in-progress': 'tw-bg-purple-100 tw-text-purple-800',
      completed: 'tw-bg-green-100 tw-text-green-800',
      rejected: 'tw-bg-red-100 tw-text-red-800',
      cancelled: 'tw-bg-gray-100 tw-text-gray-800',
      active: 'tw-bg-indigo-100 tw-text-indigo-800'
    };
    return classes[status] || 'tw-bg-gray-100 tw-text-gray-800';
  }

  getStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      pending: 'Pending',
      accepted: 'Accepted',
      'in-progress': 'In Progress',
      completed: 'Completed',
      rejected: 'Rejected',
      cancelled: 'Cancelled',
      active: 'Active'
    };
    return texts[status] || status.charAt(0).toUpperCase() + status.slice(1);
  }
}