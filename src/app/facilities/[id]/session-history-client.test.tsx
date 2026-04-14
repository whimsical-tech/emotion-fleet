import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SessionHistoryClient from "./session-history-client";
import type { NormalizedSession } from "@/lib/types";

describe("SessionHistoryClient", () => {
  const mockSessions: NormalizedSession[] = [
    {
      id: "sess-001",
      vehicleId: "veh-001",
      vehicleLicensePlate: "ABC-1234",
      vehicleModel: "Tesla Model 3",
      chargerId: "ext-001",
      chargerModel: "Tesla V3",
      facilityId: "fms-tokyo-001",
      startTimeUtc: new Date("2026-04-14T05:30:00Z"),
      endTimeUtc: new Date("2026-04-14T06:30:00Z"),
      energyDeliveredKwh: 50,
      maxPowerKw: 100,
      status: "completed",
      durationMinutes: 60,
    },
  ];

  const mockMultipleSessions: NormalizedSession[] = [
    {
      id: "sess-001",
      vehicleId: "veh-001",
      vehicleLicensePlate: "ABC-1234",
      vehicleModel: "Tesla Model 3",
      chargerId: "ext-001",
      chargerModel: "Tesla V3",
      facilityId: "fms-tokyo-001",
      startTimeUtc: new Date("2026-04-14T05:30:00Z"),
      endTimeUtc: new Date("2026-04-14T06:30:00Z"),
      energyDeliveredKwh: 50,
      maxPowerKw: 100,
      status: "completed",
      durationMinutes: 60,
    },
    {
      id: "sess-002",
      vehicleId: "veh-002",
      vehicleLicensePlate: "XYZ-9999",
      vehicleModel: "Nissan Leaf",
      chargerId: "ext-002",
      chargerModel: "ChargePoint",
      facilityId: "fms-tokyo-001",
      startTimeUtc: new Date("2026-04-14T07:00:00Z"),
      endTimeUtc: new Date("2026-04-14T08:00:00Z"),
      energyDeliveredKwh: 30,
      maxPowerKw: 50,
      status: "completed",
      durationMinutes: 60,
    },
    {
      id: "sess-003",
      vehicleId: "veh-003",
      vehicleLicensePlate: "JKL-5555",
      vehicleModel: "BMW i4",
      chargerId: "ext-001",
      chargerModel: "Tesla V3",
      facilityId: "fms-tokyo-001",
      startTimeUtc: new Date("2026-04-14T09:00:00Z"),
      endTimeUtc: null,
      energyDeliveredKwh: 15,
      maxPowerKw: 150,
      status: "in_progress",
      durationMinutes: null,
    },
    {
      id: "sess-004",
      vehicleId: "veh-004",
      vehicleLicensePlate: "MNO-1111",
      vehicleModel: "Hyundai Ioniq",
      chargerId: "ext-003",
      chargerModel: "ABB Turbo",
      facilityId: "fms-tokyo-001",
      startTimeUtc: new Date("2026-04-14T10:00:00Z"),
      endTimeUtc: new Date("2026-04-14T10:15:00Z"),
      energyDeliveredKwh: 5,
      maxPowerKw: 20,
      status: "failed",
      durationMinutes: 15,
    },
  ];

  it("should render facility name and header", () => {
    render(
      <SessionHistoryClient
        initialSessions={mockSessions}
        facilityName="Tokyo Station"
        initialError={null}
      />,
    );

    expect(screen.getByText("Tokyo Station")).toBeInTheDocument();
    expect(screen.getByText("Charging Session History")).toBeInTheDocument();
  });

  it("should display session data in table", () => {
    render(
      <SessionHistoryClient
        initialSessions={mockSessions}
        facilityName="Tokyo Station"
        initialError={null}
      />,
    );

    expect(screen.getByText("sess-001")).toBeInTheDocument();
    expect(screen.getByText("ABC-1234")).toBeInTheDocument();
    expect(screen.getByText("Tesla Model 3")).toBeInTheDocument();
    expect(screen.getByText("50.00")).toBeInTheDocument(); // Energy kWh
    expect(screen.getByText("completed")).toBeInTheDocument();
  });

  it("should show summary stats", () => {
    render(
      <SessionHistoryClient
        initialSessions={mockMultipleSessions}
        facilityName="Tokyo Station"
        initialError={null}
      />,
    );

    expect(screen.getByText("Total Sessions")).toBeInTheDocument();
    const totalCount = document.querySelector(
      "[data-testid='summary-total-count']",
    );
    expect(totalCount).toHaveTextContent("4");

    expect(screen.getByText("Completed")).toBeInTheDocument();
    const completedCount = document.querySelector(
      "[data-testid='summary-completed-count']",
    );
    expect(completedCount).toHaveTextContent("2");
  });

  it("should show empty state when no sessions", () => {
    render(
      <SessionHistoryClient
        initialSessions={[]}
        facilityName="Tokyo Station"
        initialError={null}
      />,
    );

    expect(
      screen.getByText("No charging sessions found for this facility."),
    ).toBeInTheDocument();
  });

  it("should show error state when initialError is provided", () => {
    render(
      <SessionHistoryClient
        initialSessions={[]}
        facilityName=""
        initialError="Failed to load sessions"
      />,
    );

    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText("Failed to load sessions")).toBeInTheDocument();
  });

  it("should have back link to dashboard", () => {
    render(
      <SessionHistoryClient
        initialSessions={mockSessions}
        facilityName="Tokyo Station"
        initialError={null}
      />,
    );

    const backLink = screen.getByRole("link", { name: /Back to Dashboard/i });
    expect(backLink).toHaveAttribute("href", "/");
  });
});
