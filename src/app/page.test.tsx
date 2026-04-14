import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Dashboard from "./page";
import type { NormalizedFacility } from "@/lib/types";

global.fetch = vi.fn();
let mockFetch = global.fetch as ReturnType<typeof vi.fn>;

const mockFacility: NormalizedFacility = {
  id: "fac-001",
  fmsRef: "fms-tokyo-001",
  name: "Tokyo Station",
  address: "1-1-1 Chiyoda",
  coordinates: { lat: 35.6812, lng: 139.7671 },
  totalCapacityKw: 150,
  chargers: [],
  currentLoadKw: 75,
  chargerStats: { available: 2, inUse: 1, offline: 0, maintenance: 0 },
};

const mockFacility2: NormalizedFacility = {
  id: "fac-002",
  fmsRef: "fms-osaka-001",
  name: "Osaka Station",
  address: "2-2-2 Chuo",
  coordinates: { lat: 34.733, lng: 135.5023 },
  totalCapacityKw: 200,
  chargers: [],
  currentLoadKw: 100,
  chargerStats: { available: 3, inUse: 2, offline: 1, maintenance: 0 },
};

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    mockFetch = global.fetch as ReturnType<typeof vi.fn>;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loading and error states", () => {
    it("should show loading state initially", () => {
      mockFetch.mockReturnValue(new Promise(() => {}));

      render(<Dashboard />);
      expect(screen.getByText("Loading facilities...")).toBeInTheDocument();
    });

    it("should show error state when fetch fails", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText("Error")).toBeInTheDocument();
      });
    });

    it("should handle network error gracefully", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText("Error")).toBeInTheDocument();
      });
    });

    it("should render empty state when no facilities exist", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ facilities: [] }),
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText("No facilities available")).toBeInTheDocument();
      });
    });
  });

  describe("facility rendering", () => {
    it("should render multiple facilities correctly", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ facilities: [mockFacility, mockFacility2] }),
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText("Tokyo Station")).toBeInTheDocument();
        expect(screen.getByText("Osaka Station")).toBeInTheDocument();
      });
    });

    it("should render charger stats correctly", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ facilities: [mockFacility] }),
      });

      render(<Dashboard />);

      await waitFor(() => {
        const availableCount = screen.getByTestId("available-fac-001");
        expect(availableCount).toHaveTextContent("2");
        const inUseCount = screen.getByTestId("inUse-fac-001");
        expect(inUseCount).toHaveTextContent("1");
        const offlineCount = screen.getByTestId("offline-fac-001");
        expect(offlineCount).toHaveTextContent("0");
        const maintenanceCount = screen.getByTestId("maintenance-fac-001");
        expect(maintenanceCount).toHaveTextContent("0");
      });
    });

    it("should link to facility detail page", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ facilities: [mockFacility] }),
      });

      render(<Dashboard />);

      await waitFor(() => {
        const link = screen.getByRole("link", { name: /View Sessions/i });
        expect(link).toHaveAttribute("href", "/facilities/fac-001");
      });
    });
  });

  describe("progress bar", () => {
    it("should calculate progress bar width correctly", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ facilities: [mockFacility] }),
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId("progress-fac-001")).toHaveStyle(
          "width: 50%",
        ); // 75/150
      });
    });

    it("should handle division by zero", async () => {
      const zeroCapacityFacility: NormalizedFacility = {
        ...mockFacility,
        totalCapacityKw: 0,
        currentLoadKw: 0,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ facilities: [zeroCapacityFacility] }),
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId("progress-fac-001")).toHaveStyle("width: 0%");
      });
    });
  });
});
