import Container from "@/components/Container";
import { Skeleton } from "@/components/ui/skeleton";

export default function DealLoading() {
  return (
    <div className="py-10 bg-deal-bg">
      <Container>
        {/* Title skeleton */}
        <Skeleton className="h-5 w-64 mb-5" />

        {/* Products grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-4">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="text-sm border-[1px] rounded-md border-darkBlue/20 bg-white"
            >
              {/* Image */}
              <div className="relative bg-shop_light_bg p-4">
                <Skeleton className="w-full h-64 rounded-md" />
              </div>

              {/* Content */}
              <div className="p-3 flex flex-col gap-2">
                {/* Category */}
                <Skeleton className="h-3 w-20" />

                {/* Title */}
                <Skeleton className="h-4 w-full" />

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, j) => (
                      <Skeleton key={j} className="h-4 w-4 rounded-full" />
                    ))}
                  </div>
                  <Skeleton className="h-3 w-16" />
                </div>

                {/* Stock */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-4 w-8" />
                </div>

                {/* Price */}
                <Skeleton className="h-5 w-24" />

                {/* Button */}
                <Skeleton className="h-9 w-36 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
