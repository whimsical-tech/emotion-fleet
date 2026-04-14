import { describe, it, expect } from "vitest";
import { mapFacilityWithSessions, findEMSFacilityById } from "./facility";
import type { EMSFacility, FMSChargingSession, FMSVehicle } from "@/lib/types";

describe("mapFacilityWithSessions", () => {
  const emsFacility: EMSFacility = {
    facility_id: "fac-001",
    name: "Tokyo Station",
    location: {
      address: "1-1-1 Chiyoda",
      latitude: 35.6812,
      longitude: 139.7671,
    },
    total_capacity_kw: 150,
    external_refs: { fms_facility_ref: "fms-tokyo-001" },
    chargers: [
      {
        charger_id: "chr-001",
        external_ref: "ext-001",
        model: "Tesla V3",
        max_power_kw: 250,
        status: "AVAILABLE",
        current_power_kw: 0,
        last_status_update: "2026-04-14T05:00:00Z",
      },
    ],
  };

  const sessions: FMSChargingSession[] = [
    {
      sessionId: "sess-001",
      vehicleId: "veh-001",
      chargerIdentifier: "ext-001",
      facilityRef: "fms-tokyo-001",
      startTime: "2026-04-14 14:30:00 JST",
      endTime: "2026-04-14 15:30:00 JST",
      energyDeliveredWh: 50000,
      maxPowerW: 100000,
      status: "completed",
    },
    {
      sessionId: "sess-002",
      vehicleId: "veh-002",
      chargerIdentifier: "ext-001",
      facilityRef: "fms-other-facility", // Wrong facility - should be filtered
      startTime: "2026-04-14 14:30:00 JST",
      endTime: "2026-04-14 15:30:00 JST",
      energyDeliveredWh: 30000,
      maxPowerW: 80000,
      status: "completed",
    },
  ];

  const vehicles: FMSVehicle[] = [
    {
      vehicleId: "veh-001",
      licensePlate: "ABC-1234",
      model: "Tesla Model 3",
      batteryCapacityWh: 75000,
      currentBatteryPercent: 80,
      status: "charging",
    },
    // veh-002 intentionally missing - orphaned session
  ];

  it("should filter sessions by facilityRef", () => {
    const result = mapFacilityWithSessions(emsFacility, sessions, vehicles);
    expect(result.sessions.length).toBe(1);
    expect(result.sessions[0].id).toBe("sess-001");
  });

  it("should enrich session with vehicle data", () => {
    const result = mapFacilityWithSessions(emsFacility, sessions, vehicles);
    expect(result.sessions[0].vehicleModel).toBe("Tesla Model 3");
    expect(result.sessions[0].vehicleLicensePlate).toBe("ABC-1234");
  });

  it("should handle orphaned sessions (missing vehicle)", () => {
    const orphanedSession: FMSChargingSession = {
      ...sessions[1],
      facilityRef: "fms-tokyo-001", // Belongs to our facility
      vehicleId: "veh-missing", // No matching vehicle
    };

    const result = mapFacilityWithSessions(
      emsFacility,
      [...sessions, orphanedSession],
      vehicles,
    );

    const orphaned = result.sessions.find(
      (s) => s.id === orphanedSession.sessionId,
    );
    expect(orphaned?.vehicleModel).toBe("UNKNOWN");
    expect(orphaned?.vehicleLicensePlate).toBe("UNKNOWN");
  });

  it("should handle missing charger data gracefully", () => {
    const sessionWithMissingCharger: FMSChargingSession = {
      ...sessions[0],
      chargerIdentifier: "ext-missing", // No matching charger
    };

    const result = mapFacilityWithSessions(
      emsFacility,
      [sessionWithMissingCharger],
      vehicles,
    );

    expect(result.sessions[0].chargerModel).toBe("UNKNOWN");
  });

  it("should return normalized facility data", () => {
    const result = mapFacilityWithSessions(emsFacility, sessions, vehicles);
    expect(result.id).toBe("fac-001");
    expect(result.name).toBe("Tokyo Station");
    expect(result.address).toBe("1-1-1 Chiyoda");
    expect(result.sessions).toBeDefined();
  });
});

describe("findEMSFacilityById", () => {
  const facilities: EMSFacility[] = [
    {
      facility_id: "fac-001",
      name: "Tokyo Station",
      location: {
        address: "1-1-1 Chiyoda",
        latitude: 35.6812,
        longitude: 139.7671,
      },
      total_capacity_kw: 150,
      external_refs: { fms_facility_ref: "fms-tokyo-001" },
      chargers: [],
    },
    {
      facility_id: "fac-002",
      name: "Osaka Station",
      location: {
        address: "1-1-1 Osaka",
        latitude: 34.7024,
        longitude: 135.4959,
      },
      total_capacity_kw: 100,
      external_refs: { fms_facility_ref: "fms-osaka-001" },
      chargers: [],
    },
  ];

  it("should find facility by ID", () => {
    const result = findEMSFacilityById(facilities, "fac-001");
    expect(result?.name).toBe("Tokyo Station");
  });

  it("should return undefined for non-existent ID", () => {
    const result = findEMSFacilityById(facilities, "fac-nonexistent");
    expect(result).toBeUndefined();
  });
});
