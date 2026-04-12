import {
  EMSFacility,
  EMSCharger,
  NormalizedFacility,
  NormalizedCharger,
} from "@/lib/types";

/**
 * Normalize EMS facility to domain model
 * - Converts status to lowercase
 * - Aggregates charger stats
 * - Calculates current load
 */
export function normalizeEMSFacility(raw: EMSFacility): NormalizedFacility {
  const chargers = raw.chargers.map(normalizeEMSCharger);

  // Sum current power from all chargers
  const currentLoadKw = chargers.reduce((sum, c) => sum + c.currentPowerKw, 0);

  // Count chargers by status
  const chargerStats = {
    available: chargers.filter((c) => c.status === "available").length,
    inUse: chargers.filter((c) => c.status === "in_use").length,
    offline: chargers.filter((c) => c.status === "offline").length,
    maintenance: chargers.filter((c) => c.status === "maintenance").length,
  };

  return {
    id: raw.facility_id,
    fmsRef: raw.external_refs.fms_facility_ref,
    name: raw.name,
    address: raw.location.address,
    coordinates: {
      lat: raw.location.latitude,
      lng: raw.location.longitude,
    },
    totalCapacityKw: raw.total_capacity_kw,
    chargers,
    currentLoadKw,
    chargerStats,
  };
}

/**
 * Normalize individual EMS charger
 * - Converts status to lowercase
 * - Defaults null current_power_kw to 0
 */
function normalizeEMSCharger(raw: EMSCharger): NormalizedCharger {
  return {
    id: raw.external_ref, // Use external_ref as the normalized ID for joining with FMS
    emsId: raw.charger_id,
    model: raw.model,
    maxPowerKw: raw.max_power_kw,
    status: raw.status.toLowerCase() as
      | "available"
      | "in_use"
      | "offline"
      | "maintenance",
    currentPowerKw: raw.current_power_kw ?? 0, // Null -> 0
    lastStatusUpdateUtc: new Date(raw.last_status_update),
  };
}
