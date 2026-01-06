import Container from "@/components/Container";
import { ProductGridSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function ShopLoading() {
  return (
    <div className="border-t bg-white">
      <Container className="mt-5">
        {/* Header */}
        <div className="relative px-6 top-0 z-20 bg-shop_lightColor/10 py-3 border-b border-shop_dark_green/20">
          <Skeleton className="h-6 w-80" />
        </div>

        <div className="flex flex-col md:flex-row gap-5 border-t border-t-shop_dark_green/50">
          {/* Sidebar skeleton */}
          <div className="md:min-w-64 pb-5 md:border-r border-r-shop_btn_dark_green/50 pt-5">
            {/* Category List */}
            <div className="space-y-3 mb-6">
              <Skeleton className="h-5 w-24 mb-3" />
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>

            {/* Brand List */}
            <div className="space-y-3 mb-6">
              <Skeleton className="h-5 w-20 mb-3" />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>

            {/* Price List */}
            <div className="space-y-3">
              <Skeleton className="h-5 w-16 mb-3" />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          </div>

          {/* Products grid skeleton */}
          <div className="flex-1 pt-5">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="text-sm border-[1px] rounded-md border-darkBlue/20 bg-white">
                  <Skeleton className="w-full h-64 rounded-t-md" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, j) => (
                        <Skeleton key={j} className="h-4 w-4 rounded-full" />
                      ))}
                    </div>
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-9 w-36 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
