import Container from "@/components/Container";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <Container className="flex flex-col md:flex-row gap-12 py-15">
      {/* LEFT IMAGE (2/3) */}
      <div className="w-full md:w-2/3 flex items-center justify-center">
        <div className="w-full rounded-2xl shadow-sm border border-gray-100 bg-white overflow-hidden">
          <Skeleton className="w-full aspect-square" />
          {/* Thumbnail images */}
          <div className="flex gap-2 p-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="w-16 h-16 rounded-md" />
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT CONTENT (1/2) */}
      <div className="w-full md:w-1/2 flex flex-col gap-7">
        {/* Title & Description */}
        <div className="space-y-3">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-4 rounded-full" />
            ))}
            <Skeleton className="h-4 w-10 ml-1" />
          </div>
        </div>

        {/* Price & Stock */}
        <div className="space-y-3 border-t border-b border-gray-200 py-5">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Skeleton className="flex-1 h-11 rounded-lg" />
          <Skeleton className="h-11 w-11 rounded-lg" />
        </div>

        {/* Characteristics */}
        <div className="rounded-xl border border-gray-100 p-4 shadow-sm bg-white space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>

        {/* Extra Actions */}
        <div className="grid grid-cols-2 gap-3 py-5 border-t border-b border-gray-200">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>

        {/* Delivery Info */}
        <div className="flex flex-col divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-3 p-4">
            <Skeleton className="h-7 w-7 rounded" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <Skeleton className="h-7 w-7 rounded" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
