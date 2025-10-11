import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { CityService } from '../../../core/services/city.service';
import { StateService } from '../../../core/services/state.service';
import { City, CreateCityRequest } from '../../../core/interfaces/city.interface';
import { State } from '../../../core/interfaces/state.interface';
import { swalHelper } from '../../../core/constants/swal-helper';
import { SidebarService } from '../../../core/services/sidebar.service';

@Component({
  selector: 'app-city',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgxPaginationModule,
    FormsModule
  ],
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.scss']
})
export class CityComponent implements OnInit {
  mode: 'list' | 'create' | 'edit' | 'preview' = 'list';
  cities: City[] = [];
  filteredCities: City[] = [];
  allStates: State[] = [];
  currentCity: City | null = null;
  currentCityId?: string;
  
  isLoading: boolean = false;
  isSidebarCollapsed: boolean = false;
  
  cityForm!: FormGroup;
  
  searchTerm: string = '';
  filterStateId: string = '';
  
  // Pagination for API calls
  apiPagination = {
    page: 1,
    limit: 1000 // Load all cities at once for client-side filtering
  };
  
  // Pagination for UI display
  paginationConfig = {
    id: 'city-pagination',
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0
  };

  constructor(
    private fb: FormBuilder,
    private cityService: CityService,
    private stateService: StateService,
    private sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadStates();
    this.loadCities();
    
    this.sidebarService.isCollapsed$.subscribe((isCollapsed) => {
      this.isSidebarCollapsed = isCollapsed;
    });
  }

  private initializeForm(): void {
    this.cityForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      code: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-z0-9_-]+$/)]],
      stateId: ['', Validators.required]
    });
  }

  loadStates(): void {
    this.stateService.getAllStates().subscribe({
      next: (response) => {
        console.log('States Response:', response);
        
        // Handle different response structures for states
        if (response.data) {
          if ((response.data as any).docs && Array.isArray((response.data as any).docs)) {
            this.allStates = (response.data as any).docs.filter((s: State) => !s.isDeleted);
          } else if (Array.isArray(response.data)) {
            this.allStates = response.data.filter((s: State) => !s.isDeleted);
          } else {
            this.allStates = [];
          }
        } else {
          this.allStates = [];
        }
        
        console.log('States loaded:', this.allStates.length);
      },
      error: (err) => {
        console.error('Error loading states:', err);
        swalHelper.messageToast('Failed to load states', 'error');
      }
    });
  }

  loadCities(): void {
    this.isLoading = true;
    
    // Pass pagination params to get all cities
    this.cityService.getAllCities(this.apiPagination).subscribe({
      next: (response) => {
        console.log('Cities Response:', response);
        
        // Handle paginated response structure
        if (response.data) {
          const data = response.data as any;
          
          if (data.docs && Array.isArray(data.docs)) {
            // Paginated response with docs
            this.cities = data.docs;
            console.log('✅ Cities loaded from docs:', this.cities.length);
            console.log('Total cities in DB:', data.totalDocs);
          } else if (Array.isArray(response.data)) {
            // Direct array response
            this.cities = response.data;
            console.log('✅ Cities loaded as array:', this.cities.length);
          } else if (data._id) {
            // Single city object
            this.cities = [data as City];
            console.log('✅ Single city loaded');
          } else {
            this.cities = [];
            console.log('⚠️ No cities found in response');
          }
        } else {
          this.cities = [];
          console.log('⚠️ Response data is empty');
        }
        
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error loading cities:', err);
        swalHelper.messageToast(err?.message ?? 'Failed to load cities.', 'error');
        this.cities = [];
        this.filteredCities = [];
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onStateFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.cities];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(city => 
        city.name.toLowerCase().includes(search) ||
        city.code.toLowerCase().includes(search) ||
        this.getStateName(city.stateId).toLowerCase().includes(search)
      );
    }

    // Apply state filter
    if (this.filterStateId) {
      filtered = filtered.filter(city => {
        const stateId = typeof city.stateId === 'object' ? (city.stateId as State)._id : city.stateId;
        return stateId === this.filterStateId;
      });
    }

    this.filteredCities = filtered;
    this.paginationConfig.totalItems = this.filteredCities.length;
    this.paginationConfig.currentPage = 1;
    
    console.log('Filtered cities:', this.filteredCities.length);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterStateId = '';
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
    this.resetForm();
  }

  editCity(city: City): void {
    this.mode = 'edit';
    this.currentCityId = city._id;
    this.currentCity = city;
    
    const stateId = typeof city.stateId === 'object' ? (city.stateId as State)._id : city.stateId;
    
    this.cityForm.patchValue({
      name: city.name,
      code: city.code,
      stateId: stateId
    });
  }

  previewCity(city: City): void {
    this.mode = 'preview';
    this.currentCity = city;
  }

  deleteCity(cityId: string, cityName: string): void {
    swalHelper.takeConfirmation(
      'Delete City?',
      `Are you sure you want to delete "${cityName}"?`
    ).then((result) => {
      if (result.isConfirmed) {
        this.cityService.deleteCity(cityId).subscribe({
          next: (response) => {
            swalHelper.showToast(response.message || 'City deleted successfully', 'success');
            this.loadCities();
          },
          error: (err) => {
            swalHelper.messageToast(err?.message ?? 'Failed to delete city', 'error');
          }
        });
      }
    });
  }

  toggleCityStatus(city: City): void {
    const action = city.isDeleted ? 'activate' : 'deactivate';
    
    swalHelper.takeConfirmation(
      `${action.charAt(0).toUpperCase() + action.slice(1)} City?`,
      `Are you sure you want to ${action} "${city.name}"?`
    ).then((result) => {
      if (result.isConfirmed) {
        this.cityService.toggleCityStatus({ id: city._id! }).subscribe({
          next: (response) => {
            swalHelper.showToast(response.message || `City ${action}d successfully`, 'success');
            this.loadCities();
          },
          error: (err) => {
            swalHelper.messageToast(err?.message ?? `Failed to ${action} city`, 'error');
          }
        });
      }
    });
  }

  onSubmit(): void {
    if (this.cityForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      const formValue = this.cityForm.value;
      const cityData: CreateCityRequest = {
        name: formValue.name.trim(),
        code: formValue.code.trim().toLowerCase(),
        stateId: formValue.stateId
      };

      if (this.mode === 'create') {
        this.cityService.createCity(cityData).subscribe({
          next: (response) => {
            swalHelper.showToast(response.message || 'City created successfully', 'success');
            this.isLoading = false;
            this.resetForm();
            this.loadCities();
            this.mode = 'list';
          },
          error: (err) => {
            swalHelper.messageToast(err?.message ?? 'Failed to create city.', 'error');
            this.isLoading = false;
          }
        });
      } else if (this.mode === 'edit' && this.currentCityId) {
        this.cityService.updateCity(this.currentCityId, cityData).subscribe({
          next: (response) => {
            swalHelper.showToast(response.message || 'City updated successfully', 'success');
            this.isLoading = false;
            this.resetForm();
            this.loadCities();
            this.mode = 'list';
          },
          error: (err) => {
            swalHelper.messageToast(err?.message ?? 'Failed to update city.', 'error');
            this.isLoading = false;
          }
        });
      }
    } else {
      this.markAllFieldsAsTouched();
      swalHelper.error('Please fill in all required fields correctly');
    }
  }

  getStateName(stateId: any): string {
    if (typeof stateId === 'object' && stateId?.name) {
      return stateId.name;
    }
    const state = this.allStates.find(s => s._id === stateId);
    return state?.name || 'Unknown State';
  }

  getStateCode(stateId: any): string {
    if (typeof stateId === 'object' && stateId?.code) {
      return stateId.code;
    }
    const state = this.allStates.find(s => s._id === stateId);
    return state?.code || 'N/A';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.cityForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.cityForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${this.getFieldDisplayName(fieldName)} is required`;
      if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} characters required`;
      if (field.errors['pattern']) return 'Code must be lowercase letters, numbers, hyphens or underscores (e.g., mumbai, new-delhi)';
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      name: 'City name',
      code: 'City code',
      stateId: 'State'
    };
    return fieldNames[fieldName] || fieldName;
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.cityForm.controls).forEach(key => {
      this.cityForm.get(key)?.markAsTouched();
    });
  }

  resetForm(): void {
    this.cityForm.reset({
      name: '',
      code: '',
      stateId: ''
    });
    this.currentCityId = undefined;
    this.currentCity = null;
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

  getStatusClass(isDeleted: boolean | undefined): string {
    return !isDeleted ? 'tw-bg-green-100 tw-text-green-800' : 'tw-bg-red-100 tw-text-red-800';
  }

  getStatusText(isDeleted: boolean | undefined): string {
    return !isDeleted ? 'Active' : 'Inactive';
  }
}