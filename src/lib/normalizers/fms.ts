import { FMSChargingSession, NormalizedSession } from "@/lib/types";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);
dayjs.extend(utc);

/**
 * Normalize FMS charging session to domain model
 * - Converts JST timestamps to UTC
 * - Converts Wh → kWh and W → kW
 * - Calculates duration in minutes
 * - Uses status field as source of truth
 */
export function normalizeFMSSession(
  raw: FMSChargingSession,
  vehicleLicensePlate: string,
  vehicleModel: string,
  chargerModel: string,
): NormalizedSession {
  const startUtc = parseJSTtoUTC(raw.startTime);
  const endUtc = raw.endTime ? parseJSTtoUTC(raw.endTime) : null;

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
 */
export function parseJSTtoUTC(jstString: string): Date | null {
  if (!jstString) return null;

  const dateString = jstString.replace(" JST", "").trim();

  // Define the expected format strictly to avoid ambiguity
  // Format: YYYY-MM-DD HH:mm:ss
  const parsed = dayjs(dateString, "YYYY-MM-DD HH:mm:ss", true);

  if (!parsed.isValid()) {
    console.error(`Failed to parse JST date: ${jstString}`);
    return null;
  }

  // Convert to UTC
  return parsed.utc().toDate();
}
