import { writeClient } from "@/sanity/lib/writeClient";

/**
 * Update total orders untuk user di Sanity
 * Dipanggil setelah order berhasil dibuat
 */
export async function updateUserOrderCount(clerkUserId: string) {
  if (!clerkUserId) {
    console.log("❌ updateUserOrderCount: No clerkUserId provided");
    return null;
  }

  try {
    console.log("📊 Updating order count for user:", clerkUserId);

    // Cari user di Sanity
    const user = await writeClient.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]`,
      { clerkUserId }
    );

    if (!user) {
      console.log("ℹ️ User not found in Sanity, skipping order count update");
      return null;
    }

    // Hitung total orders dari database
    const orderCount = await writeClient.fetch(
      `count(*[_type == "order" && clerkUserId == $clerkUserId])`,
      { clerkUserId }
    );

    console.log(`📊 User ${clerkUserId} has ${orderCount} orders`);

    // Update totalOrders di user
    const result = await writeClient
      .patch(user._id)
      .set({
        totalOrders: orderCount,
        updatedAt: new Date().toISOString(),
      })
      .commit();

    console.log("✅ User order count updated:", orderCount);
    return result;
  } catch (error) {
    console.error("❌ Error updating user order count:", error);
    return null;
  }
}

/**
 * Increment total orders untuk user (lebih cepat, tanpa query count)
 */
export async function incrementUserOrderCount(clerkUserId: string) {
  if (!clerkUserId) {
    console.log("❌ incrementUserOrderCount: No clerkUserId provided");
    return null;
  }

  try {
    console.log("📊 Incrementing order count for user:", clerkUserId);

    // Cari user di Sanity
    const user = await writeClient.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]{_id, totalOrders}`,
      { clerkUserId }
    );

    if (!user) {
      console.log("ℹ️ User not found in Sanity, skipping order count increment");
      return null;
    }

    const newCount = (user.totalOrders || 0) + 1;

    // Update totalOrders di user
    const result = await writeClient
      .patch(user._id)
      .set({
        totalOrders: newCount,
        updatedAt: new Date().toISOString(),
      })
      .commit();

    console.log("✅ User order count incremented to:", newCount);
    return result;
  } catch (error) {
    console.error("❌ Error incrementing user order count:", error);
    return null;
  }
}
