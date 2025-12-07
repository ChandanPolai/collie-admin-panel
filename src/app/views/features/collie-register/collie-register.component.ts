import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { CollieService } from '../../../core/services/collie.service';
import { StationService } from '../../../core/services/station.service';
import { 
  Collie, 
  CollieRegisterRequest, 
  PendingApproval 
} from '../../../core/interfaces/collie.interface';
import { Station } from '../../../core/interfaces/station.interface';
import { swalHelper } from '../../../core/constants/swal-helper';
import { SidebarService } from '../../../core/services/sidebar.service';
import { ThemeService } from '../../../core/services/theme.service';
import { environment } from '../../../../env/env.local';

@Component({
  selector: 'app-collie-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgxPaginationModule,
    FormsModule
  ],
  templateUrl: './collie-register.component.html',
  styleUrls: ['./collie-register.component.scss']
})
export class CollieRegisterComponent implements OnInit {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement', { static: false }) canvasElement!: ElementRef<HTMLCanvasElement>;

  mode: 'list' | 'register' | 'preview' = 'list';
  pendingCollies: PendingApproval[] = [];
  allStations: Station[] = [];
  currentCollie: PendingApproval | null = null;
  
  isLoading: boolean = false;
  isSidebarCollapsed: boolean = false;
  
  collieForm!: FormGroup;
  selectedFile: File | null = null;
  fileError: string | null = null;
  
  // Multi-step form
  currentStep: number = 1;
  totalSteps: number = 2;
  
  // Camera related properties
  isCameraOpen: boolean = false;
  isCameraLoading: boolean = false;
  mediaStream: MediaStream | null = null;
  capturedImageUrl: string | null = null;
  
  maxFileSize = 5 * 1024 * 1024; // 5MB
  allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  
  searchTerm: string = '';
  paginationConfig = {
    id: 'collie-pagination',
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0
  };

  deviceTypes = ['SmartPhone', 'Other'];
  genders = ['Male', 'Female', 'Other'];

  constructor(
    private fb: FormBuilder,
    private collieService: CollieService,
    private stationService: StationService,
    private sidebarService: SidebarService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadPendingCollies();
    this.loadAllStations();
    
    this.sidebarService.isCollapsed$.subscribe((isCollapsed) => {
      this.isSidebarCollapsed = isCollapsed;
    });
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  private initializeForm(): void {
    this.collieForm = this.fb.group({
      // Step 1: Personal Details
      name: ['', [Validators.required, Validators.minLength(2)]],
      mobileNo: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      age: ['', [Validators.required, Validators.min(18), Validators.max(65)]],
      gender: ['', Validators.required],
      emailId: ['', [Validators.email]],
      buckleNumber: ['', [Validators.required, Validators.minLength(3)]],
      deviceType: ['SmartPhone', Validators.required],
      
      // Step 2: Address & Station
      address: ['', Validators.required],
      stationId: ['', Validators.required]
    });
  }

  isStep1Valid(): boolean {
    return !!(this.collieForm.get('name')?.valid &&
           this.collieForm.get('mobileNo')?.valid &&
           this.collieForm.get('age')?.valid &&
           this.collieForm.get('gender')?.valid &&
           this.collieForm.get('buckleNumber')?.valid &&
           this.collieForm.get('deviceType')?.valid &&
           (this.selectedFile || this.capturedImageUrl) !== null);
  }

  isStep2Valid(): boolean {
    return !!(this.collieForm.get('address')?.valid &&
           this.collieForm.get('stationId')?.valid);
  }

  nextStep(): void {
    if (this.currentStep === 1 && this.isStep1Valid()) {
      this.currentStep = 2;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  loadPendingCollies(): void {
    this.isLoading = true;
    this.collieService.getPendingApprovals().subscribe({
      next: (response) => {
        this.pendingCollies = response.data || [];
        this.paginationConfig.totalItems = this.pendingCollies.length;
        this.isLoading = false;
      },
      error: (err) => {
        swalHelper.messageToast(err?.message ?? 'Failed to load pending collies.', 'error');
        this.isLoading = false;
      }
    });
  }

  loadAllStations(): void {
    this.stationService.getAllStations().subscribe({
      next: (response) => {
        this.allStations = response.data?.station || [];
      },
      error: (err) => {
        swalHelper.messageToast('Failed to load stations', 'error');
      }
    });
  }

  get filteredCollies(): PendingApproval[] {
    if (!this.searchTerm.trim()) {
      return this.pendingCollies;
    }
    const search = this.searchTerm.toLowerCase();
    return this.pendingCollies.filter(collie => 
      collie.name.toLowerCase().includes(search) ||
      collie.mobileNo.includes(search) ||
      collie.buckleNumber.toLowerCase().includes(search) ||
      (collie.stationId as Station)?.name?.toLowerCase().includes(search)
    );
  }

  onPageChange(page: number): void {
    this.paginationConfig.currentPage = page;
  }

  onPageSizeChange(): void {
    this.paginationConfig.currentPage = 1;
  }

  openRegisterForm(): void {
    this.mode = 'register';
    this.currentStep = 1;
    this.resetForm();
  }

  previewCollie(collie: PendingApproval): void {
    this.mode = 'preview';
    this.currentCollie = collie;
  }

  approveCollie(collieId: string): void {
    swalHelper.takeConfirmation(
      'Approve Collie?',
      'This will activate the collie and register their face'
    ).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.collieService.approveCollie(collieId).subscribe({
          next: (response) => {
            swalHelper.showToast(response.message || 'Collie approved successfully', 'success');
            this.loadPendingCollies();
            this.isLoading = false;
          },
          error: (err) => {
            swalHelper.messageToast(err?.message ?? 'Failed to approve collie', 'error');
            this.isLoading = false;
          }
        });
      }
    });
  }

  onSubmit(): void {
    if (this.collieForm.valid && (this.selectedFile || this.capturedImageUrl) && !this.isLoading) {
      this.isLoading = true;
      
      const collieData: CollieRegisterRequest = this.collieForm.value;
      
      // If image is captured from camera, convert it to file
      if (this.capturedImageUrl && !this.selectedFile) {
        this.dataURLtoFile(this.capturedImageUrl, 'captured-photo.jpg').then(file => {
          const formData = this.collieService.createCollieFormData(collieData, file);
          this.submitForm(formData);
        });
      } else if (this.selectedFile) {
        const formData = this.collieService.createCollieFormData(collieData, this.selectedFile);
        this.submitForm(formData);
      }
    } else {
      if (!this.selectedFile && !this.capturedImageUrl) {
        this.fileError = 'Profile image is required';
      }
      this.markAllFieldsAsTouched();
      swalHelper.error('Please fill in all required fields and upload/capture an image');
    }
  }

  private submitForm(formData: FormData): void {
    this.collieService.registerCollie(formData).subscribe({
      next: (response) => {
        swalHelper.showToast(response.message || 'Collie registered successfully. Awaiting admin approval.', 'success');
        this.isLoading = false;
        this.resetForm();
        this.loadPendingCollies();
        this.mode = 'list';
      },
      error: (err) => {
        swalHelper.messageToast(err?.message ?? 'Failed to register collie.', 'error');
        this.isLoading = false;
      }
    });
  }

  // ==================== CAMERA METHODS ====================
  
  async openCamera(): Promise<void> {
    this.isCameraLoading = true;
    this.fileError = null;
    
    try {
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user' // Front camera
        },
        audio: false
      };

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Wait for next tick to ensure video element is rendered
      setTimeout(() => {
        if (this.videoElement && this.videoElement.nativeElement) {
          this.videoElement.nativeElement.srcObject = this.mediaStream;
          this.videoElement.nativeElement.play();
          this.isCameraOpen = true;
          this.isCameraLoading = false;
        }
      }, 100);
    } catch (error: any) {
      console.error('Camera error:', error);
      this.isCameraLoading = false;
      
      if (error.name === 'NotAllowedError') {
        this.fileError = 'Camera permission denied. Please allow camera access.';
      } else if (error.name === 'NotFoundError') {
        this.fileError = 'No camera found on this device.';
      } else {
        this.fileError = 'Failed to access camera. Please try uploading an image instead.';
      }
      
      swalHelper.error(this.fileError);
    }
  }

  capturePhoto(): void {
    if (this.videoElement && this.canvasElement) {
      const video = this.videoElement.nativeElement;
      const canvas = this.canvasElement.nativeElement;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        this.capturedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        // Clear selected file if any
        this.selectedFile = null;
        
        // Stop camera after capture
        this.stopCamera();
        
        swalHelper.showToast('Photo captured successfully!', 'success');
      }
    }
  }

  stopCamera(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    this.isCameraOpen = false;
  }

  retakePhoto(): void {
    this.capturedImageUrl = null;
    this.openCamera();
  }

  removeCapturedPhoto(): void {
    this.capturedImageUrl = null;
    this.fileError = null;
  }

  // Convert data URL to File object
  private async dataURLtoFile(dataUrl: string, filename: string): Promise<File> {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: 'image/jpeg' });
  }

  // ==================== FILE UPLOAD METHODS ====================
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.validateAndAttachFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.validateAndAttachFile(files[0]);
    }
  }

  private validateAndAttachFile(file: File): void {
    this.fileError = null;
    
    if (!this.allowedFileTypes.includes(file.type)) {
      this.fileError = 'Only JPG, JPEG, and PNG files are allowed';
      this.clearFileInput();
      return;
    }
    
    if (file.size > this.maxFileSize) {
      this.fileError = 'File size must be less than 5MB';
      this.clearFileInput();
      return;
    }
    
    this.selectedFile = file;
    this.capturedImageUrl = null; // Clear captured photo if file is selected
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
    this.fileError = null;
    this.clearFileInput();
  }

  private clearFileInput(): void {
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  getImagePreviewUrl(): string | null {
    if (this.capturedImageUrl) {
      return this.capturedImageUrl;
    }
    if (this.selectedFile) {
      return URL.createObjectURL(this.selectedFile);
    }
    return null;
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getCollieImage(collie: PendingApproval): string {
    if (collie?.image?.url) {
      return environment.imageUrl + collie.image.url;
    }
    return '/images/profile-avtart.png';
  }

  onImageError(event: Event): void {
    const img = event && (event.target as HTMLImageElement | null);
    if (img) {
      img.onerror = null; // prevent infinite loop just in case
      img.src = '/images/profile-avtart.png';
    }
  }

  getStationName(stationId: any): string {
    if (typeof stationId === 'object' && stationId?.name) {
      return stationId.name;
    }
    const station = this.allStations.find(s => s._id === stationId);
    return station?.name || 'Unknown Station';
  }

  getStationCode(stationId: any): string {
    if (typeof stationId === 'object' && stationId?.code) {
      return stationId.code;
    }
    const station = this.allStations.find(s => s._id === stationId);
    return station?.code || 'N/A';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.collieForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.collieForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${this.getFieldDisplayName(fieldName)} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} characters required`;
      if (field.errors['pattern']) return 'Please enter a valid 10-digit mobile number';
      if (field.errors['min']) return `Minimum age is ${field.errors['min'].min}`;
      if (field.errors['max']) return `Maximum age is ${field.errors['max'].max}`;
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      name: 'Name',
      mobileNo: 'Mobile number',
      age: 'Age',
      deviceType: 'Device type',
      emailId: 'Email',
      gender: 'Gender',
      buckleNumber: 'Buckle number',
      stationId: 'Station',
      address: 'Address'
    };
    return fieldNames[fieldName] || fieldName;
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.collieForm.controls).forEach(key => {
      this.collieForm.get(key)?.markAsTouched();
    });
  }

  resetForm(): void {
    this.collieForm.reset({
      name: '',
      mobileNo: '',
      age: '',
      deviceType: 'SmartPhone',
      emailId: '',
      gender: '',
      buckleNumber: '',
      stationId: '',
      address: ''
    });
    this.selectedFile = null;
    this.capturedImageUrl = null;
    this.fileError = null;
    this.stopCamera();
    this.clearFileInput();
    this.currentStep = 1;
  }

  cancelForm(): void {
    this.resetForm();
    this.mode = 'list';
    this.currentCollie = null;
  }

  formatDate(date: string | null | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getApprovalStatusClass(collie?: PendingApproval): string {
    const approved = collie?.isApproved === true;
    return approved
      ? 'tw-bg-green-100 tw-text-green-800'
      : 'tw-bg-yellow-100 tw-text-yellow-800';
  }

  getApprovalStatusText(collie?: PendingApproval): string {
    const approved = collie?.isApproved === true;
    return approved ? 'Approved' : 'Pending Approval';
  }
}