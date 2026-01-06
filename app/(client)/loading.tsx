import Container from "@/components/Container";
import { BannerSkeleton, ProductGridSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <Container>
      {/* Banner Skeleton */}
      <BannerSkeleton />

      {/* ProductGrid Skeleton with Tab */}
      <div className="flex flex-col lg:px-0 my-10">
        {/* Tab bar skeleton */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-md flex-shrink-0" />
          ))}
        </div>
        <ProductGridSkeleton count={10} />
      </div>

      {/* HomeCategories Skeleton */}
      <div className="bg-white border border-shop_light_green/20 my-10 md:my-20 p-5 lg:p-7 rounded-md">
        <Skeleton className="h-6 w-40 mb-3 border-b pb-3" />
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-shop_lighter_bg p-5 flex items-center gap-3 rounded-lg">
              <Skeleton className="w-20 h-20" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ShopByBrands Skeleton */}
      <div className="my-10">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>

      {/* LatestBlog Skeleton */}
      <div className="my-10">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
