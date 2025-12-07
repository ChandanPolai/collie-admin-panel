import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { PlatformService } from '../../../core/services/platform.service';
import { StationService } from '../../../core/services/station.service';
import { Platform, CreatePlatformRequest } from '../../../core/interfaces/platform.interface';
import { Station } from '../../../core/interfaces/station.interface';
import { swalHelper } from '../../../core/constants/swal-helper';
import { SidebarService } from '../../../core/services/sidebar.service';

@Component({
  selector: 'app-platform',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgxPaginationModule,
    FormsModule
  ],
  templateUrl: './platform.component.html',
  styleUrls: ['./platform.component.scss']
})
export class PlatformComponent implements OnInit {
  mode: 'list' | 'create' | 'preview' = 'list';
  platforms: Platform[] = [];
  filteredPlatforms: Platform[] = [];
  allStations: Station[] = [];
  currentPlatform: Platform | null = null;
  selectedStationId: string = '';
  
  isLoading: boolean = false;
  isSidebarCollapsed: boolean = false;
  
  platformForm!: FormGroup;
  
  searchTerm: string = '';
  
  // Pagination for UI display
  paginationConfig = {
    id: 'platform-pagination',
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0
  };

  constructor(
    private fb: FormBuilder,
    private platformService: PlatformService,
    private stationService: StationService,
    private sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadStations();
    
    this.sidebarService.isCollapsed$.subscribe((isCollapsed) => {
      this.isSidebarCollapsed = isCollapsed;
    });
  }

  private initializeForm(): void {
    this.platformForm = this.fb.group({
      stationId: ['', Validators.required],
      platformNo: [1, [Validators.required, Validators.min(1)]]
    });
  }

  loadStations(): void {
    this.stationService.getAllStations().subscribe({
      next: (response) => {
        console.log('Stations Response:', response);
        this.allStations = response.data.station.filter((s: Station) => !s.isDeleted);
        console.log('Stations loaded:', this.allStations.length);
      },
      error: (err) => {
        console.error('Error loading stations:', err);
        swalHelper.messageToast('Failed to load stations', 'error');
      }
    });
  }

  onStationChange(): void {
    this.loadPlatforms();
    this.paginationConfig.currentPage = 1;
  }

  loadPlatforms(): void {
    if (!this.selectedStationId) {
      this.platforms = [];
      this.filteredPlatforms = [];
      this.isLoading = false;
      return;
    }
    
    this.isLoading = true;
    this.platformService.getPlatformsByStation(this.selectedStationId).subscribe({
      next: (response) => {
        console.log('Platforms Response:', response);
        this.platforms = response.data.platforms?.filter((p: Platform) => !p.isDeleted) || [];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading platforms:', err);
        swalHelper.messageToast(err?.message ?? 'Failed to load platforms.', 'error');
        this.platforms = [];
        this.filteredPlatforms = [];
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.platforms];

    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(platform => 
        platform.platformNumber.toString().toLowerCase().includes(search)
      );
    }

    this.filteredPlatforms = filtered;
    this.paginationConfig.totalItems = this.filteredPlatforms.length;
    this.paginationConfig.currentPage = 1;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  onPageChange(page: number): void {
    this.paginationConfig.currentPage = page;
  }

  onPageSizeChange(): void {
    this.paginationConfig.currentPage = 1;
  }

  createNew(): void {
    this.mode = 'create';
    this.platformForm.reset({ platformNo: 1 });
  }

  previewPlatform(platform: Platform): void {
    this.mode = 'preview';
    this.currentPlatform = platform;
  }

  togglePlatformStatus(platform: Platform): void {
    const currentActive = platform.isActive;
    const action = currentActive ? 'deactivate' : 'activate';
    
    swalHelper.takeConfirmation(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Platform?`,
      `Are you sure you want to ${action} Platform ${platform.platformNumber}?`
    ).then((result) => {
      if (result.isConfirmed) {
        const updateData = { isActive: !currentActive };
        this.platformService.updatePlatform(platform._id, updateData).subscribe({
          next: (response) => {
            swalHelper.showToast(response.message || `Platform ${action}d successfully`, 'success');
            this.loadPlatforms();
          },
          error: (err) => {
            swalHelper.messageToast(err?.message ?? `Failed to ${action} platform`, 'error');
          }
        });
      }
    });
  }

  onSubmit(): void {
    if (this.platformForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      const formValue = this.platformForm.value;
      const data: CreatePlatformRequest = {
        stationId: formValue.stationId,
        platformNo: Number(formValue.platformNo)
      };

      this.platformService.createPlatformsForStation(data).subscribe({
        next: (response) => {
          swalHelper.showToast(response.message || 'Platforms created successfully', 'success');
          this.isLoading = false;
          this.platformForm.reset({ platformNo: 1 });
          this.selectedStationId = data.stationId;
          this.loadPlatforms();
          this.mode = 'list';
        },
        error: (err) => {
          swalHelper.messageToast(err?.message ?? 'Failed to create platforms.', 'error');
          this.isLoading = false;
        }
      });
    } else {
      this.markAllFieldsAsTouched();
      swalHelper.error('Please fill in all required fields correctly');
    }
  }

  getStationName(stationId: string): string {
    return this.allStations.find(s => s._id === stationId)?.name || 'Unknown Station';
  }

  getStationCode(stationId: string): string {
    return this.allStations.find(s => s._id === stationId)?.code || 'N/A';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.platformForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.platformForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${this.getFieldDisplayName(fieldName)} is required`;
      if (field.errors['min']) return `At least ${field.errors['min'].min} platform(s) required`;
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      stationId: 'Station',
      platformNo: 'Number of platforms'
    };
    return fieldNames[fieldName] || fieldName;
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.platformForm.controls).forEach(key => {
      this.platformForm.get(key)?.markAsTouched();
    });
  }

  resetForm(): void {
    this.platformForm.reset({ platformNo: 1 });
    this.currentPlatform = null;
  }

  cancelForm(): void {
    this.resetForm();
    this.mode = 'list';
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

  getStatusClass(isActive: boolean): string {
    return isActive ? 'tw-bg-green-100 tw-text-green-800' : 'tw-bg-red-100 tw-text-red-800';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }
}