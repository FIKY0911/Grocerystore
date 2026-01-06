import Container from "@/components/Container";
import { ProductGridSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryLoading() {
  return (
    <Container>
      <div className="py-5 flex flex-col md:flex-row items-start gap-5">
        {/* Category sidebar */}
        <div className="flex flex-col md:min-w-40 border">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border-b last:border-b-0 p-2">
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>

        {/* Products grid */}
        <div className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {[...Array(10)].map((_, i) => (
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
  );
}
