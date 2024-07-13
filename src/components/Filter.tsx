/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
// import Select from "react-select";
import { MultiSelect, Option } from "react-multi-select-component";
import "rc-slider/assets/index.css";
import { occasionOptions } from "../../constant";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useQueryParams } from "@/hooks/useQueryParams";
import { IOption } from "@/types";
const Select = dynamic(() => import("react-select"), { ssr: false });

/**
 * Discount options for the product list.
 */
const DISCOUNT_OPTIONS: IOption[] = [
  { value: "", label: "None" },
  { value: "0-5", label: "From 0% to 5%" },
  { value: "6-10", label: "From 6% to 10%" },
  { value: "11-15", label: "From 11 to 15%" },
];

/**
 * Filter component for the products page
 * @param {Array} props.categories - The categories for the filter
 * @param {Array} props.brands - The brands for the filter
 */
function Filter({ categories, brands }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useQueryParams();

  /**
   * The options for the brands filter
   * @type {Array}
   */
  const brandsOption: IOption[] = useMemo(() => {
    return brands.map(
      (brand: any) =>
        ({
          value: brand.id,
          label: brand.name,
        } as IOption)
    ) as IOption[];
  }, [brands]);

  /**
   * The options for the categories filter
   * @type {Array}
   */
  const categoriesOption: IOption[] = useMemo(() => {
    return categories.map(
      (category: any) =>
        ({
          value: category.id,
          label: category.name,
        } as IOption)
    ) as IOption[];
  }, [categories]);

  /**
   * The options for the occasion filter
   * @type {Array}
   */
  const occasionOption: IOption[] = useMemo(() => {
    return occasionOptions.map((item) => {
      return {
        value: item,
        label: item,
      } as IOption;
    }) as IOption[];
  }, []);

  /**
   * The selected gender filter value
   * @type {string}
   */
  const [selectedGender, setSelectedGender] = useState(
    () => searchParams.get("gender") || ""
  );
  /**
   * The selected slider value
   * @type {number}
   */
  const [sliderValue, setSliderValue] = useState(
    () => searchParams.get("priceRangeTo") || 2000
  );
  /**
   * The selected discount filter value
   * @type {string}
   */
  const [discountValue, setDiscountValue] = useState(
    () => searchParams.get("discount") || ""
  );
  /**
   * The selected occasion filter value
   * @type {Array}
   */
  const [occasionValue, setOccasionValue] = useState(() => {
    if (searchParams.get("occasion")) {
      return searchParams
        .get("occasion")
        ?.split(",")
        .map((item) => {
          if (occasionOption?.find((option) => option.value === item)) {
            return {
              value: item,
              label: item,
            };
          } else {
            return null;
          }
        });
    } else {
      return [];
    }
  });

  /**
   * Whether the slider value has changed
   * @type {boolean}
   */
  const [sliderChanged, setSliderChanged] = useState(false);

  /**
   * The selected categories filter value
   * @type {Array}
   */

  /**
   * The selected categories filter value
   * @type {Array}
   */
  const [categoriesSelected, setCategoriesSelected] = useState(() => {
    if (searchParams.get("category")) {
      return searchParams
        .get("category")
        ?.split(",")
        .map((categoryId) => {
          if (categoriesOption.find((option) => option.value === +categoryId)) {
            return {
              value: +categoryId,
              label: categoriesOption.find(
                (option: IOption) => option.value === +categoryId
              )?.label,
            };
          } else {
            return null;
          }
        });
    } else {
      return [];
    }
  });

  /**
   * The selected brands filter value
   * @type {Array}
   */
  const [brandsSelected, setBrandsSelected] = useState(() => {
    if (searchParams.get("brand")) {
      return searchParams
        .get("brand")
        ?.split(",")
        .map((brandId) => {
          if (brandsOption.find((option) => option.value === +brandId)) {
            return {
              value: +brandId,
              label: brandsOption.find(
                (option: IOption) => option.value === +brandId
              )?.label,
            };
          } else {
            return null;
          }
        });
    } else {
      return [];
    }
  });

  const initialDiscountOptions = useMemo(() => {
    if (searchParams.get("discount")) {
      const value = searchParams.get("discount");
      if (!value) return DISCOUNT_OPTIONS[0];
      const [from, to] = value?.split("-");
      return { value, label: `From ${from}% to ${to}%` };
    } else {
      return DISCOUNT_OPTIONS[0];
    }
  }, []);

  const initialBrandOptions = useMemo(() => {
    if (searchParams.get("brandId")) {
      return searchParams
        .get("brandId")
        ?.split(",")
        .map((brandId) => {
          return {
            value: +brandId,
            label: brandsOption.find(
              (option: IOption) => option.value === +brandId
            )?.label,
          };
        });
    } else {
      return [];
    }
  }, [brandsOption]);

  const initialOccasionOptions = useMemo(() => {
    if (searchParams.get("occasion")) {
      return searchParams
        .get("occasion")
        ?.split(",")
        .map((item) => ({ value: item, label: item }));
    } else {
      return [];
    }
  }, []);

  useEffect(() => {
    if (sliderChanged) {
      const handler = setTimeout(() => {
        // setSliderValue(tempSliderValue);
        searchParams.delete("page");
        searchParams.delete("pageSize");
        searchParams.set("priceRangeTo", `${sliderValue}`);
        router.push(`/products?${searchParams.toString()}`, { scroll: false });
      }, 300);

      return () => clearTimeout(handler);
    }
  }, [sliderValue]);

  /**
   * Creates a new query string by modifying the existing search parameters.
   *
   * @param {string} currentPage - The current page URL.
   * @param {string} name - The name of the parameter to modify.
   * @param {string} value - The new value for the parameter.
   * @returns {string} The modified query string.
   */
  const createQueryString = React.useCallback(
    (currentPage: string, name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      // If the value is provided, update the parameter or remove it.
      if (value) {
        // If the parameter is one of the special ones, update it.
        if (
          [
            "brand",
            "category",
            "priceRangeTo",
            "gender",
            "discount",
            "occasion",
          ].includes(name)
        ) {
          params.set(name, value);
        } else {
          params.delete(name);
        }
      } else {
        // If no value is provided, remove the parameter.
        params.delete(name);
      }

      // Always reset the page to 1 when modifying other parameters.
      params.set("page", "1");

      return currentPage + "?" + params.toString();
    },
    [searchParams]
  );

  /**
   * Handle the change of the brand select.
   *
   * @param {any} e - The event object.
   */
  function handleBrandsSelect(e: any) {
    // Update the state with the selected brands.
    setBrandsSelected(e);

    // Get the values of the selected brands.
    const searchValue = e?.map((o: IOption) => o.value)?.join(",");

    // Create the modified query string.
    const result = createQueryString(pathname, "brand", searchValue);

    // Redirect to the new page with the modified query string.
    router.push(result);
  }

  /**
   * Handle the change of the categories select.
   *
   * @param {any} e - The event object.
   */
  function handleCategoriesSelected(e: any) {
    // Update the state with the selected categories.
    setCategoriesSelected(e);

    // Get the values of the selected categories.
    const searchValue = e?.map((o: any) => o.value)?.join(",");

    // Create the modified query string.
    const result = createQueryString(pathname, "category", searchValue);

    // Redirect to the new page with the modified query string.
    router.push(result);
  }

  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    setSliderValue(e.target.value);

    const result = createQueryString(pathname, "priceRangeTo", e.target.value);
    router.push(result);
  }

  const handleGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedGender(e.target.value);

    const result = createQueryString(pathname, "gender", e.target.value);
    router.push(result);
  };

  function handleOccasions(e: any) {
    setOccasionValue(e);

    const searchValue = e?.map((o: any) => o.value)?.join(",");
    const result = createQueryString(pathname, "occasion", searchValue);
    router.push(result);
  }

  function handleDiscount(e: any) {
    setDiscountValue(e.value);

    const result = createQueryString(pathname, "discount", e.value);
    router.push(result);
  }

  // function handleClearAll() {
  //   searchParams.delete("categoryId");
  //   searchParams.delete("brandId");
  //   searchParams.delete("priceRangeTo");
  //   searchParams.delete("gender");
  //   searchParams.delete("occasions");
  //   searchParams.delete("discount");
  //   router.push(`/products?${searchParams.toString()}`);
  // }

  return (
    <div className="w-full">
      {/* <button className="bg-white p-2 my-4 text-black" onClick={handleClearAll}>
        Clear All
      </button> */}
      {/* <p className="text-lg">Filter By</p> */}
      <div className="w-1/4 flex  items-center gap-4 mb-4">
        <span>Brands</span>
        <Select
          className="flex-1 text-black"
          options={brandsOption}
          isMulti
          name="brands"
          onChange={handleBrandsSelect}
          defaultValue={initialBrandOptions}
          value={brandsSelected}
        />
      </div>
      <div className="w-1/3 flex items-center gap-4 mb-4">
        <span>Categories</span>
        <MultiSelect
          className="text-black flex-1"
          options={categoriesOption}
          value={categoriesSelected as []}
          labelledBy="categories select"
          hasSelectAll={false}
          onChange={handleCategoriesSelected}
        />
      </div>
      <div>
        <span>Select products from Range 1 to 2000</span>
        <br />
        <span>Current Value {sliderValue}</span> <br />
        <input
          type="range"
          step="50"
          min="100"
          max="2000"
          value={sliderValue}
          onChange={handleSlider}
        />
      </div>
      <div>
        Select Gender: <br />
        <input
          type="radio"
          id="none"
          name="gender"
          value=""
          checked={selectedGender === ""}
          onChange={handleGenderChange}
        />
        <label htmlFor="none">None</label> <br />
        <input
          type="radio"
          id="men"
          name="gender"
          value="men"
          checked={selectedGender === "men"}
          onChange={handleGenderChange}
        />
        <label htmlFor="men">Men</label>
        <br />
        <input
          type="radio"
          id="women"
          name="gender"
          value="women"
          checked={selectedGender === "women"}
          onChange={handleGenderChange}
        />
        <label htmlFor="women">Women</label>
        <br />
        <input
          type="radio"
          id="boy"
          name="gender"
          value="boy"
          checked={selectedGender === "boy"}
          onChange={handleGenderChange}
        />
        <label htmlFor="boy">Boy</label>
        <br />
        <input
          type="radio"
          id="girl"
          name="gender"
          value="girl"
          checked={selectedGender === "girl"}
          onChange={handleGenderChange}
        />
        <label htmlFor="girl">Girl</label>
      </div>
      <div className="w-1/4 flex  items-center gap-4 mb-4">
        <span>Occasion</span>
        <Select
          className="flex-1 text-black"
          options={occasionOption}
          isMulti
          name="occasion"
          onChange={handleOccasions}
          defaultValue={initialOccasionOptions}
          value={occasionValue}
        />
      </div>

      <div className="w-1/4 flex  items-center gap-4 mb-4">
        <span>Filter By discount</span>
        <Select
          className="flex-1 text-black"
          options={DISCOUNT_OPTIONS}
          name="discount"
          defaultValue={initialDiscountOptions}
          onChange={handleDiscount}
          value={DISCOUNT_OPTIONS?.find((x: any) => x.value === discountValue)}
        />
      </div>
    </div>
  );
}

export default Filter;
