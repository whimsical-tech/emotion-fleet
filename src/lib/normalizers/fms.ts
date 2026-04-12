import { FMSChargingSession, NormalizedSession } from "@/lib/types";

/**
 * Normalize FMS charging session to domain model
 * - Converts JST timestamps to UTC
 * - Converts Wh → kWh and W → kW
 * - Calculates duration in minutes
 * - Uses status field as source of truth (not endTime == null)
 */
export function normalizeFMSSession(
  raw: FMSChargingSession,
  vehicleLicensePlate: string,
  vehicleModel: string,
  chargerModel: string,
): NormalizedSession {
  const startUtc = parseJSTtoUTC(raw.startTime);
  const endUtc = raw.endTime ? parseJSTtoUTC(raw.endTime) : null;

  // Calculate duration only if session has ended
  const durationMinutes =
    endUtc && startUtc
      ? Math.round((endUtc.getTime() - startUtc.getTime()) / 60000)
      : null;

  return {
    id: raw.sessionId,
    vehicleId: raw.vehicleId,
    vehicleLicensePlate,
    vehicleModel,
    chargerId: raw.chargerIdentifier,
    chargerModel,
    facilityId: raw.facilityRef,
    startTimeUtc: startUtc,
    endTimeUtc: endUtc,
    energyDeliveredKwh: raw.energyDeliveredWh / 1000, // Wh -> kWh
    maxPowerKw: raw.maxPowerW / 1000, // W -> kW
    status: raw.status as
      | "completed"
      | "in_progress"
      | "failed"
      | "interrupted",
    durationMinutes,
  };
}

/**
 * Parse JST timestamp string to UTC Date
 *
 * Input format: "2026-04-01 17:00:00 JST"
 * JST is UTC+9, so we subtract 9 hours to convert to UTC
 *
 */
export function parseJSTtoUTC(jstString: string): Date {
  // Remove " JST" suffix
  const dateString = jstString.replace(" JST", "");

  // Parse as local time (JavaScript treats it as local timezone)
  const localDate = new Date(dateString);

  // JST is UTC+9, so subtract 9 hours to get UTC
  const utcDate = new Date(localDate.getTime() - 9 * 60 * 60 * 1000);

  return utcDate;
}
