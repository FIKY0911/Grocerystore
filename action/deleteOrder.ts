"use server";

import { writeClient } from "@/sanity/lib/writeClient";
import { revalidatePath } from "next/cache";

export async function deleteOrder(orderId: string) {
  try {
    await writeClient.delete(orderId);
    revalidatePath("/orders"); // Revalidate the /orders page to show updated list
    return { success: true, message: "Order deleted successfully." };
  } catch (error) {
    console.error("Failed to delete order:", error);
    return { success: false, message: "Failed to delete order." };
  }
}