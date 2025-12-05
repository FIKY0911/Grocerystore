import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/writeClient";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    console.log("🗑️ Deleting order:", orderId, "for user:", userId);

    // Verify order belongs to user (using read client)
    const order = await client.fetch(
      `*[_type == "order" && _id == $orderId && clerkUserId == $userId][0]`,
      { orderId, userId }
    );

    if (!order) {
      console.log("❌ Order not found or unauthorized");
      return NextResponse.json(
        { error: "Order not found or unauthorized" },
        { status: 404 }
      );
    }

    console.log("✅ Order found, deleting...");

    // Delete the order (using write client)
    await writeClient.delete(orderId);

    console.log("✅ Order deleted successfully:", orderId);

    return NextResponse.json(
      { success: true, message: "Order deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error deleting order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete order" },
      { status: 500 }
    );
  }
}

