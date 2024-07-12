/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
// import Select from "react-select";
import { MultiSelect, Option } from "react-multi-select-component";
import "rc-slider/assets/index.css";
import { occasionOptions } from "../../constant";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useQueryParams } from "@/hooks/useQueryParams";
const Select = dynamic(() => import("react-select"), { ssr: false });

const discountOptions = [
  { value: "", label: "None" },
  { value: "0-5", label: "From 0% to 5%" },
  { value: "6-10", label: "From 6% to 10%" },
  { value: "11-15", label: "From 11 to 15%" },
];

function Filter({ categories, brands }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useQueryParams();

  const brandsOption: any[] = useMemo(() => {
    return brands.map((brand: any) => ({
      value: brand.id,
      label: brand.name,
    }));
  }, [brands]);

  const categoriesOption: any[] = useMemo(() => {
    return categories.map((category: any) => ({
      value: category.id,
      label: category.name,
    }));
  }, [categories]);

  const occasionOption: any[] = useMemo(() => {
    return occasionOptions.map((item) => {
      return {
        value: item,
        label: item,
      };
    });
  }, []);

  const [selectedGender, setSelectedGender] = useState(
    () => searchParams.get("gender") || ""
  );
  const [sliderValue, setSliderValue] = useState(
    () => searchParams.get("priceRangeTo") || 2000
  );
  const [discountValue, setDiscountValue] = useState(
    () => searchParams.get("discount") || ""
  );
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

  const [sliderChanged, setSliderChanged] = useState(false);

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
                (option) => option.value === +categoryId
              ).label,
            };
          } else {
            return null;
          }
        });
    } else {
      return [];
    }
  });

  const [brandsSelected, setBrandsSelected] = useState(() => {
    if (searchParams.get("brand")) {
      return searchParams
        .get("brand")
        ?.split(",")
        .map((brandId) => {
          if (brandsOption.find((option) => option.value === +brandId)) {
            return {
              value: +brandId,
              label: brandsOption.find((option) => option.value === +brandId)
                .label,
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
      if (!value) return discountOptions[0];
      const [from, to] = value?.split("-");
      return { value, label: `From ${from}% to ${to}%` };
    } else {
      return discountOptions[0];
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
            label: brandsOption.find((option) => option.value === +brandId)
              .label,
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

  // An function to create the resulting query string
  const createQueryString = React.useCallback(
    (currentPage: string, name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
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
        params.delete(name);
      }
      params.set("page", "1");
      return currentPage + "?" + params.toString();
    },
    [searchParams]
  );

  interface IBrandOption {
    value: number;
    label: string;
  }
  function handleBrandsSelect(e: any) {
    setBrandsSelected(e);
    const searchValue = e?.map((o: IBrandOption) => o.value)?.join(",");

    const result = createQueryString(pathname, "brand", searchValue);
    router.push(result);
  }

  function handleCategoriesSelected(e: any) {
    setCategoriesSelected(e);

    const searchValue = e?.map((o: any) => o.value)?.join(",");
    const result = createQueryString(pathname, "category", searchValue);
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
          options={discountOptions}
          name="discount"
          defaultValue={initialDiscountOptions}
          onChange={handleDiscount}
          value={discountOptions?.find((x: any) => x.value === discountValue)}
        />
      </div>
    </div>
  );
}

export default Filter;
