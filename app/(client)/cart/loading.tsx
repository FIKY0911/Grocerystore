import Container from "@/components/Container";
import { Skeleton } from "@/components/ui/skeleton";

export default function CartLoading() {
  return (
    <div className="bg-gray-50 pb-52 md:pb-10">
      <Container>
        {/* Header */}
        <div className="flex items-center gap-2 py-5">
          <Skeleton className="w-6 h-6" />
          <Skeleton className="h-7 w-40" />
        </div>

        <div className="grid lg:grid-cols-3 md:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 rounded-lg">
            <div className="border bg-white rounded-md">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border-b p-2.5 last:border-b-0 flex items-center justify-between gap-5">
                  <div className="flex flex-1 items-start gap-2 h-36 md:h-44">
                    <Skeleton className="w-32 md:w-40 h-32 md:h-40 rounded-md" />
                    <div className="h-full flex flex-1 flex-col justify-between py-1">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-start justify-between h-36 md:h-44 p-0.5 md:p-1">
                    <Skeleton className="h-6 w-24" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-6 w-8" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </div>
                </div>
              ))}
              <div className="mt-6 p-2.5">
                <Skeleton className="h-10 w-full rounded" />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-5">
            {/* Order Summary */}
            <div className="hidden md:block w-full bg-white p-6 rounded-lg border">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-14" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="border-t pt-4 flex justify-between">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-28" />
                </div>
                <Skeleton className="h-12 w-full rounded-full" />
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-white rounded-md border p-6">
              <Skeleton className="h-5 w-36 mb-4" />
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
                <Skeleton className="h-10 w-full rounded mt-4" />
              </div>
            </div>

            {/* Shipper Card */}
            <div className="bg-white rounded-md border p-6">
              <Skeleton className="h-5 w-32 mb-4" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
