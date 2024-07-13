"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import React from "react";

/**
 * Sorting options for the product list.
 */
const sortingOptions = [
  { value: "price-asc", label: "Sort by price(asc)" },
  { value: "price-desc", label: "Sort by price(desc)" },
  { value: "created_at-asc", label: "Sort by created at(asc)" },
  { value: "created_at-desc", label: "Sort by created at(desc)" },
  { value: "rating-asc", label: "Sort by rating (asc)" },
  { value: "rating-desc", label: "Sort by rating (desc)" },
];

/**
 * Component to allow sorting of the product list.
 */
function SortBy() {
  const router = useRouter(); // Router instance from Next.js
  const pathname = usePathname(); // Current pathname
  const params = useSearchParams(); // Search parameters
  const searchParams = new URLSearchParams(params); // Parsed search parameters

  // An function to create the resulting query string
  const createQueryString = React.useCallback(
    (currentPage: string, name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (name === "sortBy" && value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }

      params.set("page", "1"); // Always reset page to 1 when changing things in sort
      return currentPage + "?" + params.toString();
    },
    [searchParams]
  );

  /**
   * Handle change of sorting option.
   * @param e - The event object.
   */
  const handleSortingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const result = createQueryString(pathname, "sortBy", e.target.value);

    router.push(result); // Redirect to new page with updated sorting option
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
