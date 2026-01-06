import { writeClient } from "@/sanity/lib/writeClient";

interface ClerkUser {
  id: string;
  emailAddresses: { emailAddress: string }[];
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  imageUrl: string;
  phoneNumbers?: { phoneNumber: string }[];
  createdAt: number;
}

/**
 * Sync user dari Clerk ke Sanity
 * Dipanggil saat user login/register
 */
export async function syncUserToSanity(user: ClerkUser) {
  if (!user?.id) {
    console.log("❌ syncUserToSanity: No user provided");
    return null;
  }

  try {
    console.log("🔄 Syncing user to Sanity:", user.id);

    // Cek apakah user sudah ada di Sanity
    const existingUser = await writeClient.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]`,
      { clerkUserId: user.id }
    );

    const userData = {
      clerkUserId: user.id,
      email: user.emailAddresses?.[0]?.emailAddress || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      fullName: user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
      imageUrl: user.imageUrl || "",
      phone: user.phoneNumbers?.[0]?.phoneNumber || "",
      updatedAt: new Date().toISOString(),
      lastSignInAt: new Date().toISOString(),
      isActive: true,
    };

    if (existingUser) {
      // Update existing user
      console.log("📝 Updating existing user:", existingUser._id);
      const result = await writeClient
        .patch(existingUser._id)
        .set(userData)
        .commit();
      console.log("✅ User updated in Sanity");
      return result;
    } else {
      // Create new user
      console.log("➕ Creating new user in Sanity");
      const result = await writeClient.create({
        _type: "user",
        ...userData,
        createdAt: new Date(user.createdAt).toISOString(),
        totalOrders: 0,
      });
      console.log("✅ User created in Sanity:", result._id);
      return result;
    }
  } catch (error: any) {
    // Handle specific Sanity authentication errors
    if (error?.statusCode === 401) {
      console.error("❌ Sanity Authentication Error: Token tidak valid atau expired");
      console.error("💡 Solusi: Generate token baru dari Sanity dashboard dengan permission Editor/Admin");
      console.error("🔗 URL: https://www.sanity.io/manage/personal/project/4pdrsxhm/api/tokens");
    } else {
      console.error("❌ Error syncing user to Sanity:", error);
    }
    // Return null instead of throwing to prevent app crash
    return null;
  }
}
