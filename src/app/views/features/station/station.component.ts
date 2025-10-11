// import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { ReactiveFormsModule, FormsModule } from '@angular/forms';
// import { NgSelectModule } from '@ng-select/ng-select';
// import { NgxPaginationModule } from 'ngx-pagination';
// import { StationService } from '../../../core/services/station.service';
// import { Station, CreateStationRequest } from '../../../core/interfaces/station.interface';
// import { swalHelper } from '../../../core/constants/swal-helper';
// import { SidebarService } from '../../../core/services/sidebar.service';
// import { ThemeService } from '../../../core/services/theme.service';

// @Component({
//   selector: 'app-station',
//   standalone: true,
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     NgSelectModule,
//     NgxPaginationModule,
//     FormsModule
//   ],
//   templateUrl: './station.component.html',
//   styleUrls: ['./station.component.scss']
// })
// export class StationComponent implements OnInit {
//   mode: 'list' | 'create' | 'edit' | 'preview' = 'list';
//   stations: Station[] = [];
//   filteredStations: Station[] = [];
//   currentStation: Station | null = null;
//   currentStationId?: string;
  
//   isLoading: boolean = false;
//   isSidebarCollapsed: boolean = false;
  
//   stationForm!: FormGroup;
  
//   searchTerm: string = '';
//   paginationConfig = {
//     id: 'station-pagination',
//     itemsPerPage: 10,
//     currentPage: 1,
//     totalItems: 0
//   };

//   // Geofence types
//   geofenceTypes = [
//     { value: 'circle', label: 'Circle (Radius-based)' },
//     { value: 'polygon', label: 'Polygon (Custom Shape)' }
//   ];

//   constructor(
//     private fb: FormBuilder,
//     private stationService: StationService,
//     private sidebarService: SidebarService,
//     private themeService: ThemeService
//   ) {}

//   ngOnInit(): void {
//     this.initializeForm();
//     this.loadStations();
    
//     this.sidebarService.isCollapsed$.subscribe((isCollapsed) => {
//       this.isSidebarCollapsed = isCollapsed;
//     });
//   }

//   private initializeForm(): void {
//     this.stationForm = this.fb.group({
//       name: ['', [Validators.required, Validators.minLength(2)]],
//       code: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-Z0-9_-]+$/)]],
//       cityId: ['', Validators.required],
//       address: [''],
//       latitude: ['', [Validators.pattern(/^-?([0-8]?[0-9]|90)(\.[0-9]{1,10})?$/)]],
//       longitude: ['', [Validators.pattern(/^-?((1[0-7][0-9])|([0-9]?[0-9]))(\.[0-9]{1,10})?$/)]],
//       geofenceRadius: [500, [Validators.min(50), Validators.max(5000)]],
//       geofenceType: ['circle', Validators.required],
//       isActive: [true]
//     });

//     // Watch geofence type changes
//     this.stationForm.get('geofenceType')?.valueChanges.subscribe(type => {
//       if (type === 'circle') {
//         this.stationForm.get('geofenceRadius')?.enable();
//       } else {
//         this.stationForm.get('geofenceRadius')?.disable();
//       }
//     });
//   }

//   loadStations(): void {
//     this.isLoading = true;
//     this.stationService.getAllStations().subscribe({
//       next: (response) => {
//         this.stations = response.data?.station || [];
//         this.filteredStations = [...this.stations];
//         this.paginationConfig.totalItems = this.filteredStations.length;
//         this.isLoading = false;
//       },
//       error: (err) => {
//         swalHelper.messageToast(err?.message ?? 'Failed to load stations.', 'error');
//         this.stations = [];
//         this.filteredStations = [];
//         this.isLoading = false;
//       }
//     });
//   }

//   onSearch(): void {
//     if (!this.searchTerm.trim()) {
//       this.filteredStations = [...this.stations];
//     } else {
//       const search = this.searchTerm.toLowerCase();
//       this.filteredStations = this.stations.filter(station => 
//         station.name.toLowerCase().includes(search) ||
//         station.code.toLowerCase().includes(search) ||
//         station.address?.toLowerCase().includes(search)
//       );
//     }
//     this.paginationConfig.totalItems = this.filteredStations.length;
//     this.paginationConfig.currentPage = 1;
//   }

//   onPageChange(page: number): void {
//     this.paginationConfig.currentPage = page;
//   }

//   onPageSizeChange(): void {
//     this.paginationConfig.currentPage = 1;
//   }

//   createNew(): void {
//     this.mode = 'create';
//     this.resetForm();
//   }

//   editStation(station: Station): void {
//     this.mode = 'edit';
//     this.currentStationId = station._id;
//     this.currentStation = station;
    
//     this.stationForm.patchValue({
//       name: station.name,
//       code: station.code,
//       cityId: station.cityId,
//       address: station.address || '',
//       latitude: station.latitude || '',
//       longitude: station.longitude || '',
//       geofenceRadius: station.geofenceRadius || 500,
//       geofenceType: station.geofenceConfig?.geofenceType || 'circle',
//       isActive: station.isActive ?? true
//     });
//   }

//   previewStation(station: Station): void {
//     this.mode = 'preview';
//     this.currentStation = station;
//   }

//   deleteStation(stationId: string, stationName: string): void {
//     swalHelper.takeConfirmation(
//       'Delete Station?',
//       `Are you sure you want to delete "${stationName}"? This action cannot be undone.`
//     ).then((result) => {
//       if (result.isConfirmed) {
//         // Note: You need to add delete endpoint in your service
//         swalHelper.showToast('Delete functionality to be implemented', 'info');
//       }
//     });
//   }

//   toggleStationStatus(station: Station): void {
//     const newStatus = !station.isActive;
//     const action = newStatus ? 'activate' : 'deactivate';
    
//     swalHelper.takeConfirmation(
//       `${action.charAt(0).toUpperCase() + action.slice(1)} Station?`,
//       `Are you sure you want to ${action} "${station.name}"?`
//     ).then((result) => {
//       if (result.isConfirmed) {
//         // Note: You need to add update status endpoint in your service
//         station.isActive = newStatus;
//         swalHelper.showToast(`Station ${action}d successfully`, 'success');
//       }
//     });
//   }

//   onSubmit(): void {
//     if (this.stationForm.valid && !this.isLoading) {
//       this.isLoading = true;
      
//       const formValue = this.stationForm.value;
      
//       const stationData: CreateStationRequest = {
//         name: formValue.name.trim(),
//         code: formValue.code.trim().toUpperCase(),
//         cityId: formValue.cityId,
//         address: formValue.address?.trim() || '',
//         latitude: formValue.latitude ? parseFloat(formValue.latitude) : undefined,
//         longitude: formValue.longitude ? parseFloat(formValue.longitude) : undefined,
//         isActive: formValue.isActive ?? true,
//         isDeleted: false
//       };

//       if (this.mode === 'create') {
//         this.stationService.createStation(stationData).subscribe({
//           next: (response) => {
//             swalHelper.showToast(response.message || 'Station created successfully', 'success');
//             this.isLoading = false;
//             this.resetForm();
//             this.loadStations();
//             this.mode = 'list';
//           },
//           error: (err) => {
//             swalHelper.messageToast(err?.message ?? 'Failed to create station.', 'error');
//             this.isLoading = false;
//           }
//         });
//       } else if (this.mode === 'edit' && this.currentStationId) {
//         // Note: You need to add update endpoint in your service
//         swalHelper.showToast('Update functionality to be implemented', 'info');
//         this.isLoading = false;
//       }
//     } else {
//       this.markAllFieldsAsTouched();
//       swalHelper.error('Please fill in all required fields correctly');
//     }
//   }

//   // Helper method for coordinate parsing
//   private parseCoordinate(coord: any): number | null {
//     if (coord === null || coord === undefined || coord === '') return null;
//     const num = typeof coord === 'string' ? parseFloat(coord) : coord;
//     return isNaN(num) ? null : num;
//   }

//   // Validation helpers
//   isFieldInvalid(fieldName: string): boolean {
//     const field = this.stationForm.get(fieldName);
//     return !!(field?.invalid && field?.touched);
//   }

//   getFieldError(fieldName: string): string {
//     const field = this.stationForm.get(fieldName);
//     if (field?.errors) {
//       if (field.errors['required']) return `${this.getFieldDisplayName(fieldName)} is required`;
//       if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} characters required`;
//       if (field.errors['pattern']) {
//         if (fieldName === 'code') return 'Code must be uppercase letters, numbers, hyphens or underscores only';
//         return 'Please enter a valid value';
//       }
//       if (field.errors['min']) return `Minimum value is ${field.errors['min'].min}`;
//       if (field.errors['max']) return `Maximum value is ${field.errors['max'].max}`;
//     }
//     return '';
//   }

//   private getFieldDisplayName(fieldName: string): string {
//     const fieldNames: { [key: string]: string } = {
//       name: 'Station name',
//       code: 'Station code',
//       cityId: 'City',
//       address: 'Address',
//       latitude: 'Latitude',
//       longitude: 'Longitude',
//       geofenceRadius: 'Geofence radius',
//       geofenceType: 'Geofence type'
//     };
//     return fieldNames[fieldName] || fieldName;
//   }

//   private markAllFieldsAsTouched(): void {
//     Object.keys(this.stationForm.controls).forEach(key => {
//       this.stationForm.get(key)?.markAsTouched();
//     });
//   }

//   resetForm(): void {
//     this.stationForm.reset({
//       name: '',
//       code: '',
//       cityId: '',
//       address: '',
//       latitude: '',
//       longitude: '',
//       geofenceRadius: 500,
//       geofenceType: 'circle',
//       isActive: true
//     });
//     this.currentStationId = undefined;
//     this.currentStation = null;
//   }

//   cancelForm(): void {
//     this.resetForm();
//     this.mode = 'list';
//   }

//   formatDate(date: string | null | undefined): string {
//     if (!date) return 'N/A';
//     return new Date(date).toLocaleDateString('en-IN', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   }

//   getStatusClass(isActive: boolean | undefined): string {
//     return isActive ? 'tw-bg-green-100 tw-text-green-800' : 'tw-bg-red-100 tw-text-red-800';
//   }

//   getStatusText(isActive: boolean | undefined): string {
//     return isActive ? 'Active' : 'Inactive';
//   }

//   getGeofenceTypeLabel(type: string | undefined): string {
//     const geofence = this.geofenceTypes.find(g => g.value === type);
//     return geofence?.label || 'Circle';
//   }

//   formatCoordinate(coord: number | null | undefined): string {
//     const parsed = this.parseCoordinate(coord);
//     if (parsed === null) return 'N/A';
//     return parsed.toFixed(6);
//   }

//   hasCoordinates(station: Station): boolean {
//     const lat = this.parseCoordinate(station.latitude);
//     const lng = this.parseCoordinate(station.longitude);
//     return lat !== null && lng !== null;
//   }

//   openInMap(station: Station): void {
//     const lat = this.parseCoordinate(station.latitude);
//     const lng = this.parseCoordinate(station.longitude);
    
//     if (lat !== null && lng !== null) {
//       const url = `https://www.google.com/maps?q=${lat},${lng}`;
//       window.open(url, '_blank');
//     } else {
//       swalHelper.showToast('Coordinates not available', 'error');
//     }
//   }

//   copyCoordinates(station: Station): void {
//     const lat = this.parseCoordinate(station.latitude);
//     const lng = this.parseCoordinate(station.longitude);
    
//     if (lat !== null && lng !== null) {
//       const coords = `${lat}, ${lng}`;
//       navigator.clipboard.writeText(coords).then(() => {
//         swalHelper.showToast('Coordinates copied to clipboard', 'success');
//       }).catch(() => {
//         swalHelper.showToast('Failed to copy coordinates', 'error');
//       });
//     } else {
//       swalHelper.showToast('Coordinates not available', 'error');
//     }
//   }
// }


import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { StationService } from '../../../core/services/station.service';
import { CityService } from '../../../core/services/city.service';
import { Station, CreateStationRequest } from '../../../core/interfaces/station.interface';
import { City } from '../../../core/interfaces/city.interface';
import { swalHelper } from '../../../core/constants/swal-helper';
import { SidebarService } from '../../../core/services/sidebar.service';

@Component({
  selector: 'app-station',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgxPaginationModule,
    FormsModule
  ],
  templateUrl: './station.component.html',
  styleUrls: ['./station.component.scss']
})
export class StationComponent implements OnInit {
  mode: 'list' | 'create' | 'edit' | 'preview' = 'list';
  stations: Station[] = [];
  filteredStations: Station[] = [];
  cities: City[] = [];
  currentStation: Station | null = null;
  currentStationId?: string;
  
  isLoading: boolean = false;
  isSidebarCollapsed: boolean = false;
  
  stationForm!: FormGroup;
  
  searchTerm: string = '';
  paginationConfig = {
    id: 'station-pagination',
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0
  };

  geofenceTypes = [
    { value: 'circle', label: 'Circle (Radius-based)' },
    { value: 'polygon', label: 'Polygon (Custom Shape)' }
  ];

  constructor(
    private fb: FormBuilder,
    private stationService: StationService,
    private cityService: CityService,
    private sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadStations();
    this.loadCities();
    
    this.sidebarService.isCollapsed$.subscribe((isCollapsed) => {
      this.isSidebarCollapsed = isCollapsed;
    });
  }

  private initializeForm(): void {
    this.stationForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      code: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-Z0-9_-]+$/)]],
      cityId: ['', Validators.required],
      address: [''],
      latitude: ['', [Validators.pattern(/^-?([0-8]?[0-9]|90)(\.[0-9]{1,10})?$/)]],
      longitude: ['', [Validators.pattern(/^-?((1[0-7][0-9])|([0-9]?[0-9]))(\.[0-9]{1,10})?$/)]],
      geofenceRadius: [500, [Validators.min(50), Validators.max(5000)]],
      geofenceType: ['circle', Validators.required],
      isActive: [true]
    });

    this.stationForm.get('geofenceType')?.valueChanges.subscribe(type => {
      if (type === 'circle') {
        this.stationForm.get('geofenceRadius')?.enable();
      } else {
        this.stationForm.get('geofenceRadius')?.disable();
      }
    });
  }

  loadCities(): void {
    this.isLoading = true;
    this.cityService.getAllCities({ limit: 100 }).subscribe({
      next: (response) => {
        const data = response.data as any;
        this.cities = Array.isArray(data) ? data : data.docs || [];
        this.isLoading = false;
      },
      error: (err) => {
        swalHelper.messageToast(err?.message ?? 'Failed to load cities.', 'error');
        this.cities = [];
        this.isLoading = false;
      }
    });
  }

  loadStations(): void {
    this.isLoading = true;
    this.stationService.getAllStations().subscribe({
      next: (response) => {
        this.stations = response.data?.station || [];
        this.filteredStations = [...this.stations];
        this.paginationConfig.totalItems = this.filteredStations.length;
        this.isLoading = false;
      },
      error: (err) => {
        swalHelper.messageToast(err?.message ?? 'Failed to load stations.', 'error');
        this.stations = [];
        this.filteredStations = [];
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredStations = [...this.stations];
    } else {
      const search = this.searchTerm.toLowerCase();
      this.filteredStations = this.stations.filter(station => 
        station.name.toLowerCase().includes(search) ||
        station.code.toLowerCase().includes(search) ||
        station.address?.toLowerCase().includes(search) ||
        this.getCityName(station.cityId).toLowerCase().includes(search)
      );
    }
    this.paginationConfig.totalItems = this.filteredStations.length;
    this.paginationConfig.currentPage = 1;
  }

  onPageChange(page: number): void {
    this.paginationConfig.currentPage = page;
  }

  onPageSizeChange(): void {
    this.paginationConfig.currentPage = 1;
  }

  createNew(): void {
    this.mode = 'create';
    this.resetForm();
  }

  editStation(station: Station): void {
    this.mode = 'edit';
    this.currentStationId = station._id;
    this.currentStation = station;
    
    this.stationForm.patchValue({
      name: station.name,
      code: station.code,
      cityId: station.cityId,
      address: station.address || '',
      latitude: station.latitude || '',
      longitude: station.longitude || '',
      geofenceRadius: station.geofenceRadius || 500,
      geofenceType: station.geofenceConfig?.geofenceType || 'circle',
      isActive: station.isActive ?? true
    });
  }

  previewStation(station: Station): void {
    this.mode = 'preview';
    this.currentStation = station;
  }

  onSubmit(): void {
    if (this.stationForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      const formValue = this.stationForm.value;
      
      const stationData: CreateStationRequest = {
        name: formValue.name.trim(),
        code: formValue.code.trim().toUpperCase(),
        cityId: formValue.cityId,
        address: formValue.address?.trim() || '',
        latitude: this.parseCoordinate(formValue.latitude) ?? undefined,
        longitude: this.parseCoordinate(formValue.longitude) ?? undefined,
        isActive: formValue.isActive ?? true,
        isDeleted: false
      };

      if (this.mode === 'create') {
        this.stationService.createStation(stationData).subscribe({
          next: (response) => {
            swalHelper.showToast(response.message || 'Station created successfully', 'success');
            this.isLoading = false;
            this.resetForm();
            this.loadStations();
            this.mode = 'list';
          },
          error: (err) => {
            swalHelper.messageToast(err?.message ?? 'Failed to create station.', 'error');
            this.isLoading = false;
          }
        });
      } else if (this.mode === 'edit' && this.currentStationId) {
        // Since updateStation is not available in StationService, show a message
        swalHelper.showToast('Update functionality is not implemented', 'info');
        this.isLoading = false;
      }
    } else {
      this.markAllFieldsAsTouched();
      swalHelper.error('Please fill in all required fields correctly');
    }
  }

  private parseCoordinate(coord: any): number | null {
    if (coord === null || coord === undefined || coord === '') return null;
    const num = typeof coord === 'string' ? parseFloat(coord) : coord;
    return isNaN(num) ? null : num;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.stationForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.stationForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${this.getFieldDisplayName(fieldName)} is required`;
      if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} characters required`;
      if (field.errors['pattern']) {
        if (fieldName === 'code') return 'Code must be uppercase letters, numbers, hyphens or underscores only';
        return 'Please enter a valid value';
      }
      if (field.errors['min']) return `Minimum value is ${field.errors['min'].min}`;
      if (field.errors['max']) return `Maximum value is ${field.errors['max'].max}`;
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      name: 'Station name',
      code: 'Station code',
      cityId: 'City',
      address: 'Address',
      latitude: 'Latitude',
      longitude: 'Longitude',
      geofenceRadius: 'Geofence radius',
      geofenceType: 'Geofence type'
    };
    return fieldNames[fieldName] || fieldName;
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.stationForm.controls).forEach(key => {
      this.stationForm.get(key)?.markAsTouched();
    });
  }

  resetForm(): void {
    this.stationForm.reset({
      name: '',
      code: '',
      cityId: '',
      address: '',
      latitude: '',
      longitude: '',
      geofenceRadius: 500,
      geofenceType: 'circle',
      isActive: true
    });
    this.currentStationId = undefined;
    this.currentStation = null;
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

  getStatusClass(isActive: boolean | undefined): string {
    return isActive ? 'tw-bg-green-100 tw-text-green-800' : 'tw-bg-red-100 tw-text-red-800';
  }

  getStatusText(isActive: boolean | undefined): string {
    return isActive ? 'Active' : 'Inactive';
  }

  getGeofenceTypeLabel(type: string | undefined): string {
    const geofence = this.geofenceTypes.find(g => g.value === type);
    return geofence?.label || 'Circle';
  }

  formatCoordinate(coord: number | null | undefined): string {
    const parsed = this.parseCoordinate(coord);
    if (parsed === null) return 'N/A';
    return parsed.toFixed(6);
  }

  hasCoordinates(station: Station): boolean {
    const lat = this.parseCoordinate(station.latitude);
    const lng = this.parseCoordinate(station.longitude);
    return lat !== null && lng !== null;
  }

  openInMap(station: Station): void {
    const lat = this.parseCoordinate(station.latitude);
    const lng = this.parseCoordinate(station.longitude);
    
    if (lat !== null && lng !== null) {
      const url = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(url, '_blank');
    } else {
      swalHelper.showToast('Coordinates not available', 'error');
    }
  }

  copyCoordinates(station: Station): void {
    const lat = this.parseCoordinate(station.latitude);
    const lng = this.parseCoordinate(station.longitude);
    
    if (lat !== null && lng !== null) {
      const coords = `${lat}, ${lng}`;
      navigator.clipboard.writeText(coords).then(() => {
        swalHelper.showToast('Coordinates copied to clipboard', 'success');
      }).catch(() => {
        swalHelper.showToast('Failed to copy coordinates', 'error');
      });
    } else {
      swalHelper.showToast('Coordinates not available', 'error');
    }
  }

  getCityName(cityId: string): string {
    const city = this.cities.find(c => c._id === cityId);
    return city ? city.name : 'Unknown City';
  }
}