"use client";

import { useState, useMemo } from "react";
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

dayjs.extend(utc);

export default function SessionHistoryClient({
  initialSessions, // NEW COMMENT: naming "initial" could be misleading due to ISR
  facilityName,
  initialError,
}: SessionHistoryClientProps) {
  const [loading, setLoading] = useState(false);

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

  /*
  * NEW COMMENT: filtering is happening on every render, useMemo would be better.
  const stats = useMemo(() => {
    return {
      completed: initialSessions.filter((s) => s.status === "completed").length,
      inProgress: initialSessions.filter((s) => s.status === "in_progress")
        .length,
    };
  }, [initialSessions]);
  */

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
          <p>{initialError}</p>
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
            <span
              data-testid="summary-total-count"
              className={styles.summaryValue}
            >
              {initialSessions.length}
            </span>
          </div>
          <div className={styles.summaryStat}>
            <span className={styles.summaryLabel}>Completed</span>
            <span
              data-testid="summary-completed-count"
              className={`${styles.summaryValue} ${styles.completed}`}
            >
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
                      <div
                        className={styles.vehiclePlate}
                        data-testid={`vehicle-plate-${session.id}`}
                      >
                        {session.vehicleLicensePlate}
                      </div>
                      <div
                        className={styles.vehicleModel}
                        data-testid={`vehicle-model-${session.id}`}
                      >
                        {session.vehicleModel}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.chargerInfo}>
                      <div
                        className={styles.chargerId}
                        data-testid={`charger-id-${session.id}`}
                      >
                        {session.chargerId}
                      </div>
                      <div
                        className={styles.chargerModel}
                        data-testid={`charger-model-${session.id}`}
                      >
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
                    {/* TBD: how should the number below be displayed? */}
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
