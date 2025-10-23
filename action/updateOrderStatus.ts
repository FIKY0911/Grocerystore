"use server";

import { writeClient } from "@/sanity/lib/writeClient";

interface UpdateOrderStatusResult {
  success: boolean;
  message: string;
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  midtransStatus?: string
): Promise<UpdateOrderStatusResult> {
  try {
    const updateDoc: { status: string; midtransStatus?: string } = { status };
    if (midtransStatus) {
      updateDoc.midtransStatus = midtransStatus;
    }

    await writeClient
      .patch(orderId)
      .set(updateDoc)
      .commit();

    return { success: true, message: "Status pesanan berhasil diperbarui." };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, message: "Gagal memperbarui status pesanan." };
  }
}