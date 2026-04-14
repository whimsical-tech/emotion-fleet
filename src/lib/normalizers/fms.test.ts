import { describe, it, expect } from "vitest";
import { normalizeFMSSession, parseJSTtoUTC } from "./fms";
import type { FMSChargingSession } from "@/lib/types";

describe("parseJSTtoUTC", () => {
  it("should parse valid JST timestamp to UTC", () => {
    const jstString = "2026-04-14 14:30:00 JST";
    const result = parseJSTtoUTC(jstString);

    expect(result).toBeInstanceOf(Date);
    // JST is UTC+9, so 14:30 JST = 05:30 UTC
    expect(result?.getUTCHours()).toBe(5);
    expect(result?.getUTCMinutes()).toBe(30);
  });

  it("should handle empty string", () => {
    expect(parseJSTtoUTC("")).toBeNull();
  });

  it("should handle null/undefined", () => {
    expect(parseJSTtoUTC(null as unknown as string)).toBeNull();
  });

  it("should reject invalid date format", () => {
    const result = parseJSTtoUTC("invalid-date");
    expect(result).toBeNull();
  });

  it("should handle missing JST suffix", () => {
    const result = parseJSTtoUTC("2026-04-14 14:30:00");
    // Without JST suffix, it may parse differently depending on implementation
    expect(result).toBeInstanceOf(Date);
  });
});

describe("normalizeFMSSession", () => {
  const baseSession: FMSChargingSession = {
    sessionId: "sess-001",
    vehicleId: "veh-001",
    chargerIdentifier: "chr-001",
    facilityRef: "fms-tokyo-001",
    startTime: "2026-04-14 14:30:00 JST",
    endTime: "2026-04-14 15:30:00 JST",
    energyDeliveredWh: 50000,
    maxPowerW: 100000,
    status: "completed",
  };

  it("should normalize session with complete data", () => {
    const result = normalizeFMSSession(
      baseSession,
      "ABC-1234",
      "Tesla Model 3",
      "Tesla V3",
    );

    expect(result.id).toBe("sess-001");
    expect(result.vehicleLicensePlate).toBe("ABC-1234");
    expect(result.vehicleModel).toBe("Tesla Model 3");
    expect(result.chargerModel).toBe("Tesla V3");
    expect(result.energyDeliveredKwh).toBe(50); // 50000 Wh / 1000
    expect(result.maxPowerKw).toBe(100); // 100000 W / 1000
    expect(result.durationMinutes).toBe(60); // 1 hour
    expect(result.status).toBe("completed");
  });

  it("should calculate duration only when endTime exists", () => {
    const inProgressSession: FMSChargingSession = {
      ...baseSession,
      endTime: null,
      status: "in_progress",
    };

    const result = normalizeFMSSession(
      inProgressSession,
      "ABC-1234",
      "Tesla Model 3",
      "Tesla V3",
    );
    expect(result.durationMinutes).toBeNull();
  });

  it("should handle missing vehicle data gracefully", () => {
    const result = normalizeFMSSession(
      baseSession,
      "UNKNOWN",
      "UNKNOWN",
      "UNKNOWN",
    );
    expect(result.vehicleLicensePlate).toBe("UNKNOWN");
    expect(result.vehicleModel).toBe("UNKNOWN");
  });

  it("should convert Wh to kWh correctly", () => {
    const session: FMSChargingSession = {
      ...baseSession,
      energyDeliveredWh: 123456,
    };
    const result = normalizeFMSSession(session, "ABC", "Model", "Charger");
    expect(result.energyDeliveredKwh).toBe(123.456);
  });

  it("should preserve status as-is from API", () => {
    const statuses: Array<
      "completed" | "in_progress" | "failed" | "interrupted"
    > = ["completed", "in_progress", "failed", "interrupted"];

    for (const status of statuses) {
      const session: FMSChargingSession = { ...baseSession, status };
      const result = normalizeFMSSession(session, "ABC", "Model", "Charger");
      expect(result.status).toBe(status);
    }
  });
});
