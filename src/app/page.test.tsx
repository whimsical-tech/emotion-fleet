import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Dashboard from "./page";
import type { NormalizedFacility } from "@/lib/types";

global.fetch = vi.fn();

describe("Dashboard", () => {
  const mockFacilities: NormalizedFacility[] = [
    {
      id: "fac-001",
      fmsRef: "fms-tokyo-001",
      name: "Tokyo Station",
      address: "1-1-1 Chiyoda",
      coordinates: { lat: 35.6812, lng: 139.7671 },
      totalCapacityKw: 150,
      chargers: [],
      currentLoadKw: 75,
      chargerStats: { available: 2, inUse: 1, offline: 0, maintenance: 0 },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Ensures clean state
  });

  it("should show loading state initially", () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise(() => {}),
    );

    render(<Dashboard />);
    expect(screen.getByText("Loading facilities...")).toBeInTheDocument();
  });

  it("should render facilities when data loads", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ facilities: mockFacilities }),
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Tokyo Station")).toBeInTheDocument();
    });

    expect(screen.getByText("75.0 kW")).toBeInTheDocument(); // Current load
    expect(screen.getByText("150 kW")).toBeInTheDocument(); // Total capacity
  });

  it("should calculate progress bar width correctly", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ facilities: mockFacilities }),
    });

    render(<Dashboard />);

    await waitFor(() => {
      const progressBar = document.querySelector(
        "[data-testid='progress-fac-001']",
      );
      expect(progressBar).toHaveStyle("width: 50%"); // 75 / 150 = 50%
    });
  });

  it("should handle division by zero for progress bar", async () => {
    const facilityWithZeroCapacity: NormalizedFacility = {
      ...mockFacilities[0],
      totalCapacityKw: 0,
      currentLoadKw: 0,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ facilities: [facilityWithZeroCapacity] }),
    });

    render(<Dashboard />);

    await waitFor(() => {
      const progressBar = document.querySelector(
        "[data-testid='progress-fac-001']",
      );
      console.log("Progress bar:", progressBar);
      console.log("Progress bar styles:", progressBar?.getAttribute("style"));
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveStyle("width: 0%");
    });
  });

  it("should show error state when fetch fails", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Error")).toBeInTheDocument();
    });
  });

  it("should link to facility detail page", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ facilities: mockFacilities }),
    });

    render(<Dashboard />);

    await waitFor(() => {
      const link = screen.getByRole("link", { name: /View Sessions/i });
      expect(link).toHaveAttribute("href", "/facilities/fac-001");
    });
  });
});
