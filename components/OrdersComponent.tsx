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
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import OrderDetailDialog from "./OrderDetailDialog";
import { deleteOrder } from "@/action/deleteOrder";
import { updateOrderStatus } from "@/action/updateOrderStatus";
import { Button } from "./ui/button";
import Script from "next/script";

declare global {
  interface Window {
    snap: any;
  }
}

// Fungsi bantu: dapatkan kelas warna berdasarkan status
const getStatusBadgeClass = (status: string | null | undefined) => {
  if (!status) return "bg-gray-100 text-gray-800";

  switch (status.toLowerCase()) {
    case "paid":
    case "settlement":
    case "capture":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
    case "cancel":
    case "deny":
    case "expire":
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
    settlement: "Lunas (Midtrans)",
    capture: "Dibayar (Capture)",
    deny: "Ditolak",
    cancel: "Dibatalkan",
    expire: "Kedaluwarsa",
  };

  return map[status.toLowerCase()] || status.charAt(0).toUpperCase() + status.slice(1);
};

const OrdersComponent = ({ orders }: { orders: MY_ORDERS_QUERYResult }) => {
  const [selectedOrder, setSelectedOrder] = useState<
    MY_ORDERS_QUERYResult[number] | null
  >(null);
  const [showMidtransScript, setShowMidtransScript] = useState(false);

  const handleDelete = async (orderId: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus pesanan ini?")) {
      try {
        const result = await deleteOrder(orderId);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        console.error("Error deleting order:", error);
        toast.error("Gagal menghapus pesanan.");
      }
    }
  };

  const handlePay = async (order: MY_ORDERS_QUERYResult[number]) => {
    if (!order.snapToken) {
      toast.error("Snap token tidak ditemukan untuk pesanan ini.");
      return;
    }

    setShowMidtransScript(true);

    // Ensure Midtrans Snap script is loaded before proceeding
    const checkMidtrans = setInterval(() => {
      if (window.snap) {
        clearInterval(checkMidtrans);
        window.snap.pay(order.snapToken, {
          onSuccess: async function (result: any) {
            toast.success("Pembayaran berhasil!");
            await updateOrderStatus(order._id!, "paid", result.transaction_status);
            // Optionally refresh the page or re-fetch orders
            window.location.reload();
          },
          onPending: async function (result: any) {
            toast("Pembayaran Anda tertunda.");
            await updateOrderStatus(order._id!, "pending", result.transaction_status);
            window.location.reload();
          },
          onError: async function (result: any) {
            toast.error("Pembayaran gagal.");
            await updateOrderStatus(order._id!, "failed", result.transaction_status);
            window.location.reload();
          },
          onClose: function () {
            /* You may add your own implementation here */
            toast("Anda menutup pop-up pembayaran tanpa menyelesaikan transaksi.");
          },
        });
      }
    }, 100);
  };

  return (
    <>
      {showMidtransScript && (
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="afterInteractive"
        />
      )}
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
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(order?.status)}`}>
                        {getFriendlyStatus(order?.status)}
                      </span>
                      {/* Status Midtrans (opsional) */}
                      {order?.midtransStatus && (
                        <span className="text-[10px] text-gray-500 mt-0.5">
                          Midtrans: {order.midtransStatus}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="hidden sm:table-cell">
                    {order?.invoice ? order.invoice.number : "—"}
                  </TableCell>
                  <TableCell
                    className="flex items-center justify-center gap-2"
                  >
                    {order.status === "pending" && order.snapToken && (
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

