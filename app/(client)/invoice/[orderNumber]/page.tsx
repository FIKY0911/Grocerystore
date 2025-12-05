// app/invoice/[orderNumber]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Container from "@/components/Container";
import PriceFormatter from "@/components/PriceFormatter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import {
  Calendar,
  CreditCard,
  MapPin,
  Package,
  Truck,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  ExternalLink,
  Wallet,
  Building2,
  Smartphone,
  QrCode,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";

interface InvoiceData {
  order: any;
  xenditInvoice: any;
}

const InvoicePage = () => {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params.orderNumber as string;
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  const fetchInvoice = async () => {
    if (!orderNumber) {
      console.error('❌ Order number is undefined');
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Fetching invoice for order:', orderNumber);
      const response = await fetch(`/api/invoice/${orderNumber}`);
      
      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.message || "Failed to fetch invoice");
      }
      
      const data = await response.json();
      
      // Log untuk debugging
      console.log('📋 Invoice data received:', {
        success: data.success,
        hasOrder: !!data.order,
        hasPaymentUrl: !!data.order?.paymentUrl,
        paymentUrl: data.order?.paymentUrl,
        xenditTransactionId: data.order?.xenditTransactionId,
        hasXenditInvoice: !!data.xenditInvoice,
        xenditInvoiceUrl: data.xenditInvoice?.invoice_url,
      });
      
      setInvoiceData(data);
    } catch (error: any) {
      console.error("❌ Error fetching invoice:", error);
      toast.error(error.message || "Gagal memuat invoice");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (orderNumber) {
      console.log('🚀 Component mounted, order number:', orderNumber);
      fetchInvoice();
    } else {
      console.warn('⚠️ Order number is undefined');
      setLoading(false);
    }
  }, [orderNumber]);

  // Countdown timer
  useEffect(() => {
    if (!invoiceData?.order?.expiryDate || invoiceData?.order?.status !== "pending") {
      return;
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(invoiceData.order.expiryDate).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setTimeLeft("Kadaluarsa");
        clearInterval(timer);
        return;
      }

      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}j ${minutes}m ${seconds}d`);
    }, 1000);

    return () => clearInterval(timer);
  }, [invoiceData]);

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    
    switch (statusLower) {
      case "paid":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Dibayar
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
            <Clock className="w-4 h-4 mr-1" />
            Menunggu Pembayaran
          </Badge>
        );
      case "cancelled":
      case "expired":
        return (
          <Badge className="bg-red-500 hover:bg-red-600 text-white">
            <XCircle className="w-4 h-4 mr-1" />
            {statusLower === "expired" ? "Kadaluarsa" : "Dibatalkan"}
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handlePayNow = () => {
    const paymentUrl = invoiceData?.order?.paymentUrl || 
                       invoiceData?.xenditInvoice?.invoice_url ||
                       (invoiceData?.order?.xenditTransactionId 
                         ? `https://checkout.xendit.co/web/${invoiceData.order.xenditTransactionId}` 
                         : null);
    
    if (paymentUrl) {
      window.open(paymentUrl, "_blank");
      toast.success("Halaman pembayaran dibuka di tab baru");
    } else {
      toast.error("Payment URL tidak tersedia. Silakan hubungi customer service.");
      console.error("Payment URL tidak ditemukan:", {
        order: invoiceData?.order,
        xenditInvoice: invoiceData?.xenditInvoice,
      });
    }
  };

  const handleCheckStatus = async () => {
    setRefreshing(true);
    await fetchInvoice();
    toast.success("Status invoice diperbarui");
  };

  // Handle missing order number
  if (!orderNumber) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Order Number Tidak Valid</h2>
            <p className="text-gray-600 mb-4">
              Order number tidak ditemukan di URL.
            </p>
            <Button onClick={() => router.push("/orders")}>
              Lihat Pesanan Saya
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat invoice...</p>
            <p className="mt-2 text-sm text-gray-500">Order: {orderNumber}</p>
          </div>
        </div>
      </Container>
    );
  }

  if (!invoiceData?.order) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Invoice Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-4">
              Invoice dengan nomor <strong>{orderNumber}</strong> tidak ditemukan.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Order mungkin belum dibuat atau sudah dihapus.
            </p>
            <Button onClick={() => router.push("/orders")}>
              Lihat Pesanan Saya
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  const { order } = invoiceData;
  const isPending = order.status === "pending";
  const isPaid = order.status === "paid";
  
  // Get payment URL from multiple sources
  const paymentUrl = order?.paymentUrl || 
                     invoiceData?.xenditInvoice?.invoice_url ||
                     (order?.xenditTransactionId 
                       ? `https://checkout.xendit.co/web/${order.xenditTransactionId}` 
                       : null);
  
  // Log payment URL untuk debugging
  useEffect(() => {
    if (paymentUrl) {
      console.log('✅ Payment URL tersedia:', paymentUrl);
    } else {
      console.warn('⚠️ Payment URL tidak tersedia:', {
        orderPaymentUrl: order?.paymentUrl,
        xenditInvoiceUrl: invoiceData?.xenditInvoice?.invoice_url,
        xenditTransactionId: order?.xenditTransactionId,
      });
    }
  }, [paymentUrl, order, invoiceData]);

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <Container>
        {/* Alert Status */}
        {isPending && (
          <Alert className="mb-6 border-yellow-500 bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <div className="flex items-center justify-between">
                <span>
                  Invoice ini akan kadaluarsa dalam <strong>{timeLeft}</strong>
                </span>
                <Button
                  size="sm"
                  onClick={handlePayNow}
                  className="bg-yellow-600 hover:bg-yellow-700 ml-4"
                >
                  Bayar Sekarang
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {isPaid && (
          <Alert className="mb-6 border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Pembayaran berhasil! Terima kasih atas pesanan Anda.
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Invoice Pembayaran</h1>
              <p className="text-gray-600">
                Nomor Pesanan: <span className="font-semibold">{order.orderNumber}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                ID Transaksi: <span className="font-mono text-xs">{order.xenditTransactionId}</span>
              </p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
              {getStatusBadge(order.status)}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCheckStatus}
                  disabled={refreshing}
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
                  {refreshing ? "Memuat..." : "Cek Status"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Instructions - Only show for pending */}
            {isPending && (
              <Card className="border-2 border-green-500">
                <CardHeader className="bg-green-50">
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <Info className="w-5 h-5" />
                    Cara Pembayaran
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Payment Gateway Xendit - Embedded */}
                    {(() => {
                      const paymentUrl = invoiceData?.order?.paymentUrl || 
                                       invoiceData?.xenditInvoice?.invoice_url ||
                                       (invoiceData?.order?.xenditTransactionId 
                                         ? `https://checkout.xendit.co/web/${invoiceData.order.xenditTransactionId}` 
                                         : null);
                      
                      // Debug log
                      console.log('💳 Payment URL Debug:', {
                        paymentUrl,
                        orderPaymentUrl: invoiceData?.order?.paymentUrl,
                        xenditInvoiceUrl: invoiceData?.xenditInvoice?.invoice_url,
                        xenditTransactionId: invoiceData?.order?.xenditTransactionId,
                        constructedUrl: invoiceData?.order?.xenditTransactionId 
                          ? `https://checkout.xendit.co/web/${invoiceData.order.xenditTransactionId}` 
                          : null
                      });
                      
                      if (paymentUrl) {
                        return (
                          <div className="space-y-4">
                            {/* Embedded Payment Gateway */}
                            <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
                              <iframe
                                src={paymentUrl}
                                className="w-full h-[700px] border-0"
                                title="Xendit Payment Gateway"
                                allow="payment *; geolocation *; microphone *; camera *"
                                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation allow-popups-to-escape-sandbox allow-modals"
                                loading="eager"
                              />
                            </div>
                            
                            {/* Fallback Button */}
                            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                              <p className="text-sm text-gray-700 mb-3 text-center">
                                Atau klik tombol di bawah untuk membuka di tab baru:
                              </p>
                              <Button
                                size="lg"
                                onClick={handlePayNow}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                              >
                                <ExternalLink className="w-5 h-5 mr-2" />
                                Buka di Tab Baru
                              </Button>
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                            <p className="text-sm text-gray-700 mb-3">
                              Payment URL tidak tersedia. Silakan hubungi customer service atau coba refresh halaman.
                            </p>
                            <Button
                              size="lg"
                              onClick={handleCheckStatus}
                              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold"
                              disabled={refreshing}
                            >
                              <RefreshCw className={`w-5 h-5 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                              {refreshing ? "Memuat..." : "Refresh Halaman"}
                            </Button>
                          </div>
                        );
                      }
                    })()}

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-3 text-gray-700">
                        Metode Pembayaran yang Tersedia:
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {order.availableBanks?.length > 0 && (
                          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <Building2 className="w-5 h-5 text-blue-600" />
                            <span className="text-sm">Virtual Account (Bank Transfer)</span>
                          </div>
                        )}
                        {order.availableEwallets?.length > 0 && (
                          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <Wallet className="w-5 h-5 text-purple-600" />
                            <span className="text-sm">E-Wallet (OVO, Dana, LinkAja)</span>
                          </div>
                        )}
                        {order.availableRetailOutlets?.length > 0 && (
                          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <Smartphone className="w-5 h-5 text-orange-600" />
                            <span className="text-sm">Retail (Alfamart, Indomaret)</span>
                          </div>
                        )}
                        {order.availableQRCodes?.length > 0 && (
                          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <QrCode className="w-5 h-5 text-green-600" />
                            <span className="text-sm">QRIS</span>
                          </div>
                        )}
                        {!order.shouldExcludeCreditCard && (
                          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <CreditCard className="w-5 h-5 text-red-600" />
                            <span className="text-sm">Kartu Kredit/Debit</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        Setelah pembayaran berhasil, status invoice akan otomatis diperbarui. 
                        Anda juga bisa klik tombol "Cek Status" untuk memperbarui secara manual.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Detail Pesanan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.products?.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-sm transition-shadow"
                    >
                      {item.product?.images?.[0] && (
                        <Image
                          src={urlFor(item.product.images[0]).url()}
                          alt={item.product.name}
                          width={80}
                          height={80}
                          className="rounded-md object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.product?.name}</h3>
                        {item.product?.variant && (
                          <p className="text-sm text-gray-600">
                            Varian: {item.product.variant}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          Jumlah: {item.quantity}x
                        </p>
                      </div>
                      <div className="text-right">
                        <PriceFormatter
                          amount={item.priceAtPurchase * item.quantity}
                          className="font-semibold"
                        />
                        <p className="text-sm text-gray-600">
                          @ <PriceFormatter amount={item.priceAtPurchase} />
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Info */}
            {order.address && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Informasi Pengiriman
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Nama Penerima</p>
                      <p className="font-semibold">{order.address.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Alamat</p>
                      <p className="font-semibold">
                        {order.address.address}, {order.address.city},{" "}
                        {order.address.state} {order.address.zip}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">No. Telepon</p>
                      <p className="font-semibold">{order.address.phone}</p>
                    </div>
                    {order.shipper && (
                      <>
                        <Separator />
                        <div className="flex items-center gap-2">
                          <Truck className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="text-sm text-gray-600">Jasa Pengiriman</p>
                            <p className="font-semibold">{order.shipper.name}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Ringkasan Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <PriceFormatter amount={order.totalPrice} />
                  </div>
                  {order.amountDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Diskon</span>
                      <PriceFormatter amount={-order.amountDiscount} />
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <PriceFormatter
                      amount={order.totalPrice - (order.amountDiscount || 0)}
                      className="text-green-600"
                    />
                  </div>
                  {isPending && (
                    <Button
                      className="w-full mt-4 bg-green-600 hover:bg-green-700"
                      onClick={handlePayNow}
                      size="lg"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Bayar Sekarang
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Informasi Pesanan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600">Tanggal Pesanan</p>
                    <p className="font-semibold">
                      {new Date(order.orderDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {order.expiryDate && isPending && (
                    <div>
                      <p className="text-gray-600">Batas Pembayaran</p>
                      <p className="font-semibold text-red-600">
                        {new Date(order.expiryDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-xs text-red-500 mt-1">
                        Sisa waktu: {timeLeft}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-600">Mata Uang</p>
                    <p className="font-semibold">{order.currency || "IDR"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Pelanggan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-600">Nama</p>
                    <p className="font-semibold">{order.customerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="font-semibold">{order.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/orders")}
          >
            Kembali ke Pesanan
          </Button>
          <Button
            variant="outline"
            onClick={() => window.print()}
          >
            Cetak Invoice
          </Button>
          {isPending && (
            <Button
              onClick={handlePayNow}
              className="bg-green-600 hover:bg-green-700"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Lanjut ke Pembayaran
            </Button>
          )}
        </div>
      </Container>
    </div>
  );
};

export default InvoicePage;
