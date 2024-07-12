"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import React from "react";

const sortingOptions = [
  { value: "price-asc", label: "Sort by price(asc)" },
  { value: "price-desc", label: "Sort by price(desc)" },
  { value: "created_at-asc", label: "Sort by created at(asc)" },
  { value: "created_at-desc", label: "Sort by created at(desc)" },
  { value: "rating-asc", label: "Sort by rating (asc)" },
  { value: "rating-desc", label: "Sort by rating (desc)" },
];

function SortBy() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const searchParams = new URLSearchParams(params);

  // An function to create the resulting query string
  const createQueryString = React.useCallback(
    (currentPage: string, name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (name === "sortBy" && value) {
        params.set(name, value);
        params.set("page", "1");
      } else {
        params.delete(name);
        params.set("page", "1");
      }
      return currentPage + "?" + params.toString();
    },
    [searchParams]
  );

  const handleSortingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const result = createQueryString(pathname, "sortBy", e.target.value);

    router.push(result);
  };

  return (
    <div className="text-black flex gap-2">
      <p className="text-white text-lg">Sort By</p>
      <select
        name="sorting"
        id="sorting"
        value={String(searchParams.get("sortBy"))}
        onChange={handleSortingChange}
      >
        <option value="">None</option>
        {sortingOptions.map((option, i) => {
          return (
            <option key={i} value={option.value}>
              {option.label}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export default SortBy;
