"use client";

import { useState } from "react";
import { MY_ORDERS_QUERYResult } from "@/sanity.types";
import PriceFormatter from "@/components/PriceFormatter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, LayoutGrid, LayoutList, ShoppingCart } from "lucide-react";
import OrderCard from "@/components/OrderCard";
import Link from "next/link";
import useStore from "@/store";
import toast from "react-hot-toast";

interface OrdersViewProps {
  orders: MY_ORDERS_QUERYResult;
  onDelete: (orderId: string) => void;
  onReorder?: () => void;
}

type ViewMode = "table" | "grid";

const OrdersView = ({ orders, onDelete, onReorder }: OrdersViewProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const { addItem } = useStore();

  const handleReorder = (order: MY_ORDERS_QUERYResult[0]) => {
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
          <Badge className="bg-green-500 hover:bg-green-600 text-white px-3 py-1">
            Lunas
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1">
            Menunggu
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-500 hover:bg-red-600 text-white px-3 py-1">
            Dibatalkan
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500 hover:bg-g600 text-white px-3 py-1">
            {status}
          </Badge>
        );
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pesanan ini?")) return;

    // Optimistic update - remove from UI immediately
    onDelete(orderId);
    toast.loading("Menghapus pesanan...", { id: orderId });

    try {
      const response = await fetch("/api/orders/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      if (response.ok) {
        toast.success("Pesanan berhasil dihapus", { id: orderId });
      } else {
        toast.error("Gagal menghapus pesanan", { id: orderId });
        // TODO: Rollback optimistic update if needed
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Terjadi kesalahan", { id: orderId });
      // TODO: Rollback optimistic update if needed
    }
  };

  if (viewMode === "grid") {
    return (
      <div>
        {/* View Toggle */}
        <div className="flex justify-end mb-4">
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
            >
              <LayoutList className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Grid View */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <div key={order._id} className="relative">
              <OrderCard order={order} onReorder={() => handleReorder(order)} />
              <button
                onClick={() => handleDelete(order._id)}
                className="absolute top-2 right-2 text-red-600 hover:text-red-800 bg-white rounded-full p-1.5 shadow-sm hover:shadow-md transition-all z-10"
                title="Delete order"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Table View
  return (
    <div>
      {/* View Toggle */}
      <div className="flex justify-end mb-4">
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            <LayoutList className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Table View */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Nama Barang
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Harga
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Shipper
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Alamat
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Tanggal */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(order.orderDate || "").toLocaleDateString(
                      "id-ID",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </td>

                  {/* Nama Barang */}
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex flex-col gap-1 max-w-xs">
                      {order.products && order.products.length > 0 ? (
                        order.products.map((item, idx) => (
                          <Link
                            key={idx}
                            href={`/product/${item.product?.slug || '#'}`}
                            className="text-xs hover:text-green-600 transition-colors truncate"
                          >
                            • {item.product?.name || '❌ Product not found'} ({item.quantity}x)
                          </Link>
                        ))
                      ) : (
                        <span className="text-xs text-red-500">
                          ⚠️ No products
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Harga */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    <PriceFormatter amount={order.totalPrice || 0} />
                  </td>

                  {/* Shipper */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {order.shipper?.name || "-"}
                  </td>

                  {/* Alamat */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {order.address ? (
                      <div className="max-w-xs">
                        <p className="font-medium text-gray-900 text-xs">
                          {order.address.name}
                        </p>
                        <p className="text-xs truncate">
                          {order.address.address}, {order.address.city}
                        </p>
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(order.status || "")}
                  </td>

                  {/* Aksi */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      {order.status === "pending" && order.paymentUrl && (
                        <a
                          href={order.paymentUrl}
                          className="text-green-600 hover:text-green-800 transition-colors inline-flex items-center justify-center"
                          title="Bayar"
                        >
                          💳
                        </a>
                      )}
                      <button
                        onClick={() => handleReorder(order)}
                        className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center justify-center"
                        title="Pesan lagi"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(order._id)}
                        className="text-red-600 hover:text-red-800 transition-colors inline-flex items-center justify-center"
                        title="Hapus"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersView;

