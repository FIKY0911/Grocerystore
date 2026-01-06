import { currentUser } from "@clerk/nextjs/server";
import { syncUserToSanity } from "@/lib/syncUser";
import { NextResponse } from "next/server";

/**
 * POST /api/users/sync
 * Sync current logged-in user ke Sanity
 */
export async function POST() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const result = await syncUserToSanity({
      id: user.id,
      emailAddresses: user.emailAddresses.map((e) => ({
        emailAddress: e.emailAddress,
      })),
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      imageUrl: user.imageUrl,
      phoneNumbers: user.phoneNumbers?.map((p) => ({
        phoneNumber: p.phoneNumber,
      })),
      createdAt: user.createdAt,
    });

    if (result) {
      return NextResponse.json({
        success: true,
        message: "User synced successfully",
        data: result,
      });
    } else {
      // Jika result null, kemungkinan ada masalah token
      // Tapi kita return 200 agar tidak mengganggu user experience
      return NextResponse.json(
        { 
          success: false, 
          message: "User sync skipped - check Sanity token configuration",
          warning: "Application will continue to work normally"
        },
        { status: 200 } // Changed from 500 to 200
      );
    }
  } catch (error: any) {
    console.error("Error in sync user API:", error);
    // Return 200 instead of 500 to prevent blocking user
    return NextResponse.json(
      { 
        success: false, 
        message: "User sync skipped",
        warning: "Application will continue to work normally"
      },
      { status: 200 } // Changed from 500 to 200
    );
  }
}
