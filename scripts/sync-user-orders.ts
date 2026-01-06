/**
 * Script untuk sync total orders semua user
 * Jalankan dengan: npx tsx scripts/sync-user-orders.ts
 */

import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "4pdrsxhm",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2025-10-10",
  token: process.env.SANITY_WRITE_READ_TOKEN,
  useCdn: false,
});

async function syncAllUserOrders() {
  console.log("🔄 Starting user orders sync...\n");

  try {
    // Get all users
    const users = await client.fetch(`*[_type == "user"]{_id, clerkUserId, fullName, email}`);
    console.log(`📊 Found ${users.length} users\n`);

    for (const user of users) {
      // Count orders for this user
      const orderCount = await client.fetch(
        `count(*[_type == "order" && clerkUserId == $clerkUserId])`,
        { clerkUserId: user.clerkUserId }
      );

      console.log(`👤 ${user.fullName || user.email}: ${orderCount} orders`);

      // Update user's totalOrders
      await client
        .patch(user._id)
        .set({
          totalOrders: orderCount,
          updatedAt: new Date().toISOString(),
        })
        .commit();

      console.log(`   ✅ Updated\n`);
    }

    console.log("✅ All users synced successfully!");
  } catch (error) {
    console.error("❌ Error syncing users:", error);
  }
}

syncAllUserOrders();
