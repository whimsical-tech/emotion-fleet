import {
  EMSFacility,
  FMSChargingSession,
  FMSVehicle,
  NormalizedFacility,
  NormalizedSession,
} from "@/lib/types";
import { normalizeEMSFacility } from "@/lib/normalizers/ems";
import { normalizeFMSSession } from "@/lib/normalizers/fms";

/**
 * Join EMS facility with FMS sessions and vehicles
 *
 * Key mappings:
 * - Facility: Use external_refs.fms_facility_ref to join with FMS facilityRef
 * - Charger: Use external_ref to join with FMS chargerIdentifier
 * - Vehicle: Use vehicleId to join with FMS vehicleId
 */
export function mapFacilityWithSessions(
  emsFacility: EMSFacility,
  fmsSessions: FMSChargingSession[],
  fmsVehicles: FMSVehicle[],
): NormalizedFacility & { sessions: NormalizedSession[] } {
  // Normalize the facility from EMS
  const normalized = normalizeEMSFacility(emsFacility);

  // Filter sessions that belong to this facility
  // KEY: Use fms_facility_ref to join
  const facilitySessions = fmsSessions.filter(
    (s) => s.facilityRef === emsFacility.external_refs.fms_facility_ref,
  );

  // Normalize each session and enrich with vehicle and charger data
  const sessions = facilitySessions.map((session) => {
    // Find the vehicle for this session
    const vehicle = fmsVehicles.find((v) => v.vehicleId === session.vehicleId);

    // Find the charger for this session
    // KEY: Use external_ref to join with chargerIdentifier
    const charger = emsFacility.chargers.find(
      (c) => c.external_ref === session.chargerIdentifier,
    );

    // Normalize the session with enriched data
    return normalizeFMSSession(
      session,
      vehicle?.licensePlate ?? "UNKNOWN",
      vehicle?.model ?? "UNKNOWN",
      charger?.model ?? "UNKNOWN",
    );
  });

  return {
    ...normalized,
    sessions,
  };
}

/**
 * Get all facilities with their sessions
 * This is the main entry point for loading all data
 */
export function mapAllFacilitiesWithSessions(
  emsFacilities: EMSFacility[],
  fmsSessions: FMSChargingSession[],
  fmsVehicles: FMSVehicle[],
): (NormalizedFacility & { sessions: NormalizedSession[] })[] {
  return emsFacilities.map((facility) =>
    mapFacilityWithSessions(facility, fmsSessions, fmsVehicles),
  );
}

/**
 * Find raw EMS facility by normalized ID
 * The normalized id is the same as the raw facility_id
 */
export function findEMSFacilityById(
  emsFacilities: EMSFacility[],
  normalizedId: string,
): EMSFacility | undefined {
  return emsFacilities.find((f) => f.facility_id === normalizedId);
}
