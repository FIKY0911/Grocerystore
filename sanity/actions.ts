import { writeClient } from "./lib/writeClient";

export async function reduceStock(orderId: string) {
  const order = await writeClient.fetch(
    `*[_type == "order" && orderNumber == $orderId][0]`,
    { orderId }
  );

  if (!order || !order.products) {
    throw new Error("Order not found or has no products");
  }

  const transaction = writeClient.transaction();

  for (const item of order.products) {
    const product = await writeClient.getDocument(item.product._ref);

    if (!product) {
      throw new Error(`Product with ref ${item.product._ref} not found`);
    }

    const newStock = (product.stock as number) - item.quantity;

    if (newStock < 0) {
      throw new Error(`Not enough stock for product ${product.name}`);
    }

    transaction.patch(item.product._ref, { set: { stock: newStock } });
  }

  await transaction.commit();
}
