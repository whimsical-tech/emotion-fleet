import { describe, it, expect } from "vitest";
import { normalizeFMSSession, parseJSTtoUTC } from "./fms";
import type { FMSChargingSession } from "@/lib/types";

describe("parseJSTtoUTC", () => {
  it("should parse valid JST timestamp to UTC", () => {
    const jstString = "2026-04-14 14:30:00 JST";
    const result = parseJSTtoUTC(jstString);

    expect(result).toBeInstanceOf(Date);
    // JST is UTC+9, so 14:30 JST = 05:30 UTC
    expect(result).not.toBeNull(); // NEW LINE
    expect(result!.getUTCHours()).toBe(5); // CHANGED LINE
    expect(result!.getUTCMinutes()).toBe(30); // CHANGED LINE
  });

  it("should handle empty string", () => {
    expect(parseJSTtoUTC("")).toBeNull();
  });

  it("should reject invalid date format", () => {
    const result = parseJSTtoUTC("invalid-date");
    expect(result).toBeNull();
  });

  it("should handle midnight JST", () => {
    const result = parseJSTtoUTC("2026-04-14 00:00:00 JST");
    expect(result).not.toBeNull();
    expect(result!.getUTCDate()).toBe(13); // NEW LINE
    // April is 3 because of Javascript zero-based index
    expect(result!.getUTCMonth()).toBe(3); // NEW LINE
    expect(result!.getUTCHours()).toBe(15); // Previous day 15:00 UTC
    expect(result!.getUTCMinutes()).toBe(0);
  });
});

describe("normalizeFMSSession", () => {
  const baseSession: FMSChargingSession = {
    sessionId: "session-001",
    vehicleId: "vehicle-001",
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

    expect(result.id).toBe("session-001");
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

  it("should convert Wh to kWh correctly", () => {
    const session: FMSChargingSession = {
      ...baseSession,
      energyDeliveredWh: 123456,
    };
    const result = normalizeFMSSession(session, "ABC", "Model", "Charger");
    expect(result.energyDeliveredKwh).toBe(123.456);
  });
});
