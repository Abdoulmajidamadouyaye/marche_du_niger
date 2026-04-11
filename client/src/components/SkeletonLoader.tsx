"use client";

export function SkeletonLoader({
  type = "card",
  count = 1,
}: {
  type?: "card" | "text" | "line" | "table-row" | "image";
  count?: number;
}) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (type === "card") {
    return (
      <div className="space-y-4">
        {items.map((i) => (
          <div key={i} className="animate-pulse rounded-lg bg-slate-200 p-4">
            <div className="mb-3 h-6 w-3/4 rounded bg-slate-300"></div>
            <div className="mb-2 h-4 w-full rounded bg-slate-300"></div>
            <div className="mb-2 h-4 w-5/6 rounded bg-slate-300"></div>
            <div className="h-8 w-1/4 rounded bg-slate-300"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "table-row") {
    return (
      <div className="space-y-2">
        {items.map((i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="h-10 w-10 rounded bg-slate-200"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-slate-200"></div>
              <div className="h-4 w-1/2 rounded bg-slate-200"></div>
            </div>
            <div className="h-10 w-20 rounded bg-slate-200"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "image") {
    return (
      <div className="space-y-4">
        {items.map((i) => (
          <div
            key={i}
            className="aspect-video w-full animate-pulse rounded-lg bg-slate-200"
          ></div>
        ))}
      </div>
    );
  }

  if (type === "text") {
    return (
      <div className="space-y-2 animate-pulse">
        {items.map((i) => (
          <div key={i} className="h-4 w-full rounded bg-slate-200"></div>
        ))}
      </div>
    );
  }

  if (type === "line") {
    return (
      <div className="space-y-1 animate-pulse">
        {items.map((i) => (
          <div key={i} className="h-3 w-full rounded bg-slate-200"></div>
        ))}
      </div>
    );
  }

  return null;
}
