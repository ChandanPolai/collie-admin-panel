// platform.interface.ts

export interface Platform {
  _id: string;
  stationId: string;
  platformNumber: string | number;
  isActive: boolean;
  isDeleted: boolean;
  __v?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlatformRequest {
  stationId: string;
  platformNo: number;
}

export interface UpdatePlatformRequest {
  isActive?: boolean;
  // Add other updatable fields as needed
}

export interface PlatformResponse {
  status: number;
  message: string;
  data: {
    platforms?: Platform[];
    platform?: Platform;
  };
}