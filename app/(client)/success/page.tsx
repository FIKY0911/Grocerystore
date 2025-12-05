"use client";

import useStore from "@/store";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { motion } from "motion/react";
import { Check, Home, Package, ShoppingBag } from "lucide-react";
import Link from "next/link";

const SuccessPageContent = () => {
  const { resetCart } = useStore();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  useEffect(() => {
    if (orderNumber) {
      resetCart();
    }
  }, [orderNumber, resetCart]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl w-full"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 bg-black rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg"
        >
          <Check className="text-white w-12 h-12 stroke-[3]" />
        </motion.div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-6">
          Order Confirmed!
        </h1>

        {/* Description */}
        <div className="space-y-4 mb-8">
          <p className="text-gray-600 text-center max-w-lg mx-auto">
            Terima kasih atas pesanan Anda! Pesanan Anda sedang diproses.
            Silakan lanjutkan pembayaran untuk menyelesaikan transaksi.
          </p>

          {/* Order Number */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-500 text-center mb-1">
              Order Number:
            </p>
            <p className="text-lg font-semibold text-gray-900 text-center break-all">
              {orderNumber}
            </p>
          </div>

          {/* Payment Info */}
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <p className="text-sm text-yellow-800 text-center">
              💳 <strong>Status:</strong> Menunggu Pembayaran
            </p>
            <p className="text-xs text-yellow-700 text-center mt-2">
              Klik tombol <strong>Orders</strong> di bawah untuk melihat detail pesanan dan melanjutkan pembayaran.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/"
            className="flex items-center justify-center px-6 py-3 font-semibold bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Home
          </Link>
          <Link
            href="/orders"
            className="flex items-center justify-center px-6 py-3 font-semibold bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <Package className="w-5 h-5 mr-2" />
            Orders
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center px-6 py-3 font-semibold bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Shop
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            💡 View your order details and transaction history on the{" "}
            <Link
              href="/orders"
              className="text-green-600 hover:text-green-700 font-semibold underline"
            >
              Orders
            </Link>{" "}
            page
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const SuccessPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
};

export default SuccessPage;

