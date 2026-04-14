import { describe, it, expect } from "vitest";
import { normalizeEMSFacility } from "./ems";
import type { EMSFacility } from "@/lib/types";

describe("normalizeEMSFacility", () => {
  const mockFacility: EMSFacility = {
    facility_id: "fac-001",
    name: "Tokyo Station",
    location: {
      address: "1-1-1 Chiyoda, Tokyo",
      latitude: 35.6812,
      longitude: 139.7671,
    },
    total_capacity_kw: 150,
    external_refs: {
      fms_facility_ref: "fms-tokyo-001",
    },
    chargers: [],
  };

  it("should normalize facility with empty chargers", () => {
    const result = normalizeEMSFacility(mockFacility);

    expect(result.id).toBe("fac-001");
    expect(result.fmsRef).toBe("fms-tokyo-001");
    expect(result.currentLoadKw).toBe(0);
    expect(result.chargerStats).toEqual({
      available: 0,
      inUse: 0,
      offline: 0,
      maintenance: 0,
    });
  });

  it("should aggregate currentLoadKw from all chargers", () => {
    const facilityWithChargers: EMSFacility = {
      ...mockFacility,
      chargers: [
        {
          charger_id: "chr-001",
          external_ref: "ext-001",
          model: "Tesla V3",
          max_power_kw: 250,
          status: "IN_USE",
          current_power_kw: 120,
          last_status_update: "2026-04-14T05:00:00Z",
        },
        {
          charger_id: "chr-002",
          external_ref: "ext-002",
          model: "ChargePoint",
          max_power_kw: 150,
          status: "AVAILABLE",
          current_power_kw: 10,
          last_status_update: "2026-04-14T05:00:00Z",
        },
      ],
    };

    const result = normalizeEMSFacility(facilityWithChargers);
    expect(result.currentLoadKw).toBe(130); // 120 + 10
  });

  it("should handle null current_power_kw gracefully", () => {
    const facilityWithNullPower: EMSFacility = {
      ...mockFacility,
      chargers: [
        {
          charger_id: "chr-001",
          external_ref: "ext-001",
          model: "Tesla V3",
          max_power_kw: 250,
          status: "IN_USE",
          current_power_kw: null,
          last_status_update: "2026-04-14T05:00:00Z",
        },
      ],
    };

    const result = normalizeEMSFacility(facilityWithNullPower);
    expect(result.currentLoadKw).toBe(0); // null -> 0
    expect(result.chargers[0].currentPowerKw).toBe(0);
  });

  it("should convert status to lowercase", () => {
    const facilityWithMixedCase: EMSFacility = {
      ...mockFacility,
      chargers: [
        {
          charger_id: "chr-001",
          external_ref: "ext-001",
          model: "Tesla V3",
          max_power_kw: 250,
          status: "IN_USE", // Uppercase from API
          current_power_kw: 50,
          last_status_update: "2026-04-14T05:00:00Z",
        },
        {
          charger_id: "chr-002",
          external_ref: "ext-002",
          model: "ChargePoint",
          max_power_kw: 150,
          status: "available", // Already lowercase
          current_power_kw: 0,
          last_status_update: "2026-04-14T05:00:00Z",
        },
      ],
    };

    const result = normalizeEMSFacility(facilityWithMixedCase);
    expect(result.chargers[0].status).toBe("in_use");
    expect(result.chargers[1].status).toBe("available");
  });

  it("should count chargers by status correctly", () => {
    const facilityWithStats: EMSFacility = {
      ...mockFacility,
      chargers: [
        {
          charger_id: "1",
          external_ref: "e1",
          model: "M",
          max_power_kw: 100,
          status: "AVAILABLE",
          current_power_kw: 0,
          last_status_update: "2026-04-14T05:00:00Z",
        },
        {
          charger_id: "2",
          external_ref: "e2",
          model: "M",
          max_power_kw: 100,
          status: "IN_USE",
          current_power_kw: 50,
          last_status_update: "2026-04-14T05:00:00Z",
        },
        {
          charger_id: "3",
          external_ref: "e3",
          model: "M",
          max_power_kw: 100,
          status: "OFFLINE",
          current_power_kw: 0,
          last_status_update: "2026-04-14T05:00:00Z",
        },
        {
          charger_id: "4",
          external_ref: "e4",
          model: "M",
          max_power_kw: 100,
          status: "MAINTENANCE",
          current_power_kw: 0,
          last_status_update: "2026-04-14T05:00:00Z",
        },
      ],
    };

    const result = normalizeEMSFacility(facilityWithStats);
    expect(result.chargerStats).toEqual({
      available: 1,
      inUse: 1,
      offline: 1,
      maintenance: 1,
    });
  });
});
