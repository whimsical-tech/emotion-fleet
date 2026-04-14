// ============================================================================
// RAW API TYPES (match JSON structure exactly)
// ============================================================================

export interface EMSFacility {
  facility_id: string;
  name: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  total_capacity_kw: number;
  external_refs: {
    fms_facility_ref: string;
    power_provider_code?: string;
  };
  chargers: EMSCharger[];
}

export interface EMSCharger {
  charger_id: string;
  external_ref: string;
  model: string;
  max_power_kw: number;
  status: "AVAILABLE" | "IN_USE" | "OFFLINE" | "MAINTENANCE";
  current_power_kw: number | null;
  last_status_update: string; // ISO 8601 UTC
}

export interface EMSData {
  api_version: string;
  generated_at: string;
  facilities: EMSFacility[];
}

export interface FMSVehicle {
  vehicleId: string;
  licensePlate: string;
  model: string;
  batteryCapacityWh: number;
  currentBatteryPercent: number | null;
  status: "available" | "charging" | "in_transit" | "offline";
}

export interface FMSChargingSession {
  sessionId: string;
  vehicleId: string;
  chargerIdentifier: string;
  facilityRef: string;
  startTime: string; // JST timestamp string
  endTime: string | null; // JST timestamp string
  energyDeliveredWh: number;
  maxPowerW: number;
  status: "completed" | "in_progress" | "failed" | "interrupted";
  interruptReason?: string;
  failureReason?: string;
}

export interface FMSData {
  apiVersion: string;
  generatedAt: string;
  vehicles: FMSVehicle[];
  chargingSessions: FMSChargingSession[];
}

// ============================================================================
// NORMALIZED DOMAIN TYPES (to be used internally)
// ============================================================================

export interface NormalizedCharger {
  id: string; // external_ref from EMS
  emsId: string; // charger_id from EMS
  model: string;
  maxPowerKw: number;
  status: "available" | "in_use" | "offline" | "maintenance";
  currentPowerKw: number;
  lastStatusUpdateUtc: Date;
}

export interface NormalizedFacility {
  id: string; // facility_id from EMS
  fmsRef: string; // fms_facility_ref for joining with FMS
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  totalCapacityKw: number;
  chargers: NormalizedCharger[];
  currentLoadKw: number; // Sum of current_power_kw from all chargers
  chargerStats: {
    available: number;
    inUse: number;
    offline: number;
    maintenance: number;
  };
}

export interface NormalizedSession {
  id: string;
  vehicleId: string;
  vehicleLicensePlate: string;
  vehicleModel: string;
  chargerId: string; // external_ref from EMS
  chargerModel: string;
  facilityId: string; // fms_facility_ref
  startTimeUtc: Date | null;
  endTimeUtc: Date | null;
  energyDeliveredKwh: number;
  maxPowerKw: number;
  status: "completed" | "in_progress" | "failed" | "interrupted";
  durationMinutes: number | null;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface FacilityStatusResponse {
  facilities: NormalizedFacility[];
  generatedAt: string; // ISO 8601 UTC
}

export interface SessionHistoryResponse {
  facilityId: string;
  facilityName: string;
  sessions: NormalizedSession[];
  generatedAt: string; // ISO 8601 UTC
}
