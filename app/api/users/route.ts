import { client } from "@/sanity/lib/client";
import { NextResponse } from "next/server";

/**
 * GET /api/users
 * Mendapatkan daftar semua users dari Sanity
 */
export async function GET() {
  try {
    const users = await client.fetch(`
      *[_type == "user"] | order(createdAt desc) {
        _id,
        clerkUserId,
        email,
        firstName,
        lastName,
        fullName,
        imageUrl,
        phone,
        createdAt,
        updatedAt,
        lastSignInAt,
        isActive,
        totalOrders,
        "ordersCount": count(*[_type == "order" && clerkUserId == ^.clerkUserId])
      }
    `);

    return NextResponse.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

