"use client";

import { useState } from "react";
import { NormalizedSession } from "@/lib/types";
import Link from "next/link";
import styles from "./session-history.module.css";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

interface SessionHistoryClientProps {
  initialSessions: NormalizedSession[];
  facilityName: string;
  initialError: string | null;
}

export default function SessionHistoryClient({
  initialSessions,
  facilityName,
  initialError,
}: SessionHistoryClientProps) {
  dayjs.extend(utc);

  const [loading, setLoading] = useState(false);

  /* TODO: what would a "refetching" strategy look like? */

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "completed":
        return styles.statusCompleted;
      case "in_progress":
        return styles.statusInProgress;
      case "interrupted":
        return styles.statusInterrupted;
      case "failed":
        return styles.statusFailed;
      default:
        return styles.statusDefault;
    }
  };

  const completedCount = initialSessions.filter(
    (s) => s.status === "completed",
  ).length;
  const inProgressCount = initialSessions.filter(
    (s) => s.status === "in_progress",
  ).length;

  if (initialError) {
    return (
      <div className={styles.container}>
        <Link href="/" className={styles.backLink}>
          ← Back to Dashboard
        </Link>
        <div className={styles.errorState}>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className={styles.container}> Loading... </div>;
  }

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backLink}>
        ← Back to Dashboard
      </Link>

      <header className={styles.header}>
        <div className={styles.title}>
          <h1>{facilityName}</h1>
          <p>Charging Session History</p>
        </div>

        <div className={styles.summaryStats}>
          <div className={styles.summaryStat}>
            <span className={styles.summaryLabel}>Total Sessions</span>
            <span className={styles.summaryValue}>
              {initialSessions.length}
            </span>
          </div>
          <div className={styles.summaryStat}>
            <span className={styles.summaryLabel}>Completed</span>
            <span className={`${styles.summaryValue} ${styles.completed}`}>
              {completedCount}
            </span>
          </div>
          <div className={styles.summaryStat}>
            <span className={styles.summaryLabel}>In Progress</span>
            <span className={`${styles.summaryValue} ${styles.inProgress}`}>
              {inProgressCount}
            </span>
          </div>
        </div>
      </header>

      {initialSessions.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No charging sessions found for this facility.</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Session ID</th>
                <th>Vehicle</th>
                <th>Charger</th>
                <th>Start Time (UTC)</th>
                <th>Duration</th>
                <th className={styles.alignRight}>Energy (kWh)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {initialSessions.map((session) => (
                <tr key={session.id}>
                  <td className={styles.sessionId}>{session.id}</td>
                  <td>
                    <div className={styles.vehicleInfo}>
                      <div className={styles.vehiclePlate}>
                        {session.vehicleLicensePlate}
                      </div>
                      <div className={styles.vehicleModel}>
                        {session.vehicleModel}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.chargerInfo}>
                      <div className={styles.chargerId}>
                        {session.chargerId}
                      </div>
                      <div className={styles.chargerModel}>
                        {session.chargerModel}
                      </div>
                    </div>
                  </td>
                  <td className={styles.timestamp}>
                    {session.startTimeUtc &&
                      dayjs(session.startTimeUtc)
                        .utc()
                        .format("YYYY-MM-DD HH:mm:ss")}
                  </td>
                  <td className={styles.duration}>
                    {session.durationMinutes
                      ? `${session.durationMinutes} min`
                      : "—"}
                  </td>
                  <td className={`${styles.energy} ${styles.alignRight}`}>
                    {session.energyDeliveredKwh.toFixed(2)}
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${getStatusBadgeClass(session.status)}`}
                    >
                      {session.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
