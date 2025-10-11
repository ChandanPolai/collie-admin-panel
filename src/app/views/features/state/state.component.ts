import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { StateService } from '../../../core/services/state.service';
import { State, CreateStateRequest } from '../../../core/interfaces/state.interface';
import { swalHelper } from '../../../core/constants/swal-helper';
import { SidebarService } from '../../../core/services/sidebar.service';

@Component({
  selector: 'app-state',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgxPaginationModule,
    FormsModule
  ],
  templateUrl: './state.component.html',
  styleUrls: ['./state.component.scss']
})
export class StateComponent implements OnInit {
  mode: 'list' | 'create' | 'edit' | 'preview' = 'list';
  states: State[] = [];
  filteredStates: State[] = [];
  currentState: State | null = null;
  currentStateId?: string;
  
  isLoading: boolean = false;
  isSidebarCollapsed: boolean = false;
  
  stateForm!: FormGroup;
  
  searchTerm: string = '';
  
  // Pagination for API calls
  apiPagination = {
    page: 1,
    limit: 1000 // Load all states at once for client-side filtering
  };
  
  // Pagination for UI display
  paginationConfig = {
    id: 'state-pagination',
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0
  };

  constructor(
    private fb: FormBuilder,
    private stateService: StateService,
    private sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadStates();
    
    this.sidebarService.isCollapsed$.subscribe((isCollapsed) => {
      this.isSidebarCollapsed = isCollapsed;
    });
  }

  private initializeForm(): void {
    this.stateForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      code: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-z0-9_-]+$/)]]
    });
  }

  loadStates(): void {
    this.isLoading = true;
    
    // Pass pagination params to get all states
    this.stateService.getAllStates(this.apiPagination).subscribe({
      next: (response) => {
        console.log('States Response:', response);
        
        // Handle paginated response structure
        if (response.data) {
          const data = response.data as any;
          
          if (data.docs && Array.isArray(data.docs)) {
            // Paginated response with docs
            this.states = data.docs;
            console.log('✅ States loaded from docs:', this.states.length);
            console.log('Total states in DB:', data.totalDocs);
          } else if (Array.isArray(response.data)) {
            // Direct array response
            this.states = response.data;
            console.log('✅ States loaded as array:', this.states.length);
          } else if (data._id) {
            // Single state object
            this.states = [data as State];
            console.log('✅ Single state loaded');
          } else {
            this.states = [];
            console.log('⚠️ No states found in response');
          }
        } else {
          this.states = [];
          console.log('⚠️ Response data is empty');
        }
        
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error loading states:', err);
        swalHelper.messageToast(err?.message ?? 'Failed to load states.', 'error');
        this.states = [];
        this.filteredStates = [];
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.states];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(state => 
        state.name.toLowerCase().includes(search) ||
        state.code.toLowerCase().includes(search)
      );
    }

    this.filteredStates = filtered;
    this.paginationConfig.totalItems = this.filteredStates.length;
    this.paginationConfig.currentPage = 1;
    
    console.log('Filtered states:', this.filteredStates.length);
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
    this.resetForm();
  }

  editState(state: State): void {
    this.mode = 'edit';
    this.currentStateId = state._id;
    this.currentState = state;
    
    this.stateForm.patchValue({
      name: state.name,
      code: state.code
    });
  }

  previewState(state: State): void {
    this.mode = 'preview';
    this.currentState = state;
  }

  deleteState(stateId: string, stateName: string): void {
    swalHelper.takeConfirmation(
      'Delete State?',
      `Are you sure you want to delete "${stateName}"? This will also affect all cities in this state.`
    ).then((result) => {
      if (result.isConfirmed) {
        this.stateService.deleteState(stateId).subscribe({
          next: (response) => {
            swalHelper.showToast(response.message || 'State deleted successfully', 'success');
            this.loadStates();
          },
          error: (err) => {
            swalHelper.messageToast(err?.message ?? 'Failed to delete state', 'error');
          }
        });
      }
    });
  }

  toggleStateStatus(state: State): void {
    const action = state.isDeleted ? 'activate' : 'deactivate';
    
    swalHelper.takeConfirmation(
      `${action.charAt(0).toUpperCase() + action.slice(1)} State?`,
      `Are you sure you want to ${action} "${state.name}"?`
    ).then((result) => {
      if (result.isConfirmed) {
        this.stateService.toggleStateStatus({ id: state._id! }).subscribe({
          next: (response) => {
            swalHelper.showToast(response.message || `State ${action}d successfully`, 'success');
            this.loadStates();
          },
          error: (err) => {
            swalHelper.messageToast(err?.message ?? `Failed to ${action} state`, 'error');
          }
        });
      }
    });
  }

  onSubmit(): void {
    if (this.stateForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      const formValue = this.stateForm.value;
      const stateData: CreateStateRequest = {
        name: formValue.name.trim(),
        code: formValue.code.trim().toLowerCase()
      };

      if (this.mode === 'create') {
        this.stateService.createState(stateData).subscribe({
          next: (response) => {
            swalHelper.showToast(response.message || 'State created successfully', 'success');
            this.isLoading = false;
            this.resetForm();
            this.loadStates();
            this.mode = 'list';
          },
          error: (err) => {
            swalHelper.messageToast(err?.message ?? 'Failed to create state.', 'error');
            this.isLoading = false;
          }
        });
      } else if (this.mode === 'edit' && this.currentStateId) {
        this.stateService.updateState(this.currentStateId, stateData).subscribe({
          next: (response) => {
            swalHelper.showToast(response.message || 'State updated successfully', 'success');
            this.isLoading = false;
            this.resetForm();
            this.loadStates();
            this.mode = 'list';
          },
          error: (err) => {
            swalHelper.messageToast(err?.message ?? 'Failed to update state.', 'error');
            this.isLoading = false;
          }
        });
      }
    } else {
      this.markAllFieldsAsTouched();
      swalHelper.error('Please fill in all required fields correctly');
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.stateForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.stateForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${this.getFieldDisplayName(fieldName)} is required`;
      if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} characters required`;
      if (field.errors['pattern']) return 'Code must be lowercase letters, numbers, hyphens or underscores (e.g., maharashtra, uttar-pradesh)';
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      name: 'State name',
      code: 'State code'
    };
    return fieldNames[fieldName] || fieldName;
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.stateForm.controls).forEach(key => {
      this.stateForm.get(key)?.markAsTouched();
    });
  }

  resetForm(): void {
    this.stateForm.reset({
      name: '',
      code: ''
    });
    this.currentStateId = undefined;
    this.currentState = null;
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