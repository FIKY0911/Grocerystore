import { Skeleton } from "@/components/ui/skeleton";

const OrderCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header - Date & Status */}
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>

      {/* Products */}
      <div className="space-y-3 mb-4">
        {[...Array(2)].map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="w-16 h-16 rounded-md flex-shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>

      {/* Shipper */}
      <div className="flex items-center gap-2 mb-3 pb-3 border-b">
        <Skeleton className="w-4 h-4 rounded" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Address */}
      <div className="flex items-start gap-2 mb-3 pb-3 border-b">
        <Skeleton className="w-4 h-4 rounded mt-0.5" />
        <div className="space-y-1 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between pt-3 border-t">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-28" />
      </div>

      {/* Actions */}
      <div className="mt-4 pt-3 border-t space-y-2">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
};

export default OrderCardSkeleton;
