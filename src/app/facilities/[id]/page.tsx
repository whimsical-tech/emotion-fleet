import SessionHistoryClient from "./session-history-client";

export default async function SessionHistory({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const res = await fetch(`${baseUrl}/api/facilities/${id}/sessions`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("Failed to fetch sessions");
    const data = await res.json();

    return (
      <SessionHistoryClient
        initialSessions={data.sessions}
        facilityName={data.facilityName}
        initialError={null}
      />
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to load sessions";
    return (
      <SessionHistoryClient
        initialSessions={[]}
        facilityName=""
        initialError={errorMessage}
      />
    );
  }
}
