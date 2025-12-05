// app/sanity/actions.ts
import { writeClient } from "@/sanity/lib/writeClient";

export async function reduceStock(orderNumber: string) {
  try {
    const order = await writeClient.fetch(
      `*[_type == "order" && orderNumber == $orderNumber][0]`,
      { orderNumber }
    );

    if (!order) {
      console.error("reduceStock: Order not found in Sanity:", orderNumber);
      throw new Error("Order not found");
    }

    const { products } = order;

    for (const product of products) {
      const productId = product.product._ref;
      const quantity = product.quantity;

      const productDoc = await writeClient.fetch(
        `*[_type == "product" && _id == $productId][0]`,
        { productId }
      );

      if (!productDoc) {
        console.error("reduceStock: Product not found in Sanity:", productId);
        continue;
      }

      const updatedStock = productDoc.stock - quantity;

      if (updatedStock < 0) {
        console.error("reduceStock: Insufficient stock for product:", productId);
        continue;
      }

      await writeClient
        .patch(productId)
        .set({ stock: updatedStock })
        .commit();
    }

    console.log("reduceStock: Stock reduced successfully for order:", orderNumber);
  } catch (error: any) {
    console.error("reduceStock: Error reducing stock:", error);
    throw error;
  }
}
