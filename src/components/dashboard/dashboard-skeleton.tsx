import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="container mx-auto p-4 md:p-8 animate-pulse">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-10 w-28 rounded-full" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mt-6 md:mt-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-6">
              <Skeleton className="h-3 md:h-5 w-1/2" />
              <Skeleton className="h-3 md:h-5 w-3 md:w-5 rounded-full" />
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
              <Skeleton className="h-8 md:h-12 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8">
        <Card className="bg-card/50">
          <CardHeader>
            <Skeleton className="h-5 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
