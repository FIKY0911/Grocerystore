"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

/**
 * Komponen untuk sync user Clerk ke Sanity
 * Letakkan di layout utama agar berjalan saat user login
 */
export default function UserSync() {
  const { user, isLoaded, isSignedIn } = useUser();
  const hasSynced = useRef(false);

  useEffect(() => {
    // Hanya sync sekali per session
    if (!isLoaded || !isSignedIn || !user || hasSynced.current) {
      return;
    }

    const syncUser = async () => {
      try {
        console.log("🔄 Syncing user to Sanity...");
        const response = await fetch("/api/users/sync", {
          method: "POST",
        });

        if (response.ok) {
          console.log("✅ User synced to Sanity");
          hasSynced.current = true;
        } else {
          const data = await response.json();
          // Jangan log error jika masalah authentication (401)
          if (response.status === 401 || response.status === 500) {
            console.warn("⚠️ User sync skipped: Sanity token issue");
            // Tetap tandai sebagai synced agar tidak retry terus
            hasSynced.current = true;
          } else {
            console.error("❌ Failed to sync user:", data.message);
          }
        }
      } catch (error) {
        console.warn("⚠️ User sync skipped due to error");
        // Tetap tandai sebagai synced agar tidak retry terus
        hasSynced.current = true;
      }
    };

    syncUser();
  }, [isLoaded, isSignedIn, user]);

  // Komponen ini tidak render apa-apa
  return null;
}
