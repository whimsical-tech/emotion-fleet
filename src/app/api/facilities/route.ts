import { NextResponse } from "next/server";
import emsData from "@/mock-data/ems-api.json";
import fmsData from "@/mock-data/fms-api.json";
import { mapAllFacilitiesWithSessions } from "@/lib/mappers/facility";
import { FacilityStatusResponse, EMSData, FMSData } from "@/lib/types";

export async function GET() {
  try {
    const typedEmsData = emsData as EMSData;
    const typedFmsData = fmsData as FMSData;

    // Map all facilities with their sessions
    const allFacilities = mapAllFacilitiesWithSessions(
      typedEmsData.facilities,
      typedFmsData.chargingSessions,
      typedFmsData.vehicles,
    );

    // Remove sessions from status endpoint (only return facility status)
    const facilities = allFacilities.map(
      ({ sessions, ...facility }) => facility,
    );

    const response: FacilityStatusResponse = {
      facilities,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching facilities:", error);
    return NextResponse.json(
      { error: "Failed to fetch facilities" },
      { status: 500 },
    );
  }
}
