import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SessionHistoryClient from "./session-history-client";
import type { NormalizedSession } from "@/lib/types";

const mockSessions: NormalizedSession[] = [
  {
    id: "session-001",
    vehicleId: "vehicle-001",
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
    id: "session-002",
    vehicleId: "vehicle-002",
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
    id: "session-003",
    vehicleId: "vehicle-003",
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
    id: "session-004",
    vehicleId: "vehicle-004",
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

describe("SessionHistoryClient", () => {
  describe("header and navigation", () => {
    it("should render facility name and section title", () => {
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

  describe("summary stats", () => {
    it("should display correct total sessions count", () => {
      render(
        <SessionHistoryClient
          initialSessions={mockSessions}
          facilityName="Tokyo Station"
          initialError={null}
        />,
      );

      expect(screen.getByTestId("summary-total-count")).toHaveTextContent("4");
    });

    it("should display correct completed sessions count", () => {
      render(
        <SessionHistoryClient
          initialSessions={mockSessions}
          facilityName="Tokyo Station"
          initialError={null}
        />,
      );

      expect(screen.getByTestId("summary-completed-count")).toHaveTextContent(
        "2",
      );
    });

    it("should display correct in-progress sessions count", () => {
      render(
        <SessionHistoryClient
          initialSessions={mockSessions}
          facilityName="Tokyo Station"
          initialError={null}
        />,
      );

      expect(
        screen.getByText("In Progress").nextElementSibling,
      ).toHaveTextContent("1");
    });
  });

  describe("table rendering", () => {
    it("should render table headers", () => {
      render(
        <SessionHistoryClient
          initialSessions={mockSessions}
          facilityName="Tokyo Station"
          initialError={null}
        />,
      );

      expect(screen.getByText("Session ID")).toBeInTheDocument();
      expect(screen.getByText("Vehicle")).toBeInTheDocument();
      expect(screen.getByText("Charger")).toBeInTheDocument();
      expect(screen.getByText("Start Time (UTC)")).toBeInTheDocument();
      expect(screen.getByText("Duration")).toBeInTheDocument();
      expect(screen.getByText("Energy (kWh)")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
    });

    it("should display session data in table rows", () => {
      render(
        <SessionHistoryClient
          initialSessions={[mockSessions[0]]}
          facilityName="Tokyo Station"
          initialError={null}
        />,
      );

      expect(screen.getByText("session-001")).toBeInTheDocument();
      expect(screen.getByText("ABC-1234")).toBeInTheDocument();
      expect(screen.getByText("Tesla Model 3")).toBeInTheDocument();
      expect(screen.getByText("ext-001")).toBeInTheDocument();
      expect(screen.getByText("Tesla V3")).toBeInTheDocument();
      expect(screen.getByText("50.00")).toBeInTheDocument();
      expect(screen.getByText("60 min")).toBeInTheDocument();
    });

    it("should format timestamp correctly", () => {
      render(
        <SessionHistoryClient
          initialSessions={mockSessions}
          facilityName="Tokyo Station"
          initialError={null}
        />,
      );

      expect(screen.getByText("2026-04-14 05:30:00")).toBeInTheDocument();
    });

    it("should format energy with 2 decimal places", () => {
      render(
        <SessionHistoryClient
          initialSessions={mockSessions}
          facilityName="Tokyo Station"
          initialError={null}
        />,
      );

      expect(screen.getByText("50.00")).toBeInTheDocument();
    });

    it("should render multiple sessions in table", () => {
      render(
        <SessionHistoryClient
          initialSessions={mockSessions}
          facilityName="Tokyo Station"
          initialError={null}
        />,
      );

      expect(screen.getByText("session-001")).toBeInTheDocument();
      expect(screen.getByText("session-002")).toBeInTheDocument();
      expect(screen.getByText("session-003")).toBeInTheDocument();
      expect(screen.getByText("session-004")).toBeInTheDocument();
    });

    it("should handle session with null durationMinutes", () => {
      render(
        <SessionHistoryClient
          initialSessions={[mockSessions[2]]} // in_progress session
          facilityName="Tokyo Station"
          initialError={null}
        />,
      );

      // should prob use data-testid here too
      expect(screen.getByText("—")).toBeInTheDocument();
      expect(screen.queryByText("null")).not.toBeInTheDocument();
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
          facilityName="Tokyo Station"
          initialError="Failed to load sessions"
        />,
      );

      expect(screen.getByText("Error")).toBeInTheDocument();
      expect(screen.getByText("Failed to load sessions")).toBeInTheDocument();
    });

    it("should show back link even in error state", () => {
      render(
        <SessionHistoryClient
          initialSessions={[]}
          facilityName="Tokyo Station"
          initialError="Failed to load sessions"
        />,
      );

      const backLink = screen.getByRole("link", { name: /Back to Dashboard/i });
      expect(backLink).toBeInTheDocument();
    });
  });

  describe("vehicle and charger info", () => {
    it("should display vehicle license plate and model together", () => {
      render(
        <SessionHistoryClient
          initialSessions={mockSessions}
          facilityName="Tokyo Station"
          initialError={null}
        />,
      );

      expect(screen.getByTestId("vehicle-plate-session-001")).toHaveTextContent(
        "ABC-1234",
      );
      expect(screen.getByTestId("vehicle-model-session-001")).toHaveTextContent(
        "Tesla Model 3",
      );
    });

    it("should display charger ID and model together", () => {
      render(
        <SessionHistoryClient
          initialSessions={mockSessions}
          facilityName="Tokyo Station"
          initialError={null}
        />,
      );

      expect(screen.getByTestId("charger-id-session-001")).toHaveTextContent(
        "ext-001",
      );
      expect(screen.getByTestId("charger-model-session-001")).toHaveTextContent(
        "Tesla V3",
      );
    });

    it("should display different vehicles and chargers for multiple sessions", () => {
      render(
        <SessionHistoryClient
          initialSessions={mockSessions}
          facilityName="Tokyo Station"
          initialError={null}
        />,
      );

      expect(screen.getByTestId("vehicle-plate-session-001")).toHaveTextContent(
        "ABC-1234",
      );
      expect(screen.getByTestId("vehicle-model-session-001")).toHaveTextContent(
        "Tesla Model 3",
      );
      expect(screen.getByTestId("charger-model-session-001")).toHaveTextContent(
        "Tesla V3",
      );

      expect(screen.getByTestId("vehicle-plate-session-002")).toHaveTextContent(
        "XYZ-9999",
      );
      expect(screen.getByTestId("charger-model-session-002")).toHaveTextContent(
        "ChargePoint",
      );

      expect(screen.getByTestId("vehicle-plate-session-003")).toHaveTextContent(
        "JKL-5555",
      );
      expect(screen.getByTestId("charger-model-session-003")).toHaveTextContent(
        "Tesla V3",
      );

      expect(screen.getByTestId("vehicle-plate-session-004")).toHaveTextContent(
        "MNO-1111",
      );
      expect(screen.getByTestId("charger-model-session-004")).toHaveTextContent(
        "ABB Turbo",
      );
    });
  });
});
