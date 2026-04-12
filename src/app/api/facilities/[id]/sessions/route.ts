import { NextResponse } from "next/server";
import emsData from "@/mock-data/ems-api.json";
import fmsData from "@/mock-data/fms-api.json";
import {
  mapFacilityWithSessions,
  findEMSFacilityById,
} from "@/lib/mappers/facility";
import { SessionHistoryResponse, EMSData, FMSData } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: facilityId } = await params;
    const typedEmsData = emsData as EMSData;
    const typedFmsData = fmsData as FMSData;

    // Find raw facility using the helper
    const emsFacility = findEMSFacilityById(
      typedEmsData.facilities,
      facilityId,
    );

    if (!emsFacility) {
      return NextResponse.json(
        { error: "Facility not found" },
        { status: 404 },
      );
    }

    // Map only this one facility with its sessions
    const facilityWithSessions = mapFacilityWithSessions(
      emsFacility,
      typedFmsData.chargingSessions,
      typedFmsData.vehicles,
    );

    const response: SessionHistoryResponse = {
      facilityId,
      facilityName: facilityWithSessions.name,
      sessions: facilityWithSessions.sessions,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 },
    );
  }
}
