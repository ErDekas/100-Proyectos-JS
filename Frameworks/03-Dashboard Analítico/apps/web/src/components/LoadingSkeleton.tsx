export function KpiGridSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card animate-pulse p-4 flex flex-col gap-3">
          <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      ))}
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="card animate-pulse p-5">
      <div className="flex items-center mb-4">
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-3 w-10 bg-slate-200 dark:bg-slate-700 rounded ml-auto" />
      </div>
      <div className="h-[220px] bg-slate-200 dark:bg-slate-700 rounded-lg" />
      <div className="flex gap-4 mt-3">
        <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div className="card animate-pulse p-5">
      <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4 py-2.5 border-b border-slate-200 dark:border-slate-700 last:border-0">
          <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3 w-12 bg-slate-200 dark:bg-slate-700 rounded ml-auto" />
        </div>
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="p-5 flex flex-col gap-4">
      <KpiGridSkeleton />
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2"><ChartSkeleton /></div>
        <div><ChartSkeleton /></div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <TableSkeleton />
        <div className="col-span-1 flex flex-col gap-3">
          <div className="card animate-pulse p-5">
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="h-2 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-2 flex-1 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
          <div className="card animate-pulse p-5">
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1">
                  <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-2 w-20 bg-slate-200 dark:bg-slate-700 rounded mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
