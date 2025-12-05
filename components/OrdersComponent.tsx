"use client";

import { MY_ORDERS_QUERYResult } from "@/sanity.types";
import { TableBody, TableCell, TableRow } from "./ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import PriceFormatter from "./PriceFormatter";
import { format } from "date-fns";
import { X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import OrderDetailDialog from "./OrderDetailDialog";
import { deleteOrder } from "@/action/deleteOrder";
import { Button } from "./ui/button";
import useStore from "@/store";

// Fungsi bantu: dapatkan kelas warna berdasarkan status
const getStatusBadgeClass = (status: string | null | undefined) => {
  if (!status) return "bg-gray-100 text-gray-800";

  switch (status.toLowerCase()) {
    case "paid":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
    case "failed":
      return "bg-red-100 text-red-800";
    case "processing":
    case "shipped":
    case "delivered":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Fungsi bantu: ubah status jadi teks ramah pengguna
const getFriendlyStatus = (status: string | null | undefined) => {
  if (!status) return "Tidak diketahui";

  const map: Record<string, string> = {
    paid: "Lunas",
    pending: "Menunggu Bayar",
    cancelled: "Dibatalkan",
    processing: "Diproses",
    shipped: "Dikirim",
    delivered: "Diterima",
    failed: "Gagal",
  };

  return (
    map[status.toLowerCase()] ||
    status.charAt(0).toUpperCase() + status.slice(1)
  );
};

const OrdersComponent = ({ orders }: { orders: MY_ORDERS_QUERYResult }) => {
  const [selectedOrder, setSelectedOrder] = useState<
    MY_ORDERS_QUERYResult[number] | null
  >(null);
  const { removeOrder } = useStore();

  const handleDelete = async (orderId: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus pesanan ini?")) {
      try {
        const result = await deleteOrder(orderId);
        if (result.success) {
          toast.success(result.message);
          removeOrder(orderId);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        console.error("Error deleting order:", error);
        toast.error("Gagal menghapus pesanan.");
      }
    }
  };

  const handlePay = (order: MY_ORDERS_QUERYResult[number]) => {
    if (!order.paymentUrl) {
      toast.error("URL pembayaran tidak ditemukan untuk pesanan ini.");
      return;
    }
    // Redirect user to the payment URL
    window.location.href = order.paymentUrl;
  };

  return (
    <>
      <TableBody>
        <TooltipProvider>
          {orders.map((order) => (
            <Tooltip key={order?._id || order?.orderNumber}>
              <TooltipTrigger asChild>
                <TableRow
                  className="cursor-pointer hover:bg-gray-100 h-16"
                  onClick={() => setSelectedOrder(order)}
                >
                  <TableCell className="font-mono">
                    {order.orderNumber
                      ? `${order.orderNumber.slice(0, 5)}...${order.orderNumber.slice(-5)}`
                      : "N/A"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {order?.orderDate &&
                      format(new Date(order.orderDate), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {order.email}
                  </TableCell>
                  <TableCell>
                    <PriceFormatter
                      amount={order?.totalPrice}
                      className="text-black font-medium"
                    />
                  </TableCell>
                  <TableCell>
                    {/* Status Utama */}
                    <div className="flex flex-col gap-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(order?.status)}`}
                      >
                        {getFriendlyStatus(order?.status)}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="hidden sm:table-cell">
                    {order?.invoice ? order.invoice.number : "—"}
                  </TableCell>
                  <TableCell className="flex items-center justify-center gap-2">
                    {order.status === "pending" && order.paymentUrl && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePay(order);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Bayar Sekarang
                      </Button>
                    )}
                    <X
                      size={20}
                      className="group-hover:text-red-500 hoverEffect"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (order._id) {
                          await handleDelete(order._id);
                        } else {
                          toast.error("ID pesanan tidak ditemukan.");
                        }
                      }}
                    />
                  </TableCell>
                </TableRow>
              </TooltipTrigger>
              <TooltipContent>
                <p>Klik untuk lihat detail pesanan</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </TableBody>

      <OrderDetailDialog
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </>
  );
};

export default OrdersComponent;
