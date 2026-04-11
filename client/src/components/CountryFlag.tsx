"use client";

import { Country, getCountryFlag, getCountryLabel } from "@/constants/regions";

export function CountryFlag({
  country,
  showLabel = true,
  showDelay = false,
}: {
  country?: Country;
  showLabel?: boolean;
  showDelay?: boolean;
}) {
  if (!country) return null;

  const flag = getCountryFlag(country);
  const label = getCountryLabel(country);
  const hasDelay = country === "benin" && showDelay;

  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl">{flag}</span>
      {showLabel && (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {hasDelay && (
            <span className="flex items-center gap-1 text-xs text-amber-600">
              ⏱️ Délai d&apos;expédition
            </span>
          )}
        </div>
      )}
    </div>
  );
}
