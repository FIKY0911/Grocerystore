import { Skeleton } from "@/components/ui/skeleton";

const BannerSkeleton = () => {
  return (
    <div className="py-16 md:py-3.5 bg-shop_light_orange/30 rounded-lg px-10 lg:px-20 flex items-center justify-between">
      <div className="space-y-5 flex-1">
        <div className="space-y-2">
          <Skeleton className="h-7 w-80 bg-gray-300/50" />
          <Skeleton className="h-7 w-56 bg-gray-300/50" />
        </div>
        <Skeleton className="h-12 w-36 rounded-md bg-gray-300/50" />
      </div>
      <Skeleton className="hidden md:block w-96 h-64 rounded-lg bg-gray-300/50" />
    </div>
  );
};

export default BannerSkeleton;
