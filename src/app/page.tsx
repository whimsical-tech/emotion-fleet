"use client";

import { useEffect, useState } from "react";
import { NormalizedFacility } from "@/lib/types";
import Link from "next/link";
import styles from "./homepage.module.css";

export default function Dashboard() {
  const [facilities, setFacilities] = useState<NormalizedFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const res = await fetch("/api/facilities");
        if (!res.ok) throw new Error("Failed to fetch facilities");
        const data = await res.json();
        setFacilities(data.facilities);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <p>Loading facilities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (facilities.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p>No facilities available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Facility Status Dashboard</h1>
        <p>Monitor charging infrastructure across all facilities</p>
      </header>

      <div className={styles.facilitiesGrid}>
        {facilities.map((facility) => (
          <Link key={facility.id} href={`/facilities/${facility.id}`}>
            <div className={styles.facilityCard}>
              <div className={styles.cardHeader}>
                <h2>{facility.name}</h2>
                <p className={styles.address}>{facility.address}</p>
              </div>

              <div className={styles.cardContent}>
                <div className={styles.statRow}>
                  <span className={styles.label}>Current Load</span>
                  <span className={styles.value}>
                    {facility.currentLoadKw.toFixed(1)} kW
                  </span>
                </div>

                <div className={styles.statRow}>
                  <span className={styles.label}>Total Capacity</span>
                  <span className={styles.value}>
                    {facility.totalCapacityKw} kW
                  </span>
                </div>

                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    data-testid={`progress-${facility.id}`}
                    style={{
                      width: `${
                        facility.totalCapacityKw === 0
                          ? 0
                          : Math.min(
                              (facility.currentLoadKw /
                                facility.totalCapacityKw) *
                                100,
                              100,
                            )
                      }%`,
                    }}
                  />
                </div>

                <div className={styles.chargerStats}>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Available</span>
                    <span
                      data-testid={`available-${facility.id}`}
                      className={`${styles.statNumber} ${styles.available}`}
                    >
                      {facility.chargerStats.available}
                    </span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>In Use</span>
                    <span
                      data-testid={`inUse-${facility.id}`}
                      className={`${styles.statNumber} ${styles.inUse}`}
                    >
                      {facility.chargerStats.inUse}
                    </span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Offline</span>
                    <span
                      data-testid={`offline-${facility.id}`}
                      className={`${styles.statNumber} ${styles.offline}`}
                    >
                      {facility.chargerStats.offline}
                    </span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Maintenance</span>
                    <span
                      data-testid={`maintenance-${facility.id}`}
                      className={`${styles.statNumber} ${styles.maintenance}`}
                    >
                      {facility.chargerStats.maintenance}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.cardFooter}>View Sessions →</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
