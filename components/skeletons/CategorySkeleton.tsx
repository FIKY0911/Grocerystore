import { Skeleton } from "@/components/ui/skeleton";

const CategoryCardSkeleton = () => {
  return (
    <div className="bg-shop_lighter_bg p-5 flex items-center gap-3 rounded-lg">
      <Skeleton className="w-20 h-20" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
};

interface CategorySkeletonProps {
  count?: number;
}

const CategorySkeleton = ({ count = 6 }: CategorySkeletonProps) => {
  return (
    <div className="bg-white border border-shop_light_green/20 my-10 md:my-20 p-5 lg:p-7 rounded-md">
      <Skeleton className="h-6 w-40 mb-3" />
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(count)].map((_, index) => (
          <CategoryCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

export { CategoryCardSkeleton };
export default CategorySkeleton;
