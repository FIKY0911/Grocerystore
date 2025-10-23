// app/api/midtrans-notification/route.ts
import { reduceStock } from "@/sanity/actions";
import { writeClient } from "@/sanity/lib/writeClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const notification = JSON.parse(body);
  console.log("Midtrans Webhook: Incoming Notification:", notification);

  const { order_id: orderNumber, transaction_status } = notification;
  console.log("Midtrans Webhook: Order Number:", orderNumber, "Transaction Status:", transaction_status);

  let orderStatus = "pending";
  const midtransStatus = transaction_status;

  if (["settlement", "capture"].includes(transaction_status)) {
    orderStatus = "paid";
  } else if (["deny", "cancel", "expire"].includes(transaction_status)) {
    orderStatus = "cancelled";
  }
  console.log("Midtrans Webhook: Derived Order Status:", orderStatus);

  const order = await writeClient.fetch(
    `*[_type == "order" && orderNumber == $orderNumber][0]`,
    { orderNumber }
  );
  console.log("Midtrans Webhook: Fetched Order from Sanity:", order);

  if (order) {
    try {
      const patchResult = await writeClient
        .patch(order._id)
        .set({
          status: orderStatus,
          midtransStatus: midtransStatus,
        })
        .commit();
      console.log("Midtrans Webhook: Sanity Order Patch Result:", patchResult);
    } catch (error: any) {
      console.error("Midtrans Webhook: Error patching Sanity order:", error);
    }
  }

  if (orderStatus === "paid") {
    try {
      await reduceStock(orderNumber);
      console.log("Midtrans Webhook: Stock reduced for order:", orderNumber);
    } catch (error: any) {
      console.error("Midtrans Webhook: Failed to reduce stock:", error);
    }
  }

  return NextResponse.json({ message: "OK" });
}
