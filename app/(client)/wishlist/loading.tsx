import Container from "@/components/Container";
import { Skeleton } from "@/components/ui/skeleton";

export default function WishlistLoading() {
  return (
    <Container>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="border-b">
            <tr className="bg-black/5">
              <th className="p-2 text-left">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="p-2 text-left hidden md:table-cell">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="p-2 text-left hidden md:table-cell">
                <Skeleton className="h-4 w-12" />
              </th>
              <th className="p-2 text-left hidden md:table-cell">
                <Skeleton className="h-4 w-14" />
              </th>
              <th className="p-2 text-left">
                <Skeleton className="h-4 w-14" />
              </th>
              <th className="p-2 text-center md:text-left">
                <Skeleton className="h-4 w-20" />
              </th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-b">
                <td className="px-2 py-4 flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-20 w-20 rounded-md hidden md:block" />
                  <Skeleton className="h-4 w-32" />
                </td>
                <td className="p-2 hidden md:table-cell">
                  <Skeleton className="h-3 w-20" />
                </td>
                <td className="p-2 hidden md:table-cell">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="p-2 hidden md:table-cell">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="p-2">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="p-2">
                  <Skeleton className="h-9 w-full rounded" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-2 my-5">
        <Skeleton className="h-10 w-28 rounded" />
      </div>
    </Container>
  );
}
