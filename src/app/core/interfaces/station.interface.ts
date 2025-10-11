// station.interface.ts

export interface GeofenceConfig {
  geofenceType: 'circle' | 'polygon';
  area: number;
  vertices: number;
}

export interface Station {
  _id?: string;
  name: string;
  code: string;
  cityId: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  geofenceRadius?: number;
  geofencePolygon?: number[][][] | null;
  geofenceConfig: GeofenceConfig;
  isActive: boolean;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStationRequest {
  name: string;
  code: string;
  cityId: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface StationResponse {
  message: string;
  data: { station: Station } | { station: Station[] } | null;
  status: number;
}

export interface AllStationsResponse {
  message: string;
  data: { station: Station[] };
  status: number;
}