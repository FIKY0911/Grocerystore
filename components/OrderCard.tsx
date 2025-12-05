import { MY_ORDERS_QUERYResult } from "@/sanity.types";
import PriceFormatter from "./PriceFormatter";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Calendar, Package, MapPin, ShoppingCart, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
import useStore from "@/store";
import toast from "react-hot-toast";

interface OrderCardProps {
  order: MY_ORDERS_QUERYResult[0];
  onReorder?: () => void;
}

const OrderCard = ({ order, onReorder }: OrderCardProps) => {
  const { addItem } = useStore();

  const handleReorder = () => {
    if (!order.products || order.products.length === 0) {
      toast.error("Tidak ada produk untuk di-reorder");
      return;
    }

    let addedCount = 0;
    order.products.forEach((item) => {
      if (item.product) {
        // Add each product with its quantity
        for (let i = 0; i < (item.quantity || 1); i++) {
          addItem(item.product);
        }
        addedCount++;
      }
    });

    if (addedCount > 0) {
      toast.success(`${addedCount} produk ditambahkan ke cart!`);
      if (onReorder) onReorder();
    } else {
      toast.error("Gagal menambahkan produk ke cart");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || "";

    switch (statusLower) {
      case "paid":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            Lunas
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
            Menunggu
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-500 hover:bg-red-600 text-white">
            Dibatalkan
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600 text-white">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header - Tanggal & Status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          {new Date(order.orderDate || "").toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </div>
        {getStatusBadge(order.status || "")}
      </div>

      {/* Nama Barang */}
      <div className="space-y-3 mb-4">
        {order.products?.map((item, index) => (
          <div key={index} className="flex items-center gap-3 group">
            {item.product?.images?.[0] && (
              <Link
                href={`/product/${item.product.slug}`}
                className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 hover:ring-2 hover:ring-green-500 transition-all"
              >
                <Image
                  src={urlFor(item.product.images[0]).url()}
                  alt={item.product.name || "Product"}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform"
                />
              </Link>
            )}
            <div className="flex-1 min-w-0">
              <Link
                href={`/product/${item.product?.slug}`}
                className="text-sm font-medium text-gray-900 hover:text-green-600 transition-colors line-clamp-1"
              >
                {item.product?.name}
              </Link>
              <p className="text-xs text-gray-600">
                Qty: {item.quantity}x
              </p>
            </div>
            {/* Harga per item */}
            <div className="text-right">
              <PriceFormatter
                amount={(item.priceAtPurchase || 0) * (item.quantity || 0)}
                className="text-sm font-semibold"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Shipper */}
      {order.shipper && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 pb-3 border-b">
          <Package className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium text-gray-900">{order.shipper.name}</span>
        </div>
      )}

      {/* Alamat */}
      {order.address && (
        <div className="flex items-start gap-2 text-sm text-gray-600 mb-3 pb-3 border-b">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-900">{order.address.name}</p>
            <p className="text-xs">
              {order.address.address}, {order.address.city}
            </p>
          </div>
        </div>
      )}

      {/* Total Harga */}
      <div className="flex items-center justify-between pt-3 border-t">
        <span className="text-sm font-medium text-gray-700">Total Harga</span>
        <PriceFormatter
          amount={order.totalPrice || 0}
          className="text-lg font-bold text-gray-900"
        />
      </div>

      {/* Actions */}
      <div className="mt-4 pt-3 border-t space-y-2">
        {/* Payment Button for Pending Orders */}
        {order.status === "pending" && order.paymentUrl && (
          <a
            href={order.paymentUrl}
            className="block w-full text-center bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md text-sm font-semibold transition-colors shadow-sm hover:shadow-md"
          >
            💳 Bayar Sekarang
          </a>
        )}

        {/* Reorder Button */}
        <Button
          onClick={handleReorder}
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          Pesan Lagi
        </Button>

        {order.status === "pending" && order.paymentUrl && (
          <p className="text-xs text-gray-500 text-center">
            Klik "Bayar Sekarang" untuk melanjutkan pembayaran
          </p>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
