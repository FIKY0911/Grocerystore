"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { client } from "@/sanity/lib/client";
import { MY_ORDERS_QUERY } from "@/sanity/queries/query";
import { MY_ORDERS_QUERYResult } from "@/sanity.types";
import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Package, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import useStore from "@/store";
import OrdersView from "./OrdersView";
import OrderFilters from "@/components/OrderFilters";

const OrdersPage = () => {
  const { user } = useUser();
  const [orders, setOrders] = useState<MY_ORDERS_QUERYResult>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Move useStore to top - before any conditional returns
  const cartItems = useStore((state) => state.items);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const checkPaymentStatus = async (order: any) => {
    if (order.status !== "pending" || !order.paymentUrl) return order;

    try {
      // Extract invoice ID from payment URL
      const invoiceId = order.paymentUrl.split("/").pop();
      if (!invoiceId) return order;

      const response = await fetch("/api/orders/check-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });

      if (response.ok) {
        const { orderStatus } = await response.json();
        if (orderStatus !== order.status) {
          console.log(`💳 Payment status changed: ${order.status} → ${orderStatus}`);
          
          // Show success toast when payment is confirmed
          if (orderStatus === "paid") {
            toast.success("Pembayaran berhasil!");
          }
          
          return { ...order, status: orderStatus };
        }
      }
    } catch (error) {
      console.error("Error checking payment:", error);
    }

    return order;
  };

  const fetchOrders = async (showToast = false) => {
    if (!user?.id) return;

    try {
      if (showToast) setRefreshing(true);

      console.log("🔄 Fetching orders for user:", user.id);
      let data = await client.fetch(MY_ORDERS_QUERY, {
        userId: user.id,
      });

      // Check payment status for pending orders
      const updatedOrders = await Promise.all(
        data.map((order: any) => checkPaymentStatus(order))
      );

      console.log("✅ Orders fetched:", updatedOrders.length, "orders");
      
      // Debug: Log products in each order
      updatedOrders.forEach((order: any, idx: number) => {
        console.log(`\n📦 Order ${idx + 1}:`, {
          orderNumber: order.orderNumber,
          productsCount: order.productsCount || 0,
          productsArrayLength: order.products?.length || 0,
          status: order.status,
        });
        
        if (order.products && order.products.length > 0) {
          console.log('   Products:');
          order.products.forEach((p: any, i: number) => {
            console.log(`   ${i + 1}.`, {
              productName: p.product?.name || '❌ NOT POPULATED',
              quantity: p.quantity,
              priceAtPurchase: p.priceAtPurchase,
              productId: p.product?._id,
              slug: p.product?.slug,
            });
          });
        } else {
          console.log('   ⚠️ NO PRODUCTS IN THIS ORDER!');
        }
      });
      
      setOrders(updatedOrders);

      if (showToast) {
        toast.success(`${data.length} pesanan ditemukan`);
      }
    } catch (error) {
      console.error("❌ Error fetching orders:", error);
      toast.error("Gagal memuat pesanan");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  // Auto-refresh when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && user?.id) {
        console.log("👀 Page visible, refreshing orders...");
        fetchOrders();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user]);

  // Auto-refresh every 3 seconds if there are pending orders
  useEffect(() => {
    const pendingOrders = orders.filter((order) => order.status === "pending");
    
    if (pendingOrders.length === 0) {
      return; // No pending orders, no need to poll
    }

    console.log(`🔄 Auto-refresh enabled: ${pendingOrders.length} pending orders`);

    const interval = setInterval(() => {
      console.log("⏰ Auto-refreshing orders (checking payment status)...");
      fetchOrders();
    }, 3000); // 3 seconds

    return () => {
      console.log("🛑 Auto-refresh disabled");
      clearInterval(interval);
    };
  }, [orders, user]);

  const handleRefresh = () => {
    fetchOrders(true);
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((order) => order._id !== orderId));
  };

  if (loading) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        </div>
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-4">
              You haven&apos;t placed any orders. Start shopping now!
            </p>
            <Link href="/">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  const pendingOrders = orders.filter((order) => order.status === "pending");

  // Filter orders based on status
  const filteredOrders = statusFilter === "all" 
    ? orders 
    : orders.filter((order) => order.status === statusFilter);

  // Count for filters
  const filterCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    paid: orders.filter((o) => o.status === "paid").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  return (
    <div className="bg-white min-h-screen py-8">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-900">Order List</h1>
              {cartCount > 0 && (
                <Link href="/cart">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Cart ({cartCount})
                  </Button>
                </Link>
              )}
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
          
          {/* Pending Orders Alert */}
          {pendingOrders.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-yellow-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Anda memiliki {pendingOrders.length} pesanan yang menunggu pembayaran
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Klik tombol <strong>"Bayar"</strong> untuk melanjutkan pembayaran di Xendit.
                  </p>
                  <p className="text-xs text-yellow-600 mt-2">
                    💡 Status akan otomatis update setelah pembayaran berhasil (auto-refresh setiap 3 detik)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Filters */}
        <OrderFilters
          onFilterChange={setStatusFilter}
          activeFilter={statusFilter}
          counts={filterCounts}
        />

        {/* Orders View */}
        <OrdersView orders={filteredOrders} onDelete={handleDeleteOrder} />

        {/* Footer Info */}
        <div className="mt-4 text-sm text-gray-600">
          {statusFilter === "all" ? (
            <>
              Total: {orders.length} order{orders.length !== 1 ? "s" : ""} 
              {pendingOrders.length > 0 && (
                <span className="ml-2 text-yellow-600">
                  ({pendingOrders.length} pending)
                </span>
              )}
            </>
          ) : (
            <>
              Showing {filteredOrders.length} {statusFilter} order{filteredOrders.length !== 1 ? "s" : ""}
            </>
          )}
        </div>
      </Container>
    </div>
  );
};

export default OrdersPage;
