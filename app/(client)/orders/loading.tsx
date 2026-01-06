import Container from "@/components/Container";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrdersLoading() {
  return (
    <div className="bg-white min-h-screen py-8">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <Skeleton className="h-9 w-32" />
            </div>
            <Skeleton className="h-9 w-24 rounded" />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {["Semua", "Menunggu", "Lunas", "Dibatalkan"].map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex justify-end mb-4">
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9 rounded" />
            <Skeleton className="h-9 w-9 rounded" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-7 gap-4 px-6 py-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>

          {/* Table Rows */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-b border-gray-200 last:border-b-0">
              <div className="grid grid-cols-7 gap-4 px-6 py-4 items-center">
                {/* Tanggal */}
                <Skeleton className="h-4 w-20" />
                
                {/* Nama Barang */}
                <div className="space-y-1">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
                
                {/* Harga */}
                <Skeleton className="h-4 w-20" />
                
                {/* Shipper */}
                <Skeleton className="h-4 w-16" />
                
                {/* Alamat */}
                <div className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-full" />
                </div>
                
                {/* Status */}
                <Skeleton className="h-6 w-20 rounded-full" />
                
                {/* Aksi */}
                <div className="flex gap-2 justify-center">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-5 w-5 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4">
          <Skeleton className="h-4 w-32" />
        </div>
      </Container>
    </div>
  );
}
