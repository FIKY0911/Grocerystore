// API route untuk check payment status dari Xendit
import { NextRequest, NextResponse } from "next/server";
import { getXenditServerKey, getXenditAuthHeader } from "@/lib/xendit";

export async function POST(req: NextRequest) {
  try {
    const { invoiceId } = await req.json();

    if (!invoiceId) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      );
    }

    console.log("🔍 Checking payment status for invoice:", invoiceId);

    // Get invoice status from Xendit
    const response = await fetch(`https://api.xendit.co/v2/invoices/${invoiceId}`, {
      method: "GET",
      headers: {
        Authorization: getXenditAuthHeader(),
      },
    });

    if (!response.ok) {
      console.error("❌ Failed to get invoice from Xendit");
      return NextResponse.json(
        { error: "Failed to check payment status" },
        { status: 500 }
      );
    }

    const invoice = await response.json();
    
    console.log("✅ Invoice status:", invoice.status);

    // Map Xendit status to order status
    let orderStatus = "pending";
    if (invoice.status === "PAID" || invoice.status === "SETTLED") {
      orderStatus = "paid";
    } else if (invoice.status === "EXPIRED" || invoice.status === "FAILED") {
      orderStatus = "cancelled";
    }

    return NextResponse.json({
      success: true,
      xenditStatus: invoice.status,
      orderStatus: orderStatus,
      paidAt: invoice.paid_at,
    });
  } catch (error: any) {
    console.error("❌ Error checking payment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check payment status" },
      { status: 500 }
    );
  }
}

