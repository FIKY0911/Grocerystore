import { Skeleton } from "@/components/ui/skeleton";

const ProductCardSkeleton = () => {
  return (
    <div className="text-sm border-[1px] rounded-md border-darkBlue/20 bg-white">
      {/* Image skeleton */}
      <div className="relative bg-shop_light_bg p-4">
        <Skeleton className="w-full h-64 rounded-md" />
      </div>
      
      {/* Content skeleton */}
      <div className="p-3 flex flex-col gap-2">
        {/* Category */}
        <Skeleton className="h-3 w-20" />
        
        {/* Title */}
        <Skeleton className="h-4 w-full" />
        
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-4 rounded-full" />
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
  );
};

export default ProductCardSkeleton;
