/** Shimmer placeholders that mirror the shape of the content they replace. */
export function HomeSkeleton() {
  return (
    <div className="px-5 pt-safe">
      <div className="flex items-center gap-3">
        <div className="skeleton h-11 w-11 rounded-full" />
        <div className="space-y-1.5">
          <div className="skeleton h-2.5 w-20 rounded" />
          <div className="skeleton h-3.5 w-24 rounded" />
        </div>
      </div>
      <div className="skeleton mt-5 h-44 w-full rounded-card" />
      <div className="skeleton mt-4 h-14 w-full rounded-ctrl" />
      <div className="mt-4 grid grid-cols-4 gap-2.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-[76px] rounded-ctrl" />
        ))}
      </div>
      <div className="skeleton mt-5 h-20 w-full rounded-card" />
      <div className="skeleton mt-5 h-56 w-full rounded-card" />
    </div>
  );
}
