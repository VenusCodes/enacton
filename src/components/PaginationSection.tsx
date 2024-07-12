"use client";

import { useRouter, useSearchParams } from "next/navigation";
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

  const query = useSearchParams();
  const searchParams = new URLSearchParams(query);

  function handlePrev() {
    alert("Please update the code.");
  }

  function handleNext() {
    alert("Please update the code.");
  }

  // An function to create the resulting query string
  const createQueryString = React.useCallback(
    (currentPage: string, name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return currentPage + "?" + params.toString();
    },
    [searchParams]
  );

  //function to handle page size change
  function handlePageSizeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const result = createQueryString("products", "pageSize", e.target.value);

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
