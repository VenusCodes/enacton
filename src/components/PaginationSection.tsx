"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import React from "react";

function PaginationSection({
  lastPage,
  pageNo,
  pageSize,
}: {
  lastPage: number;
  pageNo: number;
  pageSize: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const query = useSearchParams();
  const searchParams = new URLSearchParams(query);

  // An function to create the resulting query string
  const createQueryString = React.useCallback(
    (currentPage: string, name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      // we can handlge page change as normal
      if (name === "page") {
        params.set(name, value);
      } else {
        // to deal with page change on last pages of lower per page count to higher per page count
        params.set(name, value);
        params.set("page", "1");
      }

      return currentPage + "?" + params.toString();
    },
    [searchParams]
  );

  /**
   * Handles the previous page button click event.
   * If the current page is greater than 1, it navigates to the previous page.
   * Otherwise, it displays an alert message.
   */
  function handlePrev() {
    if (pageNo > 1) {
      // Generate the query string for the previous page
      const result = createQueryString(pathname, "page", `${pageNo - 1}`);
      // Navigate to the previous page
      router.push(result);
    } else {
      // Just an extra layer of safety
      alert("You can't go back any further");
    }
  }

  /**
   * Handles the next page button click event.
   * If the current page is less than the last page, it navigates to the next page.
   * Otherwise, it displays an alert message.
   */
  function handleNext() {
    if (pageNo < lastPage) {
      // Generate the query string for the next page
      const result = createQueryString(pathname, "page", `${pageNo + 1}`);
      // Navigate to the next page
      router.push(result);
    } else {
      // Just an extra layer of safety
      alert("You can't go any further");
    }
  }

  /**
   * Handles the page size change event.
   * It generates the query string with the new page size and navigates to the new page.
   *
   * @param {React.ChangeEvent<HTMLSelectElement>} e - The event object.
   */
  function handlePageSizeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    // Generate the query string with the new page size
    const result = createQueryString(pathname, "pageSize", e.target.value);
    // Navigate to the new page
    router.push(result);
  }

  return (
    <div className="mt-12 p-4 bg-gray-800 flex justify-center gap-4 items-center mb-8">
      <select
        value={pageSize}
        name="page-size"
        className="text-black"
        onChange={handlePageSizeChange}
      >
        {["10", "25", "50"].map((val) => {
          return (
            <option key={val} value={val}>
              {val}
            </option>
          );
        })}
      </select>
      <button
        className="p-3 bg-slate-300 text-black disabled:cursor-not-allowed"
        disabled={pageNo === 1}
        onClick={handlePrev}
      >
        &larr;Prev
      </button>
      <p>
        Page {pageNo} of {lastPage}{" "}
      </p>
      <button
        className="p-3 bg-slate-300 text-black disabled:cursor-not-allowed"
        disabled={pageNo === lastPage}
        onClick={handleNext}
      >
        Next&rarr;
      </button>
    </div>
  );
}

export default PaginationSection;
