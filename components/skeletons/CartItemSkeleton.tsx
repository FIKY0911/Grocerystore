import { Skeleton } from "@/components/ui/skeleton";

const CartItemSkeleton = () => {
  return (
    <div className="flex items-center gap-4 p-4 border-b">
      {/* Image */}
      <Skeleton className="w-20 h-20 rounded-md flex-shrink-0" />
      
      {/* Content */}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-24" />
      </div>
      
      {/* Quantity controls */}
      <div className="flex items-center gap-2">
        <Skeleton className="w-8 h-8 rounded" />
        <Skeleton className="w-8 h-8" />
        <Skeleton className="w-8 h-8 rounded" />
      </div>
      
      {/* Delete button */}
      <Skeleton className="w-8 h-8 rounded" />
    </div>
  );
};

interface CartSkeletonProps {
  count?: number;
}

const CartSkeleton = ({ count = 3 }: CartSkeletonProps) => {
  return (
    <div className="space-y-0">
      {[...Array(count)].map((_, index) => (
        <CartItemSkeleton key={index} />
      ))}
      {/* Cart summary skeleton */}
      <div className="p-4 space-y-3 border-t mt-4">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex justify-between pt-2 border-t">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-28" />
        </div>
        <Skeleton className="h-12 w-full rounded-md mt-4" />
      </div>
    </div>
  );
};

export { CartItemSkeleton };
export default CartSkeleton;
