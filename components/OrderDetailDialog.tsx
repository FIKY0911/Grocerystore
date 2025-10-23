import { MY_ORDERS_QUERYResult } from "@/sanity.types";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import PriceFormatter from "./PriceFormatter";

interface MidtransSnap {
  pay: (token: string) => void;
}

declare global {
  interface Window {
    snap: MidtransSnap;
  }
}

interface OrderDetailsDialogProps {
  order: MY_ORDERS_QUERYResult[number] | null;
  isOpen: boolean;
  onClose: () => void;
}

// Fungsi bantu: ubah status jadi teks ramah
const getFriendlyStatus = (status: string | null | undefined) => {
  if (!status) return "Tidak diketahui";
  const map: Record<string, string> = {
    paid: "Lunas",
    pending: "Menunggu Pembayaran",
    cancelled: "Dibatalkan",
    processing: "Diproses",
    shipped: "Dikirim",
    delivered: "Diterima",
  };
  return map[status.toLowerCase()] || status;
};

const OrderDetailDialog: React.FC<OrderDetailsDialogProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!order) return null;

  const handlePay = () => {
    if (order.snapToken && window.snap) {
      window.snap.pay(order.snapToken, {
        onSuccess: function(result: any){
          /* You may add your own implementation here */
          alert("payment success!"); console.log(result);
          onClose(); // Close dialog on success
          // Optionally, refresh the page or order list to show updated status
          window.location.reload();
        },
        onPending: function(result: any){
          /* You may add your own implementation here */
          alert("wating your payment!"); console.log(result);
          onClose(); // Close dialog on pending
        },
        onError: function(result: any){
          /* You may add your own implementation here */
          alert("payment failed!"); console.log(result);
        },
        onClose: function(){
          /* You may add your own implementation here */
          alert('you closed the popup without finishing the payment');
        }
      });
    } else {
      alert("Snap token not available or Midtrans Snap.js not loaded.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Pesanan - {order.orderNumber}</DialogTitle>
        </DialogHeader>

        {/* Info Umum */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>Pelanggan:</strong> {order.customerName}</p>
            <p><strong>Email:</strong> {order.email}</p>
            <p><strong>Tanggal:</strong> {order.orderDate ? new Date(order.orderDate).toLocaleDateString("id-ID") : "–"}</p>
            
            <p className="mt-2">
              <strong>Status Pesanan:</strong>{" "}
              <span className={`font-medium ${
                order.status === "paid" ? "text-green-600" :
                order.status === "pending" ? "text-yellow-600" :
                order.status === "cancelled" ? "text-red-600" : "text-gray-600"
              }`}>
                {getFriendlyStatus(order.status)}
              </span>
            </p>

            {order.midtransTransactionId && (
              <p className="text-sm text-gray-600 mt-1">
                <strong>ID Transaksi Midtrans:</strong> {order.midtransTransactionId}
              </p>
            )}
            {order.midtransStatus && (
              <p className="text-sm text-gray-600">
                <strong>Status Midtrans:</strong> {order.midtransStatus}
              </p>
            )}
          </div>

          {/* Alamat Pengiriman */}
          <div className="border rounded-md p-3 bg-gray-50">
            <h3 className="font-semibold mb-2">Alamat Pengiriman</h3>
            {order.address ? (
              <>
                <p><strong>{order.address.name}</strong></p>
                <p>{order.address.address}</p>
                <p>{order.address.city}, {order.address.state} {order.address.zip}</p>
              </>
            ) : (
              <p className="text-gray-500">Alamat tidak tersedia</p>
            )}
          </div>
        </div>

        {/* Invoice Button */}
        {order?.invoice?.hosted_invoice_url && (
          <div className="mt-4">
            <Button asChild variant="outline" size="sm">
              <Link href={order.invoice.hosted_invoice_url} target="_blank" rel="noopener noreferrer">
                Unduh Invoice
              </Link>
            </Button>
          </div>
        )}

        {/* Tombol Bayar Sekarang untuk pesanan pending */}
        {order.status === "pending" && order.snapToken && (
          <div className="mt-4">
            <Button onClick={handlePay} className="bg-shop_dark_green hover:bg-shop_dark_green/90 text-white" size="sm">
                Bayar Sekarang
            </Button>
          </div>
        )}

        {/* Daftar Produk */}
        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              <TableHead>Produk</TableHead>
              <TableHead>Kuantitas</TableHead>
              <TableHead>Harga Satuan</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.products?.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="flex items-center gap-3">
                  {item?.product?.images?.[0] && (
                    <Image
                      src={urlFor(item.product.images[0]).url()}
                      alt={item.product.name || "Produk"}
                      width={50}
                      height={50}
                      className="border rounded-sm object-cover"
                    />
                  )}
                  <span>{item?.product?.name || "Produk tidak ditemukan"}</span>
                </TableCell>
                <TableCell>{item?.quantity}</TableCell>
                <TableCell>
                  <PriceFormatter amount={item?.priceAtPurchase || 0} />
                </TableCell>
                <TableCell>
                  <PriceFormatter amount={(item?.priceAtPurchase || 0) * (item?.quantity || 0)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Ringkasan Harga */}
        <div className="mt-4 text-right">
          <div className="w-56 space-y-1">
            {order.amountDiscount && order.amountDiscount > 0 && (
              <>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <PriceFormatter amount={(order.totalPrice || 0) + (order.amountDiscount || 0)} />
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Diskon:</span>
                  <PriceFormatter amount={order.amountDiscount} />
                </div>
              </>
            )}
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <PriceFormatter amount={order.totalPrice || 0} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailDialog;
