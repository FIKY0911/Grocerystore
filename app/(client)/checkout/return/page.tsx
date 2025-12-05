// app/checkout/return/page.tsx
"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CheckoutReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    if (orderId) {
      // Redirect ke halaman sukses dengan format yang benar
      router.push(`/success?orderNumber=${orderId}`);
    } else {
      router.push("/cart");
    }
  }, [orderId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg">Memproses pembayaran...</p>
    </div>
  );
}

export default function CheckoutReturn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutReturnContent />
    </Suspense>
  );
}
